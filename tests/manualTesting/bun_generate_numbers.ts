//import jsc from "bun:jsc";
//jsc.setRandomSeed(13371337);
/*
const sequence = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]; //Array.from({ length: 4 }, Math.random);

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
*/

const sequence = Array.from({ length: 6 }, Math.random);
const expected = Array.from({ length: 10 }, Math.random);

console.log(sequence);
console.log(expected);
