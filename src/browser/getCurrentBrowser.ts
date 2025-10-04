import ExecutionRuntime from "../ExecutionRuntime.js";
import type { BrowserRuntimeType } from "../types.js";

export default function getCurrentBrowser(): BrowserRuntimeType | undefined {
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
