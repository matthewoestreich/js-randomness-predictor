import { UnexpectedRuntimeError } from "./errors.js";
import { RuntimeType } from "./types.js";

// Detect the runtime that has been used to invoke us.
export default class ExecutionRuntime {
  // Mimic static class
  private constructor() {}

  static isDeno(): boolean {
    // @ts-ignore
    return typeof globalThis.Deno !== "undefined" && typeof Deno.version !== "undefined" && typeof Deno.version.deno === "string";
  }

  static isBun(): boolean {
    // @ts-ignore
    return typeof globalThis.Bun !== "undefined" && typeof Bun.version !== "undefined" && typeof process.versions.bun === "string";
  }

  static isNode(): boolean {
    return (
      !this.isDeno() && // This is just to be safe, I'm pretty sure `process` isnt a global in Deno.
      !this.isBun() && // In Bun, `process.versions.node` exists.
      typeof process.versions.node !== "undefined" &&
      typeof process.versions.node === "string"
    );
  }

  static isFirefox(): boolean {
    return typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") > -1;
  }

  static isChrome(): boolean {
    return typeof window !== "undefined" && navigator.userAgent.indexOf("Chrome") > -1;
  }

  static isSafari(): boolean {
    return typeof window !== "undefined" && navigator.userAgent.indexOf("Safari") > -1;
  }

  static type(): RuntimeType {
    if (this.isNode()) {
      return "node";
    }
    if (this.isDeno()) {
      return "deno";
    }
    if (this.isBun()) {
      return "bun";
    }
    if (this.isChrome()) {
      return "chrome";
    }
    if (this.isSafari()) {
      return "safari";
    }
    if (this.isFirefox()) {
      return "firefox";
    }
    throw new UnexpectedRuntimeError();
  }
}
