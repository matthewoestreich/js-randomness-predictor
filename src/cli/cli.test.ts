import { runPredictor } from "./runPredictor.js";
import { SequenceNotFoundError } from "./types.js";

describe("CLI : V8 : Dynamically Generated Sequence", () => {
  const environment = "v8";
  it("should predict the next five random numbers", async () => {
    const result = await runPredictor({ environment, predictions: 5 });
    expect(result.predictions).toEqual(result.actual);
  });
});

describe("CLI : V8 : User Provided Sequence", () => {
  const environment = "v8";
  it("should predict the next five random numbers", async () => {
    const USER_PROVIDED_SEQUENCE = [0.36280726230126614, 0.32726837947512855, 0.22834780314989023, 0.18295517908119385];
    const EXPECTED_NEXT_FIVE_NUMBERS = [0.8853110028441145, 0.14326940888839124, 0.035607792006009165, 0.6491231376351401, 0.3345277284146617];
    const result = await runPredictor({ environment, sequence: USER_PROVIDED_SEQUENCE, predictions: 5 });
    expect(result.predictions).toEqual(EXPECTED_NEXT_FIVE_NUMBERS);
  });
});

describe("CLI : Chrome", () => {
  const environment = "chrome";
  it("should error if no sequence is provided", async () => {
    expect(runPredictor({ environment, predictions: 5 })).rejects.toThrow(SequenceNotFoundError);
  });
});

describe("CLI : Firefox", () => {
  const environment = "firefox";
  it("should error if no sequence is provided", async () => {
    expect(runPredictor({ environment, predictions: 5 })).rejects.toThrow(SequenceNotFoundError);
  });
});
