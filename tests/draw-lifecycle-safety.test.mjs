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
  const disabledUses = game.match(/disabled=\{controlsDisabled/g) || [];
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

test("a discarded micro-stroke restore never repaints over a newer stroke", () => {
  assert.match(game, /const restoreRun = useRef\(0\)/);
  assert.match(game, /function start\(e\) \{[\s\S]*restoreRun\.current \+= 1;[\s\S]*pendingSnapshot\.current = snapshot\(\)/);
  assert.match(game, /const run = \+\+restoreRun\.current;[\s\S]*img\.onload = \(\) => \{[\s\S]*if \(run !== restoreRun\.current\) return;/);
  assert.match(game, /if \(blocked\(\)\) \{[\s\S]*restoreRun\.current \+= 1;/);
});
