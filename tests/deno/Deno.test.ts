import { describe, it } from "node:test";
import assert from "node:assert";
import { DenoRandomnessPredictor } from "../../src/predictors";

describe("Deno", () => {
  it("should be correct when using Array.fom generated in REPL", async () => {
    const SEQ_ARRAY_FROM_REPL = [0.9774329605199243, 0.8675717483279107, 0.6122234727274231, 0.5218003723841141];
    const EXP_ARRAY_FROM_REPL = [
      0.8747118444935734, 0.45894970699054716, 0.8128902290652635, 0.6647584509517386, 0.07862000822981241, 0.8922143403426294, 0.7716846716448352,
      0.03573038091548353, 0.3131705059260478, 0.30127442822811057,
    ];
    const deno = new DenoRandomnessPredictor(SEQ_ARRAY_FROM_REPL);
    const predictions: number[] = [];
    for (let i = 0; i < EXP_ARRAY_FROM_REPL.length; i++) {
      predictions.push(await deno.predictNext());
    }
    assert.deepStrictEqual(predictions, EXP_ARRAY_FROM_REPL);
  });

  it("should be correct when using Math.random() standalone calls generated in REPL", async () => {
    const SEQ_MATH_RANDOM_REPL = [0.4634195562875715, 0.03533371111620309, 0.35943557492793676, 0.13524597491602786];
    const EXP_MATH_RANDOM_REPL = [
      0.8646077680356445, 0.7286635959760086, 0.8949938429309372, 0.2245826008328513, 0.8383554271394464, 0.10678410004411598, 0.23996888876487066,
      0.3301827249786412, 0.06623917497469078, 0.7289090151502068,
    ];
    const deno = new DenoRandomnessPredictor(SEQ_MATH_RANDOM_REPL);
    const predictions: number[] = [];
    for (let i = 0; i < EXP_MATH_RANDOM_REPL.length; i++) {
      predictions.push(await deno.predictNext());
    }
    assert.deepStrictEqual(predictions, EXP_MATH_RANDOM_REPL);
  });
});
