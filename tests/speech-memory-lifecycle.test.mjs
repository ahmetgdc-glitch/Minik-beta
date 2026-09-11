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

test("memory buttons reflect pause state in the DOM", () => {
  assert.match(memory, /aria-disabled=\{paused \|\| undefined\}/);
  assert.match(memory, /disabled=\{paused \|\| found \|\| open\.length >= 2 \|\| lockedRef\.current\}/);
});
