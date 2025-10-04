# Frontend/Browser Usage

**TLDR**

You need to configure specific response headers for any route/page that uses `js-randomness-predictor`.

**Extended explanation:**

Our core dependency, Z3, is written in C++ and uses PThreads (multithreaded), which is ultimately compiled to WebAssembly (aka WASM). You need COOP (Cross-Origin Opener Policy) and COEP (Cross-Origin Embedder Policy) headers when using WebAssembly modules that rely on `SharedArrayBuffer` — or, more generally, when your WASM code depends on shared memory, threading, or features that use Atomics (such as PThreads).

---

# Demos

[We have plenty of examples here](https://github.com/matthewoestreich/js-randomness-predictor-demos/tree/main), which show you how to use `js-randomness-predictor` in the browser.

---

# Using with a bundler

If you are using a framework this applies to you (eg. React, Vue, Svelte). You'll need to specifically import the `browser` build:

```js
import JSRandomnessPredictor from "js-randomness-predictor/browser";
```

# CDN : using via &lt;script&gt; tag

You can use `jsDelivr` (or any CDN that automatically serves files from GitHub)

For example, `jsDelivr` : `"https://cdn.jsdelivr.net/npm/js-randomness-predictor@latest/dist/umd/js-randomness-predictor.min.js"`

```html
<script src="https://cdn.jsdelivr.net/npm/js-randomness-predictor@latest/dist/umd/js-randomness-predictor.min.js"></script>
```

---

# Server Control

The biggest difference in setups is whether or not you control the server where you will be hosting your site. Specifically, being able to modify response headers.

## I Do NOT Control the Server

If you're using GitHub pages, etc.. [using a service worker is your only option](#service-worker).

## I Control the Server

Using Vercel, Render, Netlify, etc.. should allow you to either host your own server (Express, etc..) or, at the very least, set response headers.

### Setting Response Headers

**If you are abe to set response headers**, you'll need to set the following response headers on the page/route you are using `js-randomness-predictor` on:

```
Cross-Origin-Opener-Policy: "same-origin"
Cross-Origin-Embedder-Policy: "require-corp"
```

### Service Worker

**If you are NOT able to set response headers, but still control the server**, you are required to use a service worker.

The specific type of service worker you need is called a **COOP/COEP service worker**. The role a **COOP/COEP service worker** is to add the `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers on the "fly".

[You can find the same service worker that we use for our GitHub pages demo(s) here, if you'd like to use it.](https://github.com/matthewoestreich/js-randomness-predictor/blob/main/.github/coi.serviceworker.js)
