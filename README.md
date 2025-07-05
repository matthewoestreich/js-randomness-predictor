<h1 align="center">js-randomness-predictor</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/js-randomness-predictor">
    <img src="https://img.shields.io/npm/v/js-randomness-predictor.svg?logo=npm&color=cb0000" alt="npm version" />
  </a>
</p>

<p align="center">
  Predict Math.random output in Node/V8, Chrome, Firefox, and Safari
</p>

---

# Important Info

- Use the predictor that matches the environment where the sequence was originally generated. **Meaning, if it came from Chrome, use the Chrome predictor, etc...**.
- We recommend at least 4 numbers in the initial sequence.
- [See all known issues here](.github/KNOWN_ISSUES.md)

# Installation

Use your favorite package manager.

```bash
npm i js-randomness-predictor
yarn add js-randomness-predictor
pnpm add js-randomness-predictor
# etc...
```

# Usage

**ESM**

```js
import JSRandomnessPredictor from "js-randomness-predictor";
```

**CJS**

```js
const JSRandomnessPredictor = require("js-randomness-predictor");
```

# Node & V8 Predictors

**[See known Node/V8 issues here](.github/KNOWN_ISSUES.md#nodev8)**

Both `JSRandomnessPredictor.v8()` and `JSRandomnessPredictor.node()` target Node.js. You can use them interchangeably.

Since we're running in Node/V8, you can dynamically generate the initial sequence by calling the `v8()` or `node()` method without any parameters. This will automatically produce a sequence behind the scenes. **Alternatively, you can manually provide a sequence if you prefer.**
<br/>

**Node & V8 : Provide Your Own Sequence**

<!-- prettier-ignore -->
```js
const providedSequence = Array.from({ length: 4 }, Math.random);
// Or...
const providedSequence = [/* copy & paste from REPL */];

const v8Predictor = JSRandomnessPredictor.v8(providedSequence);
const nextPrediction = await v8Predictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();

// Node equivalent
const nodePredictor = JSRandomnessPredictor.node(providedSequence);
const nextPrediction = await nodePredictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

**Node & V8 : Automatically Generate Sequence**

```js
// Automatically creates sequence behind the scenes
const v8Predictor = JSRandomnessPredictor.v8();
const nextPrediction = await v8Predictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();

// Node equivalent
const nodePredictor = JSRandomnessPredictor.node();
const nextPrediction = await nodePredictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

**Node & V8 : Targeting a Different Node.js Version**

You can target Node.js versions that are either **older or newer** than your current version.

For example:

- If you're currently running Node.js `v24.x.x` but want to predict values generated in `v22.x.x`
- Or if you're on Node.js `v18.x.x` and want to predict values from a newer version like `v20.x.x`

You can do this via the `setNodeVersion(version)` method.  
Essentially, setting the Node.js version tells the predictor: **"The sequence I provided was generated using Node.js version X."**

⚠️ The provided sequence (and expected sequence) must be generated in the matching Node.js version used in `setNodeVersion(...)`!

<!-- prettier-ignore -->
```js
// Current Node.js: v24.x.x
const v8 = JSRandomnessPredictor.v8(sequenceFromNodeV22);
v8.setNodeVersion({ major: 22, minor: 0, patch: 0 });

const expectedPredictionsFromNodeV22 = [/* Copied from Node.js v22 */];
const nextPrediction = await v8.predictNext();
const isCorrect = expectedPredictionsFromNodeV22[0] === nextPrediction;
```

# Chrome Predictor

**[See known Chrome issues here](.github/KNOWN_ISSUES.md#chrome)**

```js
const chromePredictor = JSRandomnessPredictor.chrome([...]);
const nextPrediction = await chromePredictor.predictNext();
// You'll need to manually verify accuracy.
```

# Firefox Predictor

**[See known Firefox issues here](.github/KNOWN_ISSUES.md#firefox)**

```js
const firefoxPredictor = JSRandomnessPredictor.firefox([...]);
const nextPrediction = await firefoxPredictor.predictNext();
// You'll need to manually verify accuracy.
```

# Safari Predictor

**[See known Safari issues here](.github/KNOWN_ISSUES.md#safari)**

```js
const safariPredictor = JSRandomnessPredictor.safari([...]);
const nextPrediction = await safariPredictor.predictNext();
// You'll need to manually verify accuracy.
```

# Command Line Interface

**Important info**

- Each number in the sequence should be separated by a space
- Each flag has a shorthand equivalent

```bash
# To get full list of options
js-randomness-predictor --help

# You can use shorthand for flags.
js-randomness-predictor -e <environment> [-v <environment-version>] [-s <sequence...>] [-p <num_predictions>]
```

**Global Usage**

To make the CLI accessible system-wide, install this package globally using the appropriate global flag for your package manager.

```bash
npm i -g js-randomness-predictor
```

**Non-Global Usage**

You'll need to manually specify the path within a project that has this package installed.

```bash
# Pretend we are in a project that has this package installed.
node_modules/.bin/js-randomness-predictor [options]
```

## CLI Examples

**Node & V8**

If you're targeting Node.js, you can use either `v8` or `node` as the `--environment`. They are interchangeable.

When no `--sequence` is provided, a sequence will be generated automatically based on the current runtime.

```bash
# Auto-generate sequence
js-randomness-predictor --environment v8

# Provide your own sequence and prediction count
js-randomness-predictor --environment v8 --sequence 1 2 3 4
js-randomness-predictor --environment v8 --sequence 1 2 3 4 --predictions 15

# Equivalent using "node"
js-randomness-predictor --environment node
js-randomness-predictor --environment node --sequence 1 2 3 4
js-randomness-predictor --environment node --sequence 1 2 3 4 --predictions 15
```

**Targeting a Different Node.js Version**

You can target Node.js versions that are either **older or newer** than your current version.

For example:

- If you're currently running Node.js `v24.x.x` but want to predict values generated in `v22.x.x`
- Or if you're on Node.js `v18.x.x` and want to predict values from a newer version like `v20.x.x`

You can do this using the `--env-version` (or `-v`) flag.  
Essentially, this flag tells the predictor: **"The sequence I provided was generated using Node.js version X."**

⚠️ Only the **major version number is needed** for `--env-version` value.

```bash
# Specify environment version explicitly
js-randomness-predictor --environment node --env-version 22 --sequence 1 2 3 4

# Shorthand version
js-randomness-predictor -e node -v 22 -s 1 2 3 4
```

⚠️ If you use `--env-version` with a version different from your current Node.js version, the `--sequence` flag is **required**:

```bash
# Current Node.js: v24.2.0
js-randomness-predictor -e node -v 22 # ERROR!
```

**Chrome**

If the `--env-version` flag is provided and the `--environment` flag is not `node` or `v8`, the `--env-version` flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment chrome --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment chrome --sequence 1 2 3 4 --predictions 5
# --env-version (-v) ignored
js-randomness-predictor -e chrome -v 23 -s 1 2 3 4
```

**Firefox**

If the `--env-version` flag is provided and the `--environment` flag is not `node` or `v8`, the `--env-version` flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment firefox --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment firefox --sequence 1 2 3 4 --predictions 5
# --env-version (-v) ignored
js-randomness-predictor -e firefox -v 23 -s 1 2 3 4
```

**Safari**

If the `--env-version` flag is provided and the `--environment` flag is not `node` or `v8`, the `--env-version` flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment safari --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment safari --sequence 1 2 3 4 --predictions 5
# --env-version (-v) ignored
js-randomness-predictor -e safari -v 23 -s 1 2 3 4
```
