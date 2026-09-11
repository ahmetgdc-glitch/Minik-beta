import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const match = readFileSync(new URL("../src/games/MatchGame.jsx", import.meta.url), "utf8");
const sort = readFileSync(new URL("../src/games/SortGame.jsx", import.meta.url), "utf8");
const puzzle = readFileSync(new URL("../src/games/PuzzleGame.jsx", import.meta.url), "utf8");

for (const [name, source] of Object.entries({ MatchGame: match, SortGame: sort, PuzzleGame: puzzle })) {
  test(`${name} derives a rendered lock from pause and session transitions`, () => {
    assert.match(source, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
    assert.match(source, /aria-disabled=\{controlsDisabled \|\| undefined\}/);
    assert.match(source, /useDragPlacement\(\{[\s\S]*paused,[\s\S]*interactionBlocked,/);
  });
}

test("matching disables both source and destination buttons while locked", () => {
  const occurrences = match.match(/disabled=\{controlsDisabled \|\| matched\.includes\(item\.id\)\}/g) || [];
  assert.equal(occurrences.length, 2);
});

test("sorting disables both the draggable object and basket targets while locked", () => {
  const occurrences = sort.match(/disabled=\{controlsDisabled\}/g) || [];
  assert.ok(occurrences.length >= 2);
});

test("puzzle disables both board slots and tray pieces while locked", () => {
  assert.match(puzzle, /disabled=\{controlsDisabled \|\| filled\}/);
  assert.match(puzzle, /disabled=\{controlsDisabled \|\| done\}/);
});
