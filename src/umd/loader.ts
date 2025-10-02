//
// TLDR; This loader is what allows us to use Z3 via a CDN.
//
// It sets up `window.initZ3` and `window.Module` variables so that we can tap into them while initializing our predictors.
// So now anyone that uses js-randomness-predictor via <script> tag doesn't have to worry about loading Z3 on their own
// servers.
//
// Normally, you have to host the z3-built.js and z3-built.wasm files on the same domain as your website due to:
// 1) how z3 looks for the built files (which is not easy to change, hence why we are using a cusotm fork of z3)..
// 2) web/service workers not being able to load the "main" script (z3-built.js) cross-origin
//
// The cross-origin error was something like :
//    "Failed to construct 'Worker': Script at '<cdn_url>/z3-built.js' cannot be accessed from origin 'http://localhost:5555'"
// From there, the issue was getting our predictors (which are tailored to using Node) to recognize the same z3 "Module". Which
// is what the shim solves.
//
// That is what this loader solves. It fetches the z3-built.js file and loads it as a <script> on "this" page via a blob url.
// So now the worker script is also at "locahost:5555" (or whatever page "this" is)..
//
// There are still a ton ov caveats with Z3, though...
//
export default async function loader(): Promise<void> {
  const Z3_BUILT_JS = "https://z3-tawny.vercel.app/z3-built.js";
  const Z3_BUILT_WASM = "https://z3-tawny.vercel.app/z3-built.wasm";

  try {
    const [jsResponse, wasmResponse] = await Promise.all([fetch(Z3_BUILT_JS), fetch(Z3_BUILT_WASM)]);
    if (!jsResponse.ok || !wasmResponse.ok) {
      console.error("js-randomness-predictor Failed to fetch z3 files", { jsResponse: jsResponse.ok, wasmResponse: wasmResponse.ok });
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
        // initZ3 comes from 'z3-built.js', which is the name emscripten gives to it's glue code.
        if (typeof initZ3 === "undefined") {
          setTimeout(() => initialize(), 300);
        } else {
          if (window.initZ3) {
            // @ts-ignore
            window.initZ3 = initZ3;
            return;
          }
        }
      } catch (e) {
        console.error("js-randomness-predictor something went wrong during initialize()", e);
      }
    })();
  } catch (error) {
    console.error("js-randomness-predictor an error occurred during loading:", error);
  }
}
