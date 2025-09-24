import { SpawnSyncReturns } from "node:child_process";

/**
 * Instead of just writing errors to stderr and silently continuing, we throw those errors.
 * @param {SpawnSyncReturns<T>} ssr
 */
export default function stderrThrows<T>(ssr: SpawnSyncReturns<T>): void {
  if (ssr.stderr !== "") {
    throw new Error((ssr.stderr as string).toString());
  }
  if (ssr.error !== undefined) {
    throw ssr.error;
  }
}
