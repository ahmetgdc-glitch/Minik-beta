import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/DrawGame.jsx", import.meta.url), "utf8");

test("drawing accepts the shared interaction lifecycle guard", () => {
  assert.match(game, /interactionBlocked = \(\) => false/);
  assert.match(game, /const blocked = \(\) => paused \|\| interactionBlocked\(\)/);
});

test("drawing strokes cannot start or continue while blocked", () => {
  assert.match(game, /function start\(e\) \{[\s\S]*if \(blocked\(\)\) return/);
  assert.match(game, /function move\(e\) \{[\s\S]*if \(!drawing\.current \|\| blocked\(\)\) return/);
  assert.match(game, /function end\(e\) \{[\s\S]*if \(blocked\(\)\)/);
});

test("drawing toolbar and templates disable together with lifecycle state", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\)/);
  const disabledUses = game.match(/disabled=\{controlsDisabled\}/g) || [];
  assert.ok(disabledUses.length >= 6, `expected drawing controls to share disabled state, got ${disabledUses.length}`);
  assert.match(game, /disabled=\{controlsDisabled \|\| strokes < 3\}/);
});

test("undo clear and completion all recheck the lifecycle guard", () => {
  assert.match(game, /function clearNow\(\) \{[\s\S]*if \(blocked\(\)\) return/);
  assert.match(game, /function clear\(\) \{[\s\S]*if \(blocked\(\)\) return/);
  assert.match(game, /function undo\(\) \{[\s\S]*if \(blocked\(\)\) return/);
  assert.match(game, /if \(!blocked\(\)\) onSolve/);
});

test("pausing cancels an in-progress drawing gesture and closes clear confirmation", () => {
  assert.match(game, /drawing\.current = false/);
  assert.match(game, /setConfirmClear\(false\)/);
  assert.match(game, /open=\{confirmClear && !controlsDisabled\}/);
});
