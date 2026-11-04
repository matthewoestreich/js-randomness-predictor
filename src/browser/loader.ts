/**
 * TLDR; This loader is what allows us to use Z3 via a CDN.
 *
 * It sets up `window.initZ3` and `window.Module` variables so that we can tap into them while initializing our predictors.
 * So now anyone that uses js-randomness-predictor via a <script> tag doesn't have to worry about loading Z3 on their own
 * servers.
 *
 * Normally, you have to host the z3-built.js and z3-built.wasm files on the same domain as your website due to:
 * 1) How Z3 looks for the built files (which is not easy to change, hence why we are using a custom fork of Z3).
 * 2) Web/service workers not being able to load the "main" script (z3-built.js) cross-origin.
 *
 * The cross-origin error was something like:
 * "Failed to construct 'Worker': Script at '<cdn_url>/z3-built.js' cannot be accessed from origin 'http://localhost:5555'"
 *
 * From there, the issue was getting our predictors (which are tailored to using Node) to recognize the same Z3 "Module".
 * Which is what the shim solves.
 *
 * That is what this loader solves. It fetches the z3-built.js file and loads it as a <script> on "this" page via a blob URL.
 * So now the worker script is also at "localhost:5555" (or whatever page "this" is).
 *
 * There are still a ton of caveats with Z3, though...
 */

let initialization: Promise<void> | undefined;

export default async function loader(): Promise<void> {
  if (!initialization) {
    try {
      initialization = initializeLoader();
    } catch (e: unknown) {
      initialization = undefined;
      throw e;
    }
  }

  return initialization;
}

async function initializeLoader(): Promise<void> {
  const Z3_BUILT_JS = "https://z3-tawny.vercel.app/z3-built.js";
  const Z3_BUILT_WASM = "https://z3-tawny.vercel.app/z3-built.wasm";

  try {
    const [jsResponse, wasmResponse] = await Promise.all([fetch(Z3_BUILT_JS), fetch(Z3_BUILT_WASM)]);

    if (!jsResponse.ok) {
      throw new Error(`Failed to fetch Z3 JavaScript: HTTP ${jsResponse.status}`);
    }
    if (!wasmResponse.ok) {
      throw new Error(`Failed to fetch Z3 WASM: HTTP ${wasmResponse.status}`);
    }

    const jsText = await jsResponse.text();
    const jsBlob = new Blob([jsText], { type: "text/javascript" });
    const mainScriptUrlOrBlob = URL.createObjectURL(jsBlob);

    var Module = {
      locateFile: (path: string, prefix: string) => {
        if (path.endsWith(".wasm")) {
          return Z3_BUILT_WASM;
        }
        return prefix + path;
      },
      onRuntimeInitialized: () => {
        console.log("js-randomness-predictor initialized.");
      },
      onAbort: (reason: unknown) => {
        throw new Error(`js-randomness-predictor aborted initialization! ${String(reason)}`);
      },
      wasmBinaryFile: Z3_BUILT_WASM,
      mainScriptUrlOrBlob,
    };

    // IMPORTANT!!
    window.Module = Module;

    const script = document.createElement("script");
    script.src = mainScriptUrlOrBlob;
    script.id = `z3-built-jsrp`;
    document.body.appendChild(script);

    (function initialize() {
      try {
        // @ts-ignore
        // `initZ3` comes from 'z3-built.js' (lives in the `z3-solver-jsrp` package/dependency), which is the name emscripten gives to it's glue code.
        if (typeof initZ3 === "undefined") {
          setTimeout(() => initialize(), 300);
        } else {
          if (window.initZ3) {
            // @ts-ignore
            // TODO : not sure this is needed, run some tests to make sure.
            window.initZ3 = initZ3;
            return;
          }
        }
      } catch (e) {
        throw new Error("js-randomness-predictor something went wrong during initialize()", {
          cause: e,
        });
      }
    })();
  } catch (error) {
    throw new Error("js-randomness-predictor an error occurred during loading:", {
      cause: error,
    });
  }
}
