import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/DrawGame.jsx", import.meta.url), "utf8");
const helpers = readFileSync(new URL("../src/games/drawing.js", import.meta.url), "utf8");

test("drawing records the completed stroke count beside every history snapshot", () => {
  assert.match(game, /import \{ drawingHistoryEntry, drawingHistoryState, isMeaningfulStroke/);
  assert.match(game, /history\.current = pushDrawingHistory\(history\.current, drawingHistoryEntry\(value, count\)\)/);
  assert.match(game, /save\(pendingSnapshot\.current, strokes\)/);
});

test("clear preserves the picture and its stroke count so undo restores both", () => {
  assert.match(game, /save\(snapshot\(\), strokes\)/);
  assert.match(game, /history\.current\.pop\(\)/);
  assert.match(game, /const state = drawingHistoryState\(entry\)/);
  assert.match(game, /setStrokes\(state\.strokes\)/);
});

test("drawing history entries keep snapshot and stroke count together", () => {
  assert.match(helpers, /snapshot,/);
  assert.match(helpers, /strokes:/);
  assert.match(helpers, /return \{ snapshot:.*, strokes:/);
});