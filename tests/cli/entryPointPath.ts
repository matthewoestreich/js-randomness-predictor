import path from "node:path";

// The path to the CLI entry point file
export default path.resolve(import.meta.dirname, "../../dist/esm/cli/cli.js");
