import ExecutionRuntime from "../ExecutionRuntime.js";
import JSRandomnessPredictor from "../index.js";
import { BrowserRuntimeType } from "../types.js";
import loader from "./loader.js";

// Invoke immediately upon page load.
loader();

function getCurrentBrowser(): BrowserRuntimeType | undefined {
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

export default {
  ...JSRandomnessPredictor,
  getCurrentBrowser,
};
