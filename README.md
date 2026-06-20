<h1 align="center">
  <a href="https://matthewoestreich.github.io/js-randomness-predictor-demos/">Live Demo</a>
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/js-randomness-predictor">
    <img src="https://img.shields.io/npm/v/js-randomness-predictor.svg?logo=npm&color=cb0000" alt="npm version" />
  </a>
</p>

---

# Quick Start

Always use the predictor that matches the environment where the original sequence was generated.

```js
import JSRandomnessPredictor from "js-randomness-predictor";

const predictor = JSRandomnessPredictor.node();
const nextPrediction = await predictor.predictNext();

console.log(nextPrediction);
```

- [How Does It Work?](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/HOW_DOES_IT_WORK.md)
- [Known Issues](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md)
- [Browser Usage Guide](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/BROWSER_USAGE.md)
- [Changelog](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/CHANGELOG.md)

# Breaking Changes

### v4.x.x

- Node.js version no longer needs to be specified.
- Automatic Node.js version detection was added.
- Node.js sequence length increased from **4** to **5**.

### v3.x.x

- Added native Bun support.
- Added native Deno support.

### v2.x.x

- Deprecated the V8 predictor.
- Use runtime-specific predictors instead.

# Installation

## Node

```bash
npm i js-randomness-predictor
yarn add js-randomness-predictor
pnpm add js-randomness-predictor
```

## Bun

```bash
bun add js-randomness-predictor
```

## Deno

```bash
deno add npm:js-randomness-predictor
```

# Usage

## ESM

```js
import JSRandomnessPredictor from "js-randomness-predictor";
```

## CJS

```js
const JSRandomnessPredictor = require("js-randomness-predictor");
```

## Deno

```js
import JSRandomnessPredictor from "npm:js-randomness-predictor";
```

# Predictors

### Runtime Capabilities

| Runtime | Auto Generate Sequence | Recommended Length |
| ------- | ---------------------- | ------------------ |
| Node.js | ✅                     | 5                  |
| Bun     | ✅ Native Bun only     | 6                  |
| Deno    | ✅ Native Deno only    | 4                  |
| Chrome  | ❌                     | 4                  |
| Firefox | ❌                     | 4                  |
| Safari  | ❌                     | 6                  |

### Browser Usage

Browser usage requires additional setup: [browser usage guide](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/BROWSER_USAGE.md).

## Node

- [Known issues](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#node)

**Generate a sequence automatically**:

```js
const predictor = JSRandomnessPredictor.node();
const prediction = await predictor.predictNext();
const isAccurate = prediction === Math.random();
```

**Provide your own sequence**:

```js
const sequence = Array.from({ length: 5 }, Math.random);
const predictor = JSRandomnessPredictor.node(sequence);
const prediction = await predictor.predictNext();
const isAccurate = prediction === Math.random();
```

## Bun

- [Known issues](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#bun)
- If running natively in Bun, a sequence can be generated automatically.
- If using the Bun predictor outside of Bun, you must provide a sequence that was originally generated in Bun.

```js
const predictor = JSRandomnessPredictor.bun();
const prediction = await predictor.predictNext();
const isAccurate = prediction === Math.random();
```

**Provide your own sequence**:

```js
const sequence = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()];
const predictor = JSRandomnessPredictor.bun(sequence);
const prediction = await predictor.predictNext();
const isAccurate = prediction === Math.random();
```

## Deno

- If running natively in Deno, a sequence can be generated automatically.
- If using the Deno predictor outside of Deno, you must provide a sequence that was originally generated in Deno.

```js
const predictor = JSRandomnessPredictor.deno();
const prediction = await predictor.predictNext();
const isAccurate = prediction === Math.random();
```

**Provide your own sequence**:

```js
const sequence = Array.from({ length: 4 }, Math.random);
const predictor = JSRandomnessPredictor.deno(sequence);
const prediction = await predictor.predictNext();
const isAccurate = prediction === Math.random();
```

## Chrome

- [Known issues](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#chrome)

```js
const predictor = JSRandomnessPredictor.chrome(sequence);
const prediction = await predictor.predictNext();
```

## Firefox

- [Known issues](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#firefox)

```js
const predictor = JSRandomnessPredictor.firefox(sequence);
const prediction = await predictor.predictNext();
```

## Safari

- [Known issues](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/KNOWN_ISSUES.md#safari)

```js
const predictor = JSRandomnessPredictor.safari(sequence);
const prediction = await predictor.predictNext();
```

# Command Line Interface

## Global Usage

```bash
npm i -g js-randomness-predictor
```

## Local Usage

- From a project that has `js-randomness-predictor` as a dependency:

```bash
node_modules/.bin/js-randomness-predictor [options]
```

## Help

```bash
js-randomness-predictor --help
```

## Version

```bash
js-randomness-predictor --version
```

## Options

```bash
js-randomness-predictor
  -e <environment>
  [-s <sequence...>]
  [-p <num_predictions>]
  [-x <export_path>]
  [-f <force_export>]
```

## Runtime Selection

- By default, the CLI executes in Node.js.
- Set environment variable `JSRP_RUNTIME` to run the CLI in Bun or Deno.

### Bun

```bash
JSRP_RUNTIME=bun js-randomness-predictor -e bun
JSRP_RUNTIME=bun js-randomness-predictor -e deno --sequence ...
```

### Deno

```bash
JSRP_RUNTIME=deno js-randomness-predictor -e deno
JSRP_RUNTIME=deno js-randomness-predictor -e bun --sequence ...
```

### Windows

cmd:

```cmd
set JSRP_RUNTIME=bun && js-randomness-predictor [...]
```

PowerShell:

```powershell
$env:JSRP_RUNTIME = "bun" ; js-randomness-predictor [...]
```

## Exporting Results

Use `--export` (or `-x`) to write results to a JSON file.

- Path is relative to the current working directory.
- File must have a `.json` extension.
- Existing files are not overwritten unless `--force` is used.
- Missing directories are not created unless `--force` is used.

## Examples

### Node

```bash
js-randomness-predictor -e node
js-randomness-predictor -e node -s 1 2 3 4 5
js-randomness-predictor -e node -s 1 2 3 4 5 -p 15
```

### Chrome

```bash
js-randomness-predictor -e chrome -s 1 2 3 4
js-randomness-predictor -e chrome -s 1 2 3 4 -p 5
```

### Firefox

```bash
js-randomness-predictor -e firefox -s 1 2 3 4
```

### Safari

```bash
js-randomness-predictor -e safari -s 1 2 3 4 5 6
```

### Bun

```bash
js-randomness-predictor -e bun -s 1 2 3 4 5 6
```

### Deno

```bash
js-randomness-predictor -e deno -s 1 2 3 4
```

</br></br></br>

---

# Contributing

## Commit Messages

We follow the **Angular style commit message** convention. The main commit types are:

| Type       | Description               |
| ---------- | ------------------------- |
| `feat`     | New feature               |
| `fix`      | Bug fix                   |
| `perf`     | Performance improvement   |
| `build`    | Build system changes      |
| `ci`       | CI configuration changes  |
| `revert`   | Revert a previous commit  |
| `docs`     | Documentation changes     |
| `style`    | Formatting-only changes   |
| `refactor` | Code restructuring        |
| `test`     | Test changes              |
| `chore`    | Miscellaneous maintenance |

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
