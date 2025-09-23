<p align="center">
  <a href="https://www.npmjs.com/package/js-randomness-predictor">
    <img src="https://img.shields.io/npm/v/js-randomness-predictor.svg?logo=npm&color=cb0000" alt="npm version" />
  </a>
</p>

---

# Important Info

- Use the predictor that matches the environment where the sequence was originally generated. **Meaning, if it came from Chrome, use the Chrome predictor, etc...**.
- We recommend at least 4 numbers in the initial sequence.
- Breaking changes in `v2.0.0`! The V8 Predictor was deprecated - please use the Node Predictor instead.
- [See all known issues here](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md)

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

# V8 Predictor

Deprecated in `v2.0`. Please use the Node Predictor instead - it works just like the V8 Predictor.

# Node Predictor

**[See known Node issues here](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#node)**

Since we're running in Node, you can dynamically generate the initial sequence by calling the `node()` method without any parameters. This will automatically produce a sequence behind the scenes. **Alternatively, you can manually provide a sequence if you prefer.**
<br/>

**Node : Provide Your Own Sequence**

<!-- prettier-ignore -->
```js
const providedSequence = Array.from({ length: 4 }, Math.random);
// Or...
const providedSequence = [/* copy & paste from REPL */];

const nodePredictor = JSRandomnessPredictor.node(providedSequence);
const nextPrediction = await nodePredictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

**Node : Automatically Generate Sequence**

```js
// Automatically creates sequence behind the scenes
const nodePredictor = JSRandomnessPredictor.node();
const nextPrediction = await nodePredictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

**Node : Targeting a Different Node.js Version**

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
const nodePredictor = JSRandomnessPredictor.node(sequenceFromNodeV22);
nodePredictor.setNodeVersion({ major: 22, minor: 0, patch: 0 });

const expectedPredictionsFromNodeV22 = [/* Copied from Node.js v22 */];
const nextPrediction = await nodePredictor.predictNext();
const isCorrect = expectedPredictionsFromNodeV22[0] === nextPrediction;
```

# Bun Predictor

**Cannot use the Bun predictor natively in Bun because Bun does not support [Z3](https://github.com/Z3Prover/z3)**

```js
const bunPredictor = JSRandomnessPredictor.bun([...]);
const nextPrediction = await bunPredictor.predictNext();
// You'll need to manually verify accuracy.
```

# Deno Predictor

**Cannot use the Deno predictor natively in Deno because Deno does not support [Z3](https://github.com/Z3Prover/z3)**

```js
const denoPredictor = JSRandomnessPredictor.deno([...]);
const nextPrediction = await denoPredictor.predictNext();
// You'll need to manually verify accuracy.
```

# Chrome Predictor

**[See known Chrome issues here](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#chrome)**

```js
const chromePredictor = JSRandomnessPredictor.chrome([...]);
const nextPrediction = await chromePredictor.predictNext();
// You'll need to manually verify accuracy.
```

# Firefox Predictor

**[See known Firefox issues here](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#firefox)**

```js
const firefoxPredictor = JSRandomnessPredictor.firefox([...]);
const nextPrediction = await firefoxPredictor.predictNext();
// You'll need to manually verify accuracy.
```

# Safari Predictor

**[See known Safari issues here](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#safari)**

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

**Node**

When no `--sequence` is provided, a sequence will be generated automatically based on the current runtime.

```bash
# Auto-generate sequence
js-randomness-predictor --environment node

# Provide your own sequence and prediction count
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

If the `--env-version` flag is provided and the `--environment` flag is not `node`, the `--env-version` flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment chrome --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment chrome --sequence 1 2 3 4 --predictions 5
# --env-version (-v) ignored
js-randomness-predictor -e chrome -v 23 -s 1 2 3 4
```

**Firefox**

If the `--env-version` flag is provided and the `--environment` flag is not `node`, the `--env-version` flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment firefox --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment firefox --sequence 1 2 3 4 --predictions 5
# --env-version (-v) ignored
js-randomness-predictor -e firefox -v 23 -s 1 2 3 4
```

**Safari**

If the `--env-version` flag is provided and the `--environment` flag is not `node`, the `--env-version` flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment safari --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment safari --sequence 1 2 3 4 --predictions 5
# --env-version (-v) ignored
js-randomness-predictor -e safari -v 23 -s 1 2 3 4
```

**Bun**

If the `--env-version` flag is provided and the `--environment` flag is not `node`, the `--env-version` flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment bun --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment bun --sequence 1 2 3 4 --predictions 5
# --env-version (-v) ignored
js-randomness-predictor -e bun -v 23 -s 1 2 3 4
```

**Deno**

If the `--env-version` flag is provided and the `--environment` flag is not `node`, the `--env-version` flag is ignored!

```bash
# Output 10 predictions by default
js-randomness-predictor --environment deno --sequence 1 2 3 4
# Output 5 predictions
js-randomness-predictor --environment deno --sequence 1 2 3 4 --predictions 5
# --env-version (-v) ignored
js-randomness-predictor -e deno -v 23 -s 1 2 3 4
```
