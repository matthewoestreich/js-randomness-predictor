# js-randomness-predictor

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

## Node/V8 Predictor

Since we are running in V8, we can produce the initial sequence dynamically by not providing any parameters to the `v8()` method. This will automatically generate a sequence behind the scenes.

Keep in mind, you can manually provide a sequence as well.

### Node/V8 : Provide Your Own Sequence

```js
const manualSequence = Array.from({ length: 4 }, Math.random);
// You could also generate your sequence via Node REPL and provide it that way.
const manualSequence = [
  /* Copy/Paste Numbers generated via REPL*/
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
# If environment is NOT v8, you must provide a sequence.
# Output 10 predictions by default
js-randomness-predictor --environment chrome --sequence 0.111 0.222 0.333 0.444
# Output 5 predictions
js-randomness-predictor --environment chrome --sequence 0.111 0.222 0.333 0.444 --predictions 5
# Output 10 predictions by default
js-randomness-predictor --environment firefox --sequence 0.111 0.222 0.333 0.444
# Output 5 predictions
js-randomness-predictor --environment firefox --sequence 0.111 0.222 0.333 0.444 --predictions 5
# If using v8, and no --sequence is provided, one will be automatically generated
js-randomness-predictor --environment v8
js-randomness-predictor --environment v8 --sequence 0.111 0.222 0.333 0.444
js-randomness-predictor --environment v8 --sequence 0.111 0.222 0.333 0.444 --predictions 15
```

You can also use shorthand:

```bash
js-randomness-predictor -e <environment> [-s <sequence...>] [-p <num_predictions>]
```
