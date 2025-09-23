import rawDatabase from "./randomNumbersDatabase.json";

type RandomNumbers = {
  sequence: number[];
  expected: number[];
  tags: Tags;
};

type Tags = { [k: string]: string | number | boolean | null | undefined };

type DatabaseEntry = {
  runtime: string;
  runtimeVersion: number;
  randomNumbers: RandomNumbers[];
};

const randomNumbersDatabase = rawDatabase as DatabaseEntry[];

/**
 * Strictly compares two Tags objects
 */
function tagsAreEqual(a: Tags, b: Tags): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every((key) => a[key] === b[key]);
}

/**
 * Searches the database for a matching RandomNumbers entry.
 * Tags must be strictly equal.
 *  - Pretend a DB entry has these tags : { foo: 1, bar: 2 }
 *  - This query would NOT MATCH!! : { foo: 1 }
 *  - The only query that would match would be the exact same object : { foo: 1, bar: 2 }
 */
export default function getSequenceAndExpectedFromDatabase(runtime: string, tags: Tags, runtimeVersion?: number): RandomNumbers {
  // Filter database by runtime and optional version
  const candidates = randomNumbersDatabase.filter(
    (entry) => entry.runtime === runtime && (runtimeVersion === undefined || entry.runtimeVersion === runtimeVersion),
  );

  const matches = candidates.flatMap((c) => c.randomNumbers).filter((rn) => tagsAreEqual(rn.tags, tags));

  if (matches.length === 1) {
    return matches[0];
  }
  if (matches.length > 1) {
    throw new Error(`Found multiple matches! Please refine tags! ${JSON.stringify({ runtime, tags, runtimeVersion })}`);
  }
  throw new Error(`Query matches no results! ${JSON.stringify({ runtime, tags, runtimeVersion })}`);
}
