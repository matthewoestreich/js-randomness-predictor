/**
 * To retry tests.. 
 *
 * # EXAMPLE 
```
  it("predict correctly when using single Math.random() calls for 'sequence' and 'expected'", async () => {
    await withRetries(async () => {
      const sequence = [Math.random(), Math.random(), Math.random(), Math.random()];
      const nodePredictor = JSRandomnessPredictor.node(sequence);
      const expected = [
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
        Math.random(),
      ];
      const predictions: number[] = [];
      for (let i = 0; i < expected.length; i++) {
        predictions.push(await nodePredictor.predictNext());
      }
      assert.deepStrictEqual(expected, predictions);
    }, 3);
  });
```
 */
export async function withRetries(fn: () => Promise<void>, retries: number) {
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      if (i > 0) {
        console.log(`RETRY #${i}`);
      }
      await fn();
      return;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError;
}
