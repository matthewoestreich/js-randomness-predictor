import SafariRandomnessPredictor from "./Safari.js";

// - Both Bun and Safari use JavaScriptCore engine.
// - The Bun runtime doesn't appear to do anything special, therefore we can
// extend the SafariRandomnessPredictor for now.
// - Cannot use this predictor natively in Bun because Bun does not support Z3.

export default class BunRandomnessPredictor extends SafariRandomnessPredictor {}
