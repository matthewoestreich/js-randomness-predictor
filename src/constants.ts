import { Runtime, ServerRuntime, BrowserRuntime, Engine } from "./types.js";

/** The env var KEY (not the value) that determines which runtime the CLI uses. */
export const EXECUTION_RUNTIME_ENV_VAR_KEY = "JSRP_RUNTIME";
export const DEFAULT_NUMBER_OF_PREDICTIONS = 10;
export const V8_MAX_PREDICTIONS = 64;
export const RUNTIMES = ["node", "bun", "deno", "chrome", "firefox", "safari"] as const;
export const SERVER_RUNTIMES = ["node", "bun", "deno"] as const;
export const JAVASCRIPT_ENGINES = ["v8", "javascriptcore", "spidermonkey"] as const;
export const BROWSER_RUNTIMES = ["chrome", "safari", "firefox"] as const;

export const IS_SERVER_RUNTIME: Record<Runtime, boolean> = Object.fromEntries(
  RUNTIMES.map((r: Runtime) => [r, SERVER_RUNTIMES.includes(r as ServerRuntime)]),
) as Record<Runtime, boolean>;

export const IS_BROWSER_RUNTIME: Record<Runtime, boolean> = Object.fromEntries(
  RUNTIMES.map((r: Runtime) => [r, BROWSER_RUNTIMES.includes(r as BrowserRuntime)]),
) as Record<Runtime, boolean>;

// Get engine from runtime
export const RUNTIME_ENGINE: Record<Runtime, Engine> = {
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
    (acc[engine] ||= []).push(runtime as Runtime);
    return acc;
  },
  {} as Record<Engine, Runtime[]>,
);

// Get default sequence length from runtime
export const MIN_SEQUENCE_LENGTH: Record<Runtime, number> = {
  bun: 6,
  safari: 6,
  node: 5,
  chrome: 4,
  deno: 4,
  firefox: 4,
};

export const SUPPORTED_BROWSER_RUNTIMES: Record<BrowserRuntime, boolean> = {
  firefox: true,
  chrome: true,
  safari: true,
};
