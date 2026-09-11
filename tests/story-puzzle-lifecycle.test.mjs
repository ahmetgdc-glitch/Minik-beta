import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const story = readFileSync(new URL("../src/games/StoryGame.jsx", import.meta.url), "utf8");
const puzzle = readFileSync(new URL("../src/games/PuzzleGame.jsx", import.meta.url), "utf8");

test("StoryGame.jsx blocks paused and stale lifecycle input", () => {
  assert.match(story, /interactionBlocked = \(\) => false/);
  assert.match(story, /if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(story, /disabled=\{paused\}/);
});

test("PuzzleGame.jsx blocks paused and stale lifecycle input", () => {
  assert.match(puzzle, /interactionBlocked = \(\) => false/);
  assert.match(puzzle, /if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(puzzle, /useDragPlacement\(\{[\s\S]*paused,[\s\S]*interactionBlocked,/);
  assert.match(puzzle, /disabled=\{paused \|\| filled\}/);
  assert.match(puzzle, /disabled=\{paused \|\| done\}/);
});
