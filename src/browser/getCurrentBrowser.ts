import ExecutionRuntime from "../ExecutionRuntime.js";
import type { BrowserRuntime } from "../types.js";

export default function getCurrentBrowser(): BrowserRuntime | undefined {
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
