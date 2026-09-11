import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const story = readFileSync(new URL("../src/games/StoryGame.jsx", import.meta.url), "utf8");
const puzzle = readFileSync(new URL("../src/games/PuzzleGame.jsx", import.meta.url), "utf8");

test("StoryGame.jsx blocks paused and stale lifecycle input", () => {
  assert.match(story, /interactionBlocked = \(\) => false/);
  assert.match(story, /function blocked\(\) \{[\s\S]*?return paused \|\| interactionBlocked\(\);[\s\S]*?\}/);
  assert.match(story, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(story, /if \(blocked\(\)\) return/);
  assert.match(story, /disabled=\{controlsDisabled\}/);
  assert.match(story, /disabled=\{controlsDisabled\}[\s\S]*onPick=\{pick\}/);
});

test("PuzzleGame.jsx blocks paused and stale lifecycle input", () => {
  assert.match(puzzle, /interactionBlocked = \(\) => false/);
  assert.match(puzzle, /if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(puzzle, /useDragPlacement\(\{[\s\S]*paused,[\s\S]*interactionBlocked,/);
  assert.match(puzzle, /disabled=\{paused \|\| filled\}/);
  assert.match(puzzle, /disabled=\{paused \|\| done\}/);
});
