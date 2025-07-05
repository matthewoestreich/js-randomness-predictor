# Node/V8

## Random Number Pool Exhaustion

TLDR; If `number of predictions` + `sequence length` > `64`, we cannot make accurate predictions. We call this "pool exhaustion".

**Why does this happen?**

- Node/V8 generate 64 "random" numbers at a time, which they cache in a "pool"
- A seed is used to generate these "random" numbers
- Solving for that seed is what allows us to predict future `Math.random` output
- When you call `Math.random()` they grab a number from this "pool" and return it to you
- When that "pool" is exhausted, they generate a new "pool", **with a new/different seed**
- This means we cannot make accurate predictions for the new pool using the old pools seed

**How we handle it**

- When using the CLI, if `number of predictions` + `sequence length` > `64`, we will show a warning as well as truncate "number of predictions" to be within the allowed bounds.
- For example, if you provided `[1, 2, 3, 4]` as the sequence, which has a length of 4, the max amount of predictions we can successfully make is 60 (because 64 - 4 = 60)
- If the "length of the sequence" **on it's own** is >= 64, we will throw an error because we have no room for predictions, the entire pool was exhausted on the sequence

---

# Firefox

## Random Number Generation in Console

You must disable "Instant Evaluation", otherwise your predictions may show incorrectly. Especially if you use more than one call to generate the initial sequence + expected values.

**How to disable**

<img width="1920" alt="Firefox_DisableConsoleInstantEvaluation" src="/.github/Firefox_DisableConsoleInstantEvaluation.png" />

**If you do not want to disable "Instant Evaluation"**

- You'll need to generate initial sequence + expected values in one command.
- So instead of using two (or more) calls to `Math.random`:

```js
/** Pretend this is the console */
// Output used as initial sequence.
Array.from({ length: 4 }, Math.random);
// Output used for validating predictions.
Array.from({ length: 10 }, Math.random);
```

- You'll need to do:

```js
/** Pretend this is the console */
// Only use one call! Manually separate numbers!
Array.from({ length: 6 }, Math.random);
[
  // --------------------|
  0.5654163987207667, // |
  0.7409356182179403, // | --> Use "these" numbers as initial sequence
  0.46136469064448193, //|
  0.18124646315195891, //|
  // --------------------|
  0.25678544986069995, // --> Use the rest of the numbers for validation
  0.5543550504255771,
];
```

# Safari

NONE

# Chrome

NONE
