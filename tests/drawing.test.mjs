import test from "node:test";
import assert from "node:assert/strict";
import { DRAW_HISTORY_LIMIT, MIN_STROKE_DISTANCE, isMeaningfulStroke, pushDrawingHistory } from "../src/games/drawing.js";

test("drawing requires actual movement instead of counting taps as strokes", () => {
  assert.equal(isMeaningfulStroke(0), false);
  assert.equal(isMeaningfulStroke(MIN_STROKE_DISTANCE - 0.1), false);
  assert.equal(isMeaningfulStroke(MIN_STROKE_DISTANCE), true);
  assert.equal(isMeaningfulStroke(Number.NaN), false);
});

test("drawing undo history is bounded for iPhone/iPad memory safety", () => {
  let history = [];
  for (let i = 0; i < DRAW_HISTORY_LIMIT + 5; i++) history = pushDrawingHistory(history, `frame-${i}`);
  assert.equal(history.length, DRAW_HISTORY_LIMIT);
  assert.equal(history.at(-1), `frame-${DRAW_HISTORY_LIMIT + 4}`);
  assert.equal(history[0], "frame-5");
});
