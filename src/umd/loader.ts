// This loader is what allows us to use Z3 via a CDN
// It sets up `window.initZ3` and `window.Module` variables so that we can tap into them while initializing our predictors.
// So now anyone that uses js-randomness-predictor via <script> tag doesn't have to worry about loading Z3 on their own
// servers.
// There are still a ton ov caveats with Z3, though...
export default async function loader(): Promise<void> {
  try {
    const [jsResponse, wasmResponse] = await Promise.all([
      fetch("https://z3-tawny.vercel.app/z3-built.js"),
      fetch("https://z3-tawny.vercel.app/z3-built.wasm"),
    ]);

    if (!jsResponse.ok || !wasmResponse.ok) {
      console.error("js-randomness-predictor Failed to fetch z3 files", { jsResponse: jsResponse.ok, wasmResponse: wasmResponse.ok });
    }

    const jsText = await jsResponse.text();
    const jsBlob = new Blob([jsText], { type: "text/javascript" });

    let mainScriptUrlOrBlob = URL.createObjectURL(jsBlob);

    var Module = {
      locateFile: (path: string, prefix: string) => {
        if (path.endsWith(".wasm")) {
          return "https://z3-tawny.vercel.app/z3-built.wasm";
        }
        return prefix + path;
      },
      wasmBinaryFile: "https://z3-tawny.vercel.app/z3-built.wasm",
      mainScriptUrlOrBlob: mainScriptUrlOrBlob,
      onRuntimeInitialized: () => {
        console.log("js-randomness-predictor initialized.");
      },
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
          setTimeout(() => initialize(), 1000);
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
