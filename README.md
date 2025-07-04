# js-randomness-predictor

[![npm version](https://img.shields.io/npm/v/js-randomness-predictor.svg?logo=npm&color=cb0000)](https://www.npmjs.com/package/js-randomness-predictor)

Predict Math.random output in Node, Chrome, Firefox, and Safari

**NOTE** If you'd like to use native Node.js addons for predictors (meaning, all predictors are written in C++) check out [this repo](https://github.com/matthewoestreich/js-randomness-predictor-cpp)!

# Installation

Use your favorite package manager.

```bash
npm i js-randomness-predictor
yarn add js-randomness-predictor
pnpm add js-randomness-predictor
# etc...
```

# Usage

**IMPORTANT**:

- You must use the appropriate predictor for the environment used to generate the initial sequence. **Meaning, if you generated the sequence in Chrome, you must use the Chrome predictor, etc..**
- We recommend at least 4 numbers in the initial sequence.
- [See all known issues with all predictors here](.github/KNOWN_ISSUES.md)

```js
// ESM
import JSRandomnessPredictor from "js-randomness-predictor";
// CJS
const JSRandomnessPredictor = require("js-randomness-predictor");
```

## Node/V8 Predictor

**[See known Node/V8 issues here](.github/KNOWN_ISSUES.md#nodev8)**

**Note:** you can use `JSRandomnessPredictor.v8()` interchangeably with `JSRandomnessPredictor.node()` - they both target the Node.js environment.

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
// FYI you can also use |.node(...)|
const v8Predictor = JSRandomnessPredictor.node(manualSequence);
const nextPrediction = await v8Predictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

### Node/V8 : Automatically Generate Sequence

```js
// Automatically create sequence behind the scenes because
// parameter not provided to 'v8' method.
const v8Predictor = JSRandomnessPredictor.v8();
// FYI you can also use |.node()|
const v8Predictor = JSRandomnessPredictor.node();
const nextPrediction = await v8Predictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

## Chrome Predictor

```js
const chromePredictor = JSRandomnessPredictor.chrome([...]);
const nextPrediction = await chromePredictor.predictNext();
// You'll need to manually verify accuracy.
```

## Firefox Predictor

**[See known Firefox issues here](.github/KNOWN_ISSUES.md#firefox)**

```js
const firefoxPredictor = JSRandomnessPredictor.firefox([...]);
const nextPrediction = await firefoxPredictor.predictNext();
// You'll need to manually verify accuracy.
```

## Safari Predictor

```js
const safariPredictor = JSRandomnessPredictor.safari([...]);
const nextPrediction = await safariPredictor.predictNext();
// You'll need to manually verify accuracy.
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
js-randomness-predictor -e <environment> [-v <environment-version>] [-s <sequence...>] [-p <num_predictions>]
```

#### Node/V8

If using `v8`/`node`, and no `--sequence` is provided, one will be automatically generated

You can specify `v8` or `node` as the `--environment` when targeting Node.js.

```bash
js-randomness-predictor --environment v8
js-randomness-predictor --environment v8 --sequence 1 2 3 4
js-randomness-predictor --environment v8 --sequence 1 2 3 4 --predictions 15
# Same as
js-randomness-predictor --environment node
js-randomness-predictor --environment node --sequence 1 2 3 4
js-randomness-predictor --environment node --sequence 1 2 3 4 --predictions 15
```

Lets say your current Node.js version is `v24.2.0`, but you wanted to run the predictor against numbers that were generated in Node.js `v22.0.0`.

You can do this by specifying the `--env-version` (or `-v`) flag.

This works both ways - you can provide a version that is greater or less than your current version!

```bash
js-randomness-predictor --environment node --env-version 22 --sequence 1 2 3 4
# Shorthand
js-randomness-predictor -e node -v 22 -s 1 2 3 4
```

If the `--env-version` flag is provided, and it is different than your current Node.js version, then the `--sequence` flag is required!

```bash
# For example, lets say I am on Node.js v24.2.0
js-randomness-predictor -e node -v 22 # ERROR!
```

#### Chrome

If the '--env-version' flag is provided and the '--environment' flag is not 'node' or 'v8', the '--env-version' flag is ignored!

```bash
# If environment is NOT v8, you must provide a sequence.
# Output 10 predictions by default
js-randomness-predictor --environment chrome --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment chrome --sequence 1 2 3 4 --predictions 5
```

#### Firefox

If the '--env-version' flag is provided and the '--environment' flag is not 'node' or 'v8', the '--env-version' flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment firefox --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment firefox --sequence 1 2 3 4 --predictions 5
```

#### Safari

If the '--env-version' flag is provided and the '--environment' flag is not 'node' or 'v8', the '--env-version' flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment safari --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment safari --sequence 1 2 3 4 --predictions 5
```
