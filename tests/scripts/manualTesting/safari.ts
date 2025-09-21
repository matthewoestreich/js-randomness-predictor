import SafariRandomnessPredictor from "../../../src/predictors/Safari";
import SafariRandomnessPredictor_worksWithBug from "./Safari_worksWithBug";
import FirefoxRandomnessPredictor from "../../../src/predictors/Firefox";

/*
function getSeed() {
    const arr = [];
    arr.push(Math.random());
    arr.push(Math.random());
    arr.push(Math.random());
    arr.push(Math.random());
    return arr;
}
*/
const generatedViaFunction = [0.6745342570782737, 0.6274195267840186, 0.2898944210190043, 0.7233630486387415];

// Array.from({ length: 4 }, Math.random);
const generatedViaArrayFrom = [0.504260821115712, 0.3117604602979772, 0.1995979965420167, 0.4283393409483929];

// let arr = [];
// for (let i = 0; i < 4; i++) { arr.push(Math.random()); }
const generatedViaForLoop = [0.08161765341082505, 0.9527520433849445, 0.37364318144156605, 0.8364159387835357];

// eval("Math.random()");
const generatedViaEval = [0.21584385622889968, 0.25436726722938663, 0.8453934665091046, 0.9265591686065625];

// new Array(4).fill(0).map(() => Math.random());
const generatedViaNewArray = [0.44090629064931663, 0.08837116482991492, 0.13986278539861086, 0.5528751175826662];

// From locally compiled JSC using Array.from
const generatedViaLocallyCompiledJSCUsingArrayFrom = [0.1801002895235847, 0.5087707359170214, 0.04746414993677095, 0.7367812228296822];

/*
(() => {
    const out = [];
    for (let i = 0; i < 4; i++) out.push(Math.random());
    return out;
})();
*/
const generatedViaIIFE = [0.8579570984543072, 0.5032304947510982, 0.8077809192588562, 0.5643152425058319];

// THIS IS SOLVABLE!!!!!!!
const seq = [0.34047130319549745, 0.4024046065628766, 0.5071264474284995, 0.5974922278731108];

// AFTER BUG FIX
const emitRandomThunkUsingLogicalShift = [0.45298000010800177, 0.3592530179207556, 0.509406710556208, 0.40755724894877976];

const NOT_WORKING_MATHRANDOM_STANDALONE = [0.46386126152939966, 0.5974321089613381, 0.22476738498765259, 0.3323801690684518];
const SHOULD_WORK_MATHRANDOM_STANDALONE = [0.41815411750722586, 0.7314649296969568, 0.3454368329795394, 0.9112504409932133];
const SHOULD_WORK_ARRAY_FROM = [0.6806781919543583, 0.2729841437765109, 0.4979057943189942, 0.23591014421734935];

function safariToDouble(n: bigint): number {
  return Number(n & 0x1fffffffffffffn) / Math.pow(2, 53);
}

Main();

async function Main() {
  //console.log(`3853851249242497042 -> toDouble -> ${safariToDouble(3853851249242497042n)}`);

  const pred = new FirefoxRandomnessPredictor(SHOULD_WORK_MATHRANDOM_STANDALONE);
  for (let i = 0; i < 10; i++) {
    console.log(await pred.predictNext());
  }

  /*
  const seq = [0.34047130319549745, 0.4024046065628766, 0.5071264474284995, 0.5974922278731108];
  const predictor = new SafariRandomnessPredictor_worksWithBug(seq);
  const solved = await predictor.solveState();
  console.log("solved state:", solved);
  SafariRandomnessPredictor_worksWithBug.predictFromSolvedState(solved.low, solved.high, seq.length, 10);
  */

  /*
  const s = [0.34047130319549745, 0.4024046065628766, 0.5071264474284995, 0.5974922278731108];
  const pred = new SafariRandomnessPredictor(s);
  //const pred = new SafariRandomnessPredictor(generatedViaArrayFrom);
  for (let i = 0; i < 10; i++) {
    const prediction = await pred.predictNext();
    console.log(prediction);
  }
  /*

  /*
  const pred = new SafariRandomnessPredictor([0.34047130319549745, 0.4024046065628766, 0.5071264474284995, 0.5974922278731108]);
  for (let i = 0; i < 10; i++) {
    const prediction = await pred.predictNext();
    console.log(prediction);
  }
  */
}
