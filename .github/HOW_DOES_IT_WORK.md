# How a Predictor Works

At a high level, a Predictor recovers the **hidden internal state** of the pseudorandom number generator (PRNG) used by a JavaScript engine. With this state known, future `Math.random()` outputs are fully determined and can be reproduced with perfect accuracy.

---

# Understanding JavaScript Random Number Generation

In order to understand how we can predict future random numbers, you must first understand how random number generation works in JavaScript, or more specifically, ECMAScript.

## ECMAScript Standard

The [ECMAScript standard for `Math.random`](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-math.random) specifies that:

> This function returns a Number value with positive sign, greater than or equal to +0𝔽 but strictly less than 1𝔽, chosen randomly or pseudo randomly with approximately uniform distribution over that range, using an implementation-defined algorithm or strategy.

In practice, this means any Predictor must account for how the engine scales its internal PRNG output into the `[0, 1)` range.

## Meet xorshift128+

Most modern JS engines use **xorshift128+**, a PRNG algorithm designed by Sebastiano Vigna. In fact, _all_ JavaScript engines used by the Predictors in this repository implement **xorshift128+**!

Under the hood:

- The internal state consists of **two 64-bit integers** (`s0` and `s1`).
- On each iteration:
  1. A temporary value is derived from `s0`.
  2. The state is updated using a series of XOR and shift operations.
  3. The next random 64-bit integer is computed as the sum of the old and new states.
- This integer is then scaled down to the `[0, 1)` range to comply with the ECMAScript spec.

You can read [Vigna’s paper on xorshift+ generators here](https://vigna.di.unimi.it/ftp/papers/xorshiftplus.pdf).

---

# Symbolic Modeling

Instead of trying to brute force the state of the PRNG (which would be astronomically slow), we **symbolically model** the algorithm using a cusotom fork of [Z3](https://github.com/Z3Prover/z3), an [SMT solver](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories), which is published by Microsoft Research.

- Each part of the [xorshift128+ algorithm](https://en.wikipedia.org/wiki/Xorshift#xorshift+) (shifts, xors, additions) is represented as constraints on unknown 64-bit integers.
- These constraints describe how the internal state evolves with each call to `Math.random()`.
- Z3 then attempts to solve for the initial state that satisfies all observed outputs.
  1. Observed outputs being the numbers provided to a Predictor when it is instantiated. Which we call the **initial sequence**, or simply **sequence**.

This approach turns “guess the hidden state” into “solve a system of equations,” which is vastly more efficient.

**Symbolic State vs Concrete State**

The internal Z3 state is what we call the **symbolic state**. The resolved actual integers, we call the **concrete state**, which is used for future prediction. Using **concrete state** for future prediction is much faster than having to compute **symbolic state** for each prediction.

---

## Constraining with IEEE-754 Mantissas

JavaScript does not expose raw 64-bit integers from the PRNG. Instead, each call to `Math.random()` produces a [double-precision floating-point number](https://en.wikipedia.org/wiki/Double-precision_floating-point_format) in the range `[0, 1)`.

- Doubles are composed of a **sign bit**, an **exponent**, and a **mantissa (significand)**.
- Engines typically fill the mantissa using bits from the PRNG output.
- By extracting the mantissa from observed values, we can reconstruct the hidden constraints on the underlying state, which feed into the symbolic state.

<img width="1920" alt="IEEE754-double-precision-floating-point" src="https://raw.githubusercontent.com/matthewoestreich/js-randomness-predictor/refs/heads/main/.github/Double-Precision-IEEE-754-Floating-Point-Standard-1024x266.jpg" />

---

# Solving and Predicting

Once the constraints are built:

- **Z3** solves for the unknown initial state (`s0`, `s1`) from the symbolic state.
- The resolved values form the **concrete state**, which the Predictor uses to advance the PRNG in software.
- Each subsequent call to the Predictor produces the exact same values as the engine’s `Math.random()`.

If no solution exists, the input sequence was likely too short or did not provide enough entropy to uniquely determine the state.

---

# Why It Works

PRNGs like xorshift128+ are **deterministic**: the same initial state always produces the same sequence. By combining symbolic execution (via Z3) with the floating-point mantissa representation, we can invert `Math.random()` and predict the future with perfect accuracy.
