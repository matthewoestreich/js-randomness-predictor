# js-randomness-predictor

[![npm version](https://img.shields.io/npm/v/js-randomness-predictor.svg?logo=npm&color=cb0000)](https://www.npmjs.com/package/js-randomness-predictor)

Predict Math.random output in Node, Chrome, and Firefox

# Installation

Use your favorite package manager.

```bash
npm i js-randomness-predictor
yarn add js-randomness-predictor
pnpm add js-randomness-predictor
# etc...
```

# Usage

```js
// ESM
import JSRandomnessPredictor from "js-randomness-predictor";
// CJS
const JSRandomnessPredictor = require("js-randomness-predictor");
```

## Important

You must use the appropriate predictor for the environment used to generate the initial sequence. **Meaning, if you generated the sequence in Chrome, you must use the Chrome predictor, etc..**

We recommend at least 4 numbers in the initial sequence.

## Chrome Predictor

```js
const chromePredictor = JSRandomnessPredictor.chrome([...]);
const nextPrediction = await chromePredictor.predictNext();
// You'll need to manually verify accuracy.
```

## Firefox Predictor

```js
const firefoxPredictor = JSRandomnessPredictor.firefox([...]);
const nextPrediction = await firefoxPredictor.predictNext();
// You'll need to manually verify accuracy.
```

#### FIREFOX ISSUE WHEN GENERATING NUMBERS IN CONSOLE

You must disable "Instant Evaluation", otherwise your predictions may show incorrectly. Especially if you use more than one call to generate the initial sequence + expected values.

<img width="1920" alt="Firefox_DisableConsoleInstantEvaluation" src="https://github.com/user-attachments/assets/12d93b56-6a7f-4f79-9cf3-957c98fb28ba" />

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

## Node/V8 Predictor

Since we are running in V8, we can produce the initial sequence dynamically by not providing any parameters to the `v8()` method. This will automatically generate a sequence behind the scenes.

Keep in mind, you can manually provide a sequence as well.

### Node/V8 : Provide Your Own Sequence

```js
const manualSequence = Array.from({ length: 4 }, Math.random);
// You could also generate your sequence via Node REPL and provide it that way.
const manualSequence = [
  /* copy/paste numbers generated via REPL */
];
const v8Predictor = JSRandomnessPredictor.v8(manualSequence);
const nextPrediction = await v8Predictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

### Node/V8 : Automatically Generate Sequence

```js
// Automatically create sequence behind the scenes because
// parameter not provided to 'v8' method.
const v8Predictor = JSRandomnessPredictor.v8();
const nextPrediction = await v8Predictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

## Command Line Interface

You can run the predictor from the command line. Each number in the sequence should be separated by a space.

```bash
# To get full list of options
js-randomness-predictor --help
```

### Global Usage

If you want to be able to use the command line from anywhere, you'll need to install this package globally:

```bash
npm i -g js-randomness-predictor
```

### Non-Global Usage

You'll need to manually specify the path to the script in a project that has this package installed.

```bash
# Pretend we are in a project that has this package installed.
node_modules/.bin/js-randomness-predictor [options]
```

### CLI Examples

```bash
# You can use shorthand for flags.
js-randomness-predictor -e <environment> [-s <sequence...>] [-p <num_predictions>]
```

```bash
# If environment is NOT v8, you must provide a sequence.
# Output 10 predictions by default
js-randomness-predictor --environment chrome --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment chrome --sequence 1 2 3 4 --predictions 5
# Output 10 predictions by default
js-randomness-predictor --environment firefox --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment firefox --sequence 1 2 3 4 --predictions 5
# If using v8, and no --sequence is provided, one will be automatically generated
js-randomness-predictor --environment v8
js-randomness-predictor --environment v8 --sequence 1 2 3 4
js-randomness-predictor --environment v8 --sequence 1 2 3 4 --predictions 15
```
