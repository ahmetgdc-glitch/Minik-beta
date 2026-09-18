import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/games/DifferentGame.jsx", import.meta.url), "utf8");

test("DifferentGame attributes both success and mistakes only to the odd learning target", () => {
  assert.match(source, /cell\.odd \? onSolve\(\[round\.odd\.id\]\) : onWrong\(\[round\.odd\.id\]\)/);
  assert.doesNotMatch(source, /onWrong\(\[cell\.item\.id/);
});
