import test from "node:test";
import assert from "node:assert/strict";
import { DRAW_HISTORY_LIMIT, MIN_STROKE_DISTANCE, drawingHistoryEntry, drawingHistoryState, isMeaningfulStroke, pushDrawingHistory } from "../src/games/drawing.js";

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

test("drawing history can restore the completion stroke count after clear and undo", () => {
  const entry = drawingHistoryEntry("finished-picture", 4);
  assert.deepEqual(drawingHistoryState(entry), { snapshot: "finished-picture", strokes: 4 });
});

test("drawing history remains compatible with legacy snapshot-only entries", () => {
  assert.deepEqual(drawingHistoryState("legacy-picture", 2), { snapshot: "legacy-picture", strokes: 2 });
  assert.equal(drawingHistoryEntry(null, 3), null);
});
