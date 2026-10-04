# How a Predictor Works

**At a high level**, a Predictor recovers the **hidden internal state** of the pseudorandom number generator (PRNG) used by a JavaScript engine. Once a state consistent with the observed `Math.random()` outputs has been recovered, the Predictor can advance that state and reproduce future outputs.

> ### The important part
>
> **PRNGs are deterministic — the same initial seed will _always_ produce the same sequence of outputs.**
>
> At a very high level, you can think of the process as:<br> > &nbsp;&nbsp;&nbsp;&nbsp;**find the seed**<br> > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br> > &nbsp;&nbsp;&nbsp;&nbsp;**feed it into the concrete PRNG algorithm**<br> > &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓<br> > &nbsp;&nbsp;&nbsp;&nbsp;**reproduce the sequence of random numbers**

The exact process depends on the JavaScript engine, runtime, and their implementation details. A Predictor therefore uses one or more **solving strategies**, where each strategy describes how a particular engine and runtime transform the PRNG's internal state into a `Math.random()` value.

---

# Understanding JavaScript Random Number Generation

To understand how `js-randomness-predictor` works, we first need to understand what JavaScript actually specifies about random number generation.

## ECMAScript Standard

The [ECMAScript standard for `Math.random`](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-math.random) specifies that:

> This function returns a Number value with positive sign, greater than or equal to +0𝔽 but strictly less than 1𝔽, chosen randomly or pseudo randomly with approximately uniform distribution over that range, using an implementation-defined algorithm or strategy.

The important part is **"implementation-defined algorithm or strategy."**

ECMAScript specifies the properties of the returned value, but it does not require JavaScript engines to use a particular PRNG or a particular method of converting its internal random state into a JavaScript `Number`.

Therefore, a Predictor must model the behavior of the specific JavaScript engine being targeted.

---

# The PRNG Algorithm

At the heart of a PRNG is the algorithm used to generate a deterministic sequence of numbers with statistical properties resembling a uniform random distribution.

**xorshift128+** is a fast, deterministic pseudorandom number generator designed by Sebastiano Vigna. It is a well-established and widely adopted PRNG, and **is used by _all_ of the JavaScript engines currently supported by this library**.

