import { beforeEach, afterEach } from "vitest";

// We need to take control of Math.random. Vitest does something odd with it (that breaks our dynamic V8 predictor).
const nativeMathRandom = Math.random;

beforeEach(() => {
  // We need to take control of Math.random. Vitest does something odd with it (that breaks our dynamic V8 predictor).
  global.Math.random = nativeMathRandom;
});

afterEach(() => {
  // We need to take control of Math.random. Vitest does something odd with it (that breaks our dynamic V8 predictor).
  if (typeof (Math.random as any).mockRestore === "function") {
    (Math.random as any).mockRestore();
  }
});
