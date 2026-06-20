<h1 align="center">
  <a href="https://matthewoestreich.github.io/js-randomness-predictor-demos/">Live Demo</a>
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/js-randomness-predictor">
    <img src="https://img.shields.io/npm/v/js-randomness-predictor.svg?logo=npm&color=cb0000" alt="npm version" />
  </a>
</p>

---

# How Does it Work?

[You can read more about how a Predictor works under the hood here.](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/HOW_DOES_IT_WORK.md)

# Important Info

- Having trouble? [See all known issues here](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md)
- Use the predictor that matches the environment where the sequence was originally generated. **Meaning, if it came from Chrome, use the Chrome predictor, etc...**.

**Recommended Initial Sequence Length**

| Runtime               | Length |
| --------------------- | ------ |
| Deno, Chrome, Firefox | 4      |
| Node                  | 5      |
| Bun, Safari           | 6      |

**Breaking Changes**

Please see the [CHANGELOG](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/CHANGELOG.md) for more detailed info.

- **`v2.x.x`**
  - the V8 Predictor was deprecated! Use the predictor that matches your runtime instead.
- **`v3.x.x`**
  - native runtime support for Bun and Deno
  - you can run the Bun predictor natively in Bun, and the Deno predictor natively in Deno!
- **`v4.x.x`**
  - you no longer need to specify a Node.js version when targeting a version other than the one currently installed.
  - to support automatic version detection, the recommended initial sequence length for Node.js has increased from **4** to **5** values.

# Installation

**Node**

```bash
npm i js-randomness-predictor
yarn add js-randomness-predictor
pnpm add js-randomness-predictor
# etc...
```

**Bun**

```bash
bun add js-randomness-predictor
```

**Deno**

```bash
deno add npm:js-randomness-predictor
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

**Deno**

```js
import JSRandomnessPredictor from "npm:js-randomness-predictor";
```

**Frontend/Browser**

Browser usage is a little painful. :grimacing: [Please see here for more info](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/BROWSER_USAGE.md) **This guide includes dev servers, eg. the dev servers that `vite`, `webpack`, etc.. offer.**

# Node Predictor

**[See known Node issues here](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#node)**

Since we're running in Node, you can dynamically generate the initial sequence by calling the `node()` method without any parameters. This will automatically produce a sequence behind the scenes. **Alternatively, you can manually provide a sequence if you prefer.**
<br/>

## Provide Your Own Sequence

<!-- prettier-ignore -->
```js
// Recommended initial sequence length of 5 values!
const sequence = Array.from({ length: 5 }, Math.random);
const nodePredictor = JSRandomnessPredictor.node(sequence);
const nextPrediction = await nodePredictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

## Automatically Generate Sequence

```js
// Automatically creates sequence behind the scenes
const nodePredictor = JSRandomnessPredictor.node();
const nextPrediction = await nodePredictor.predictNext();
// We can programmatically verify since we are running in Node.
const isAccurate = nextPrediction === Math.random();
```

# Bun Predictor

