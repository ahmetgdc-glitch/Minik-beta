import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/DifferentGame.jsx", import.meta.url), "utf8");

test("difference game blocks paused and lifecycle-stale taps", () => {
  assert.match(game, /paused/);
  assert.match(game, /interactionBlocked = \(\) => false/);
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\)/);
  assert.match(game, /if \(controlsDisabled\) return/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
});
