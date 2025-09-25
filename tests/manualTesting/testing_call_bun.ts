import callBun from "../bun/callBun";

Main();
async function Main() {
  const result = callBun(`
      const sequence = Array.from({ length: 4 }, Math.random);
      const expected = Array.from({ length: 10 }, Math.random);
      console.log(JSON.stringify({ sequence, expected }));
    `);
  const json = JSON.parse(result.stdout.toString());
  console.log(json);
}