[See known Bun issues here](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#bun)

**If you are running natively in Bun**, you can either provide your own initial sequence, or allow us to create one behind the scenes for you. **If you are using the Bun Predictor outside of Bun**, you must provide a sequence that was generated in Bun and copied over!

## Provide Your Own Sequence

:exclamation: The initial sequence must contain at least 6 elements! :exclamation:

<!-- prettier-ignore -->
```js
// Sequence must contain at least 6 values!
const sequence = [
  Math.random(), Math.random(), Math.random(),
  Math.random(), Math.random(), Math.random()
];
const bunPredictor = JSRandomnessPredictor.bun(sequence);
const nextPrediction = await bunPredictor.predictNext();
// We can programmatically verify since we are running in Bun.
// **IMPORTANT** : must be running natively in Bun for this to work!
const isAccurate = nextPrediction === Math.random();
```

## Automatically Generate Sequence

```js
// Automatically creates sequence behind the scenes
const bunPredictor = JSRandomnessPredictor.bun();
const nextPrediction = await bunPredictor.predictNext();
// We can programmatically verify since we are running in Bun.
// **IMPORTANT** : must be running natively in Bun for this to work!
const isAccurate = nextPrediction === Math.random();
```

# Deno Predictor

**If you are running natively in Deno**, you can either provide your own initial sequence, or allow us to create one behind the scenes for you. **If you are using the Deno Predictor outside of Deno**, you must provide a sequence that was generated in Deno and copied over!

## Provide Your Own Sequence

<!-- prettier-ignore -->
```js
const sequence = Array.from({ length: 4 }, Math.random);
const denoPredictor = JSRandomnessPredictor.deno(sequence);
const nextPrediction = await denoPredictor.predictNext();
// We can programmatically verify since we are running in Deno.
// **IMPORTANT** : must be running natively in Deno for this to work!
const isAccurate = nextPrediction === Math.random();
```

## Automatically Generate Sequence

```js
// Automatically creates sequence behind the scenes
const denoPredictor = JSRandomnessPredictor.deno();
const nextPrediction = await denoPredictor.predictNext();
// We can programmatically verify since we are running in Deno.
// **IMPORTANT** : must be running natively in Deno for this to work!
const isAccurate = nextPrediction === Math.random();
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

:exclamation: The initial sequence must contain at least 6 elements! :exclamation:

```js
// MUST HAVE AT LEAST 6 ELEMENTS IN SEQUENCE!
const sequence = [...];
const safariPredictor = JSRandomnessPredictor.safari(sequence);
const nextPrediction = await safariPredictor.predictNext();
// You'll need to manually verify accuracy.
```

# Command Line Interface

## Important info

- Each number in the sequence should be separated by a space
- Each flag has a shorthand equivalent

```bash
# To get full list of options
js-randomness-predictor --help

# You can use shorthand for flags.
js-randomness-predictor
  -e <environment>
  [-s <sequence...>]
  [-p <num_predictions>]
  [-x <export_path>]
  [-f <force_export>]
```

## Global Usage

To make the CLI accessible system-wide, install this package globally using the appropriate global flag for your package manager.

```bash
npm i -g js-randomness-predictor
```

## Non-Global Usage

You'll need to manually specify the path within a project that has this package installed.

```bash
# Pretend we are in a project that has this package installed.
$ node_modules/.bin/js-randomness-predictor [options]
```

## Choosing a Runtime

By default, we execute the CLI in Node. If you would like, you can choose to execcute the CLI in Bun or Deno as well.

- If you choose to run the CLI in Bun, you are not required to provide a `--sequence` if `--environment bun` as well
- If you choose to run the CLI in Deno, you are not required to provide a `--sequence` if `--environment deno` as well
- You'll need to set an env variable called `JSRP_RUNTIME` to be `bun`, `deno`, or `node` (is `node` by default)

```bash
# This will use the Bun runtime to run the CLI
$ JSRP_RUNTIME=bun js-randomness-predictor -e bun # `--sequence` not required
$ JSRP_RUNTIME=bun js-randomness-predictor -e deno # ERROR `--sequence` IS required

# This will use the Deno runtime to run the CLI
$ JSRP_RUNTIME=deno js-randomness-predictor -e deno # `--sequence` not required
$ JSRP_RUNTIME=deno js-randomness-predictor -e bun # ERROR `--sequence` IS required

# This will use the Node runtime to run the CLI
$ js-randomness-predictor [args]
```

**Windows is a little different**

```shell
# Via 'cmd'
C:\>set JSRP_RUNTIME=bun && js-randomness-predictor [...]
```

```powershell
# Via 'PowerShell'
PS C:\> $env:JSRP_RUNTIME = "bun" ; js-randomness-predictor [...]
```

## Export Predictor Results

If you want to export results to a file you can use the `--export` (or `-x`) switch. to provide an export path.

- Export path is **relative to the current working directory** (the directory where you are currently running the CLI from)
- The **provided path** must be to a **.json file**
- If the **provided file already exists** we do not overwrite it, **unless the `--force` switch is used**
- If the **full path** you provided **does not exist,** we do not create it, **unless the `--force` switch is used**

## CLI Examples

### Node

When no `--sequence` is provided, a sequence will be generated automatically based on the current runtime.

```bash
# Auto-generate sequence
$ js-randomness-predictor --environment node

# Provide your own sequence and prediction count
$ js-randomness-predictor --environment node --sequence 1 2 3 4
$ js-randomness-predictor --environment node --sequence 1 2 3 4 --predictions 15
```

### Chrome

```bash
# Output 10 predictions by default
$ js-randomness-predictor --environment chrome --sequence 1 2 3 4
# Output 5 predictions
$ js-randomness-predictor --environment chrome --sequence 1 2 3 4 --predictions 5
```

### Firefox

```bash
# Output 10 predictions by default
$ js-randomness-predictor --environment firefox --sequence 1 2 3 4
# Output 5 predictions
$ js-randomness-predictor --environment firefox --sequence 1 2 3 4 --predictions 5
```

### Safari

```bash
# Output 10 predictions by default
$ js-randomness-predictor --environment safari --sequence 1 2 3 4
# Output 5 predictions
$ js-randomness-predictor --environment safari --sequence 1 2 3 4 --predictions 5
```

### Bun

```bash
# Output 10 predictions by default
$ js-randomness-predictor --environment bun --sequence 1 2 3 4
# Output 5 predictions
$ js-randomness-predictor --environment bun --sequence 1 2 3 4 --predictions 5
```

### Deno

```bash
# Output 10 predictions by default
$ js-randomness-predictor --environment deno --sequence 1 2 3 4
# Output 5 predictions
$ js-randomness-predictor --environment deno --sequence 1 2 3 4 --predictions 5
```

# Contributing

## Commit Messages

We follow the **Angular style commit message** convention. The main commit types are:

- `feat:` A new feature.
- `fix:` A bug fix.
- `perf:` A code change that improves performance.
- `build:` Changes that affect the build system or external dependencies (e.g., npm, gulp).
- `ci:` Changes to CI configuration files and scripts (e.g., GitHub Actions, Travis).
- `revert:` Reverts a previous commit.
- `docs:` Documentation-only changes.
- `style:` Changes that do not affect code functionality (e.g., formatting, white-space).
- `refactor:` Code changes that neither fix a bug nor add a feature.
- `test:` Adding or correcting tests.
- `chore:` Other changes that do not modify source or test files.

### Important Notes

- **Breaking Changes:** Must be noted in the commit footer as `BREAKING CHANGE:` to appear in the changelog.
- **Visibility:** By default, only `feat`, `fix`, `perf`, and `BREAKING CHANGE` appear prominently in generated changelogs. Other types are typically ignored unless configured otherwise.

### Examples

#### Feature with scope

feat(cli): add runtime field

#### Bug fix

fix(core): handle edge case in sequence generation

#### Breaking change

feat(cli): change output format

BREAKING CHANGE: removed 'actual' field from CLI output

## JavaScript Engine Sources

- [V8 Source Code](https://source.chromium.org/chromium/chromium/src/+/main:v8)
  - V8 source code is part of the Chromium repo
  - Used by `Node`, `Chrome`, `Deno`
- [SpiderMonkey Source Code](https://github.com/mozilla-firefox/firefox/tree/main/js)
  - SpiderMonkey source code is part of the Firefox repo
  - Used by `Firefox`
- [JavaScriptCore Source Code](https://github.com/WebKit/WebKit/tree/main/Source/JavaScriptCore)
  - JavaScriptCore source code is part of the WebKit repo
  - Used by `Safari`, `Bun`
