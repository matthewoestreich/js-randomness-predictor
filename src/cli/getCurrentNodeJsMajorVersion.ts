import { NodeJsMajorVersion } from "../types.js";

export function getCurrentNodeJsMajorVersion(): NodeJsMajorVersion {
  return Number(process.versions.node.split(".")[0]) as NodeJsMajorVersion;
}
