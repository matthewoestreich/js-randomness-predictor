import SafariRandomnessPredictor from "./Safari.js";

// CANNOT USE BUN REPL TO GENERATE RANDOM NUMBERS!!

// Both Bun and Safari use JavaScriptCore engine.
// The Bun runtime doesn't appear to do anything special, therefore we can
// extend the SafariRandomnessPredictor for now.

// TODO : Write predictor in such a manner that we can detect if we are running
// in Bun.
export default class BunRandomnessPredictor extends SafariRandomnessPredictor {}
