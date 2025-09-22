import { FirefoxRandomnessPredictor, SafariRandomnessPredictor } from "../../../src/predictors";

const SEQ_ARRAY_FROM = [0.1584019859484701, 0.5889908981279809, 0.5707594257373063, 0.2013679022755892];
const EXPECTED_ARRAY_FROM = [
  0.22608010770344233, 0.6271766206083508, 0.982945852940786, 0.17311426646362216, 0.7612493609526688, 0.36855644622412276, 0.16106664697250717,
  0.4819446119083074, 0.28600821056136283, 0.48136520285701956,
];

const SEQ_MATH_RANDOM = [0.1399695243228144, 0.2014387671401643, 0.5305147829755276, 0.40869883030943166];
const EXP_MATH_RANDOM = [
  0.7208689709272236, 0.25435595786540255, 0.4120472933967687, 0.9931906335355927, 0.3605072878681843, 0.07740883327663006, 0.3845007845910927,
  0.0006116039135406481, 0.7945175319163787, 0.2676487652727588,
];

Main();
async function Main() {
  const SEQUENCE = SEQ_ARRAY_FROM;
  const EXPECTED = EXPECTED_ARRAY_FROM;

  try {
    const safari = new SafariRandomnessPredictor(SEQUENCE);
    const safariPredictions: number[] = [];
    for (let i = 0; i < EXPECTED.length; i++) {
      safariPredictions.push(await safari.predictNext());
    }
    console.log(
      { predictions: safariPredictions, EXPECTED },
      "\n",
      safariPredictions.every((v, i) => EXPECTED[i] === v),
    );
  } catch (e) {
    console.log(e);
  }
}
