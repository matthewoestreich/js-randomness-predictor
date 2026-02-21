import { RuntimeType, ServerRuntimeType, BrowserRuntimeType, EngineType } from "./types.js";

/** The env var KEY (not the value) that determines which runtime the CLI uses. */
export const EXECUTION_RUNTIME_ENV_VAR_KEY = "JSRP_RUNTIME";
export const DEFAULT_NUMBER_OF_PREDICTIONS = 10;
export const V8_MAX_PREDICTIONS = 64;
export const NODE_MAJOR_VERSIONS = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] as const;
export const RUNTIMES = ["node", "bun", "deno", "chrome", "firefox", "safari"] as const;
export const SERVER_RUNTIMES = ["node", "bun", "deno"] as const;
export const JAVASCRIPT_ENGINES = ["v8", "javascriptcore", "spidermonkey"] as const;
export const BROWSER_RUNTIMES = ["chrome", "safari", "firefox"] as const;

export const IS_SERVER_RUNTIME: Record<RuntimeType, boolean> = Object.fromEntries(
  RUNTIMES.map((r: RuntimeType) => [r, SERVER_RUNTIMES.includes(r as ServerRuntimeType)]),
) as Record<RuntimeType, boolean>;

export const IS_BROWSER_RUNTIME: Record<RuntimeType, boolean> = Object.fromEntries(
  RUNTIMES.map((r: RuntimeType) => [r, BROWSER_RUNTIMES.includes(r as BrowserRuntimeType)]),
) as Record<RuntimeType, boolean>;

export const JAVASCRIPT_ENGINE_REQUIRED_SEQUENCE_LENGTH: Record<EngineType, number> = {
  v8: 4,
  javascriptcore: 6, // TODO: update when bug fix lands
  spidermonkey: 4,
} as const;

// Get engine from runtime
export const RUNTIME_ENGINE: Record<RuntimeType, EngineType> = {
  node: "v8",
  bun: "javascriptcore",
  deno: "v8",
  chrome: "v8",
  firefox: "spidermonkey",
  safari: "javascriptcore",
};

// Get runtime(s) from engine, returns [] even if only one runtime exists for an engine.
export const ENGINE_RUNTIME = Object.entries(RUNTIME_ENGINE).reduce(
  (acc, [runtime, engine]) => {
    (acc[engine] ||= []).push(runtime as RuntimeType);
    return acc;
  },
  {} as Record<EngineType, RuntimeType[]>,
);

// Get default sequence length from runtime
export const DEFAULT_SEQUENCE_LENGTH: Record<RuntimeType, number> = Object.fromEntries(
  Object.entries(RUNTIME_ENGINE).map(([runtime, engine]) => [runtime, JAVASCRIPT_ENGINE_REQUIRED_SEQUENCE_LENGTH[engine]]),
) as Record<RuntimeType, number>;

export const SUPPORTED_BROWSER_RUNTIMES: Record<BrowserRuntimeType, boolean> = {
  firefox: true,
  chrome: true,
  safari: true,
};
