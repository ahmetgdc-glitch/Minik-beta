import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/games/TraceGame.jsx", import.meta.url), "utf8");

test("tracing blocks pointer progress and reset while paused or stale", () => {
  assert.match(source, /interactionBlocked = \(\) => false/);
  assert.match(source, /const controlsDisabled = paused \|\| interactionBlocked\(\)/);
  assert.match(source, /if \(!down\.current \|\| paused \|\| interactionBlocked\(\)\)/);
  assert.match(source, /function start\(e\)/);
  assert.match(source, /function reset\(\)/);
  assert.match(source, /onLostPointerCapture/);
  assert.match(source, /disabled=\{controlsDisabled\}/);
});