You can read [Vigna's paper on xorshift+ generators here](https://vigna.di.unimi.it/ftp/papers/xorshiftplus.pdf).

At a high level, xorshift128+ maintains an internal state consisting of two 64-bit integers:

```text
s0
s1
```

On each step, the generator:

1. Uses XOR and bit-shift operations to transform the current state.
2. Produces a new pair of state values.
3. Computes a 64-bit output from the resulting state.

Conceptually:

```text
        ┌──────────────┐
        │  s0, s1      │
        └──────┬───────┘
               │
               ▼
       XOR / shift operations
               │
               ▼
        ┌──────────────┐
        │  new s0,s1   │
        └──────┬───────┘
               │
               ▼
          64-bit output
```

Because the PRNG is deterministic, knowing the internal state is enough to reproduce every subsequent output.

The problem is that JavaScript does not expose this state.

---

# Symbolic Modeling

The internal PRNG state is hidden, so simply reading it is not an option.

One approach would be to brute-force the possible 128-bit state space, but that would be astronomically expensive.

Instead, `js-randomness-predictor` **symbolically models the PRNG** using a [custom fork](https://github.com/matthewoestreich/z3) of [Z3](https://github.com/Z3Prover/z3), an [SMT solver](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories) developed by Microsoft Research.

Rather than assigning concrete values to the unknown state, we initially represent the state symbolically:

```text
s0 = unknown 64-bit value
s1 = unknown 64-bit value
```

The operations performed by the PRNG are then represented as constraints.

For example, a symbolic PRNG step represents the same XOR and shift operations performed by the real implementation:

```text
unknown state
     │
     ▼
symbolic XOR/shift operations
     │
     ▼
new symbolic state
```

Each observed `Math.random()` value adds additional constraints to this symbolic state.

After modeling the entire observed sequence, Z3 is asked:

> Is there a PRNG state that could have produced all of these observations?

If the answer is yes, Z3 provides concrete values for the unknown state.

---

# Constraining the PRNG with JavaScript Numbers

The PRNG internally works with 64-bit integers, but `Math.random()` does not return those integers directly.

Instead, JavaScript returns a double-precision floating-point number in the range `[0, 1)`.

For the implementations modeled by the Predictor, the engine takes information from its internal 64-bit PRNG output and converts it into a 53-bit integer, which is then scaled into the `[0, 1)` range.

Conceptually:

```text
64-bit PRNG output
       │
       │ select 53 bits
       ▼
53-bit integer
       │
       │ divide by 2^53
       ▼
Math.random() ∈ [0, 1)
```

This is closely related to the 53 bits of precision available in an IEEE-754 double.

<img width="1920" alt="IEEE754-double-precision-floating-point" src="https://raw.githubusercontent.com/matthewoestreich/js-randomness-predictor/refs/heads/main/.github/Double-Precision-IEEE-754-Floating-Point-Standard-1024x266.jpg" />

Because the conversion preserves information about the underlying PRNG output, an observed `Math.random()` value can be converted back into the corresponding 53-bit observation.

That observation becomes a constraint on the symbolic PRNG state.

For example:

```text
Math.random()
     │
     ▼
recover 53-bit observation
     │
     ▼
constrain symbolic PRNG output
     │
     ▼
constrain symbolic state
```

The Predictor does **not** need to recover all 64 bits of every PRNG output. The information that survives the conversion to a JavaScript `Number` is enough to place strong constraints on the hidden state.

---

# Solving with Multiple Strategies

The exact relationship between the PRNG state and the returned `Math.random()` value can differ between engine implementations, runtime, and versions.

For this reason, a Predictor can contain multiple **solving strategies**.

A strategy describes the complete set of rules needed to model a particular implementation, including:

- How an observed `Math.random()` value is converted back into its integer representation.
- How the symbolic PRNG state advances.
- How the observed output constrains the symbolic state.
- How the concrete PRNG state advances.
- How the concrete state is converted back into a `Math.random()` value.
- How the state relates to the observed sequence.

The Predictor tries these strategies in order:

```text
Observed sequence
       │
       ▼
┌─────────────────────┐
│ Strategy #1         │
└──────────┬──────────┘
           │
        UNSAT?
           │ yes
           ▼
┌─────────────────────┐
│ Strategy #2         │
└──────────┬──────────┘
           │
        UNSAT?
           │ yes
           ▼
┌─────────────────────┐
│ Strategy #3         │
└──────────┬──────────┘
           │
           │ SAT
           ▼
   Recover state
           │
           ▼
      Predict future
```

An `UNSAT` result means that no state exists that satisfies all of the constraints under that strategy.

A `SAT` result means that Z3 found a state consistent with the observations.

This allows the Predictor to support different implementations without requiring the caller to know which internal strategy applies to their runtime.

---

# Solving and Predicting

Once a strategy produces a satisfiable set of constraints, Z3 provides concrete values for the symbolic PRNG state.

The Predictor then uses those values as its **concrete state**.

From this point onward, prediction no longer requires Z3.

The Predictor simply performs the same PRNG operations as the JavaScript engine:

```text
Observed Math.random() values
             │
             ▼
      symbolic modeling
             │
             ▼
          Z3 solver
             │
             ▼
      concrete PRNG state
             │
             ▼
       advance PRNG
             │
             ▼
      produce next value
             │
             ▼
       Math.random()
```

Because the PRNG is deterministic, the recovered state determines all subsequent outputs.

For example:

```javascript
const a = Math.random();
const b = Math.random();
const c = Math.random();
```

If the Predictor is given `a`, `b`, and `c` and successfully recovers a state consistent with those observations, it can reproduce the value that the engine will return for the next call:

```javascript
const d = Math.random();
```

The Predictor can then continue advancing its concrete state to predict additional values.

---

# Why It Works

The fundamental reason prediction is possible is that a PRNG is **deterministic**.

A PRNG can be thought of as a function:

```text
current state
     │
     ▼
next state + output
```

The same state always produces the same next state and output.

Although JavaScript hides this state from the caller, every observed `Math.random()` value leaks information about it.

By combining:

1. The known PRNG algorithm.
2. The known conversion from the PRNG output to `Math.random()`.
3. Multiple observed `Math.random()` values.
4. Symbolic execution of the PRNG.
5. An SMT solver capable of finding states satisfying those constraints.

the Predictor can recover a state consistent with the observations.

Once that state is known, predicting future values is no longer a guessing process.

It is simply running the same deterministic PRNG that the JavaScript engine is running.

```text
                Hidden PRNG State
                       │
                       ▼
              ┌────────────────┐
              │  PRNG algorithm │
              └───────┬────────┘
                      │
                      ▼
                Math.random()
                      │
                      │ observed
                      ▼
              ┌────────────────┐
              │   Predictor    │
              │                │
              │ symbolic model │
              │       +        │
              │      Z3        │
              └───────┬────────┘
                      │
                      ▼
             Consistent PRNG State
                      │
                      ▼
              Future PRNG outputs
                      │
                      ▼
              Future Math.random()
```

The Predictor is therefore not predicting randomness itself. It is recovering enough information about a **deterministic process** to reproduce what that process will do next.
