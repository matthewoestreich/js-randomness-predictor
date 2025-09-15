import PRNG from "../../src/PRNG";

//checkForDuplicates(2_000_000, false);
viewRandomDistributionHistogram(1_000_000, 100);
//kolmogorovSmirnovTest();

function checkForDuplicates(numberOfRandomNumbersToGenerate: number, logAllRands: boolean) {
  const prng = new PRNG();
  const rands: { [k: number]: number } = {};

  let numDuplicatesFound = 0;
  for (let i = 1; i <= numberOfRandomNumbersToGenerate; i++) {
    const rand = prng.random();
    if (rands[rand] > 0) {
      numDuplicatesFound++;
      console.log("DUPLICATE FOUND", rand);
    }
    rands[rand] = i;
  }

  if (numDuplicatesFound === 0) {
    console.log(`No duplicates found in ${numberOfRandomNumbersToGenerate} numbers!`);
  } else {
    console.log(`Found ${numDuplicatesFound} duplicates in ${numberOfRandomNumbersToGenerate} numbers!`);
  }
  if (logAllRands) {
    Object.keys(rands).forEach((r) => console.log(r));
  }
}

function viewRandomDistributionHistogram(numberOfRandomNumbersToGenerate: number, bins: number) {
  const prng = new PRNG();
  const N = numberOfRandomNumbersToGenerate;

  // Initialize bin counts
  const counts = Array(bins).fill(0);

  // Generate samples and bin them
  for (let i = 0; i < N; i++) {
    const x = prng.random();
    const idx = Math.min(Math.floor(x * bins), bins - 1);
    counts[idx]++;
  }

  // Find max count for scaling
  const maxCount = Math.max(...counts);

  console.log(`\nRandom Distribution : ${N} numbers`);
  // Print ASCII histogram
  for (let i = 0; i < bins; i++) {
    const barLength = Math.floor((counts[i] / maxCount) * 50); // scale to 50 chars
    const rangeStart = (i / bins).toFixed(2);
    const rangeEnd = ((i + 1) / bins).toFixed(2);
    console.log(`${rangeStart}-${rangeEnd} | ${"#".repeat(barLength)}`);
  }
}

// Tests/checks random distribution..
// https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test
function kolmogorovSmirnovTest(numberOfRandomNumbersToGenerate: number) {
  const prng = new PRNG();
  const N = numberOfRandomNumbersToGenerate;

  // 1️. Generate samples
  const samples = Array.from({ length: N }, () => prng.random());
  // 2️. Sort samples
  samples.sort((a, b) => a - b);
  // 3. Compute empirical CDF and compare to Uniform(0,1)
  let D = 0;
  for (let i = 0; i < N; i++) {
    const empiricalCDF = (i + 1) / N;
    const theoreticalCDF = samples[i]; // uniform CDF(x) = x
    const diff = Math.abs(empiricalCDF - theoreticalCDF);
    if (diff > D) D = diff;
  }

  console.log("KS statistic D:", D);

  // 4️. Approximate p-value (for large N)
  function ksPValue(D: number, n: number) {
    const sqrtN = Math.sqrt(n);
    const lambda = (sqrtN + 0.12 + 0.11 / sqrtN) * D;
    let sum = 0;
    for (let j = 1; j <= 100; j++) {
      sum += Math.pow(-1, j - 1) * Math.exp(-2 * j * j * lambda * lambda);
    }
    return Math.min(Math.max(2 * sum, 0), 1);
  }

  const pval = ksPValue(D, N);
  if (pval > 0.05) {
    console.log("[EXCELLENT] Fail to reject H₀ → samples are consistent with uniform!");
  } else if (pval >= 0.01 && pval <= 0.05) {
    console.log("[GOOD] Weak evidence against H₀ → slight deviation (usually fine for PRNG testing)");
  } else if (pval < 0.01) {
    console.log("[BAD] Strong evidence against H₀ → samples probably not uniform (PRNG might be biased)");
  } else {
    console.log("[UNKNOWN] Unknown pvalue value : pvalue=", pval);
  }
}
