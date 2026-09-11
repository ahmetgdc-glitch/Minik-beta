import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const speak = readFileSync(new URL("../src/games/SpeakGame.jsx", import.meta.url), "utf8");
const memory = readFileSync(new URL("../src/games/MemoryGame.jsx", import.meta.url), "utf8");

test("speaking game blocks replay, microphone and assisted solves when stale", () => {
  assert.match(speak, /interactionBlocked = \(\) => false/);
  assert.match(speak, /const blocked = interactionBlocked\(\);/);
  assert.match(speak, /function assistedSolve\(\)/);
  assert.match(speak, /disabled=\{paused \|\| blocked\}/);
  assert.match(speak, /disabled=\{listening \|\| paused \|\| blocked\}/);
});

test("memory buttons reflect the full session lock in the DOM", () => {
  assert.match(memory, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(memory, /aria-disabled=\{controlsDisabled \|\| undefined\}/);
  assert.match(memory, /disabled=\{controlsDisabled \|\| found \|\| open\.length >= 2 \|\| lockedRef\.current\}/);
});

test("memory releases its local comparison lock when a parent transition cancels the timer", () => {
  assert.match(memory, /if \(interactionBlocked\(\)\) \{[\s\S]*?openRef\.current = \[\];[\s\S]*?setOpen\(\[\]\);[\s\S]*?lockedRef\.current = false;[\s\S]*?return;/);
});
