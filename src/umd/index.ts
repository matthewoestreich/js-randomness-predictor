import ExecutionRuntime from "../ExecutionRuntime.js";
import JSRandomnessPredictor from "../index.js";
import { BrowserRuntimeType, Predictor, SUPPORTED_BROWSER_RUNTIMES } from "../types.js";
import loader from "./loader.js";

// Invoke immediately upon page load.
loader();

export default JSRandomnessPredictor;

export function getCurrentBrowser(): BrowserRuntimeType | undefined {
  if (ExecutionRuntime.isChrome()) {
    return "chrome";
  }
  if (ExecutionRuntime.isSafari()) {
    return "safari";
  }
  if (ExecutionRuntime.isFirefox()) {
    return "firefox";
  }
  return undefined;
}
