import { Z3Api } from "../types.js";

/**
 * For our browser builds we need to override the default Z3 API.
 * Vite uses a "resolve.alias" rule to replace the default import
 * to this.
 *
 * Our "js-randomness-predictor-loader" is what sets up the global "window"
 * variables that are used in this function.
 */
let CACHED_Z3API: Z3Api | undefined = undefined;
export async function init(): Promise<Z3Api> {
  if (CACHED_Z3API) {
    return CACHED_Z3API;
  }

  if (!window.initZ3 || !window.Module) {
    throw new Error("Z3 not initialized properly! window.initZ3 and window.Module should be set via IIFE in entry!");
  }

  const initZ3 = window.initZ3;
  const initZ3Wrapper = async () => await initZ3(window.Module);

  // @ts-ignore
  // This import path is an alias used by vite!
  const lowLevel = await (await import("z3-solver-jsrp-low-level")).init(initZ3Wrapper);
  // @ts-ignore
  // This import path is an alias used by vite!
  const { createApi } = await import("z3-solver-jsrp-high-level");

  const output = { ...lowLevel, ...createApi(lowLevel.Z3) };
  CACHED_Z3API = output;

  return output;
}
