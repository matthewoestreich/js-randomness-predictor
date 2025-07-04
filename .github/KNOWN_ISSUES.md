# Node/V8

## Random Number Pool Exhaustion

Due to how Node/V8 generates random numbers, the "length of sequence" + "number of predictions" cannot exceed 64. Meaning, if you provide 4 numbers within the sequence, the max numbers you can successfully predict is 60. (sequence length [4] + number of predictions = 64).

If "length of sequence" + "number of predictions" exceeds 64, you will be warned about this, and "number of predictions" will be truncated to allow for accurate predictions.

If "length of sequence" is >= 64, we will throw an error.

# Firefox

## Random Number Generation in Console

You must disable "Instant Evaluation", otherwise your predictions may show incorrectly. Especially if you use more than one call to generate the initial sequence + expected values.

<img width="1920" alt="Firefox_DisableConsoleInstantEvaluation" src="/.github/Firefox_DisableConsoleInstantEvaluation.png" />

**If you do not want to disable "Instant Evaluation"**, you'll need to generate initial sequence + expected values in one command.

So instead of using two (or more) calls to `Math.random`:

```js
/** Pretend this is the console */
// Output used as initial sequence.
Array.from({ length: 4 }, Math.random);
// Output used for validating predictions.
Array.from({ length: 10 }, Math.random);
```

You'll need to do:

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
