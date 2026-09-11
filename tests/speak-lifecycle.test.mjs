import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/SpeakGame.jsx", import.meta.url), "utf8");

test("pronunciation game stops recognition when play becomes unavailable", () => {
  assert.match(game, /const blocked = interactionBlocked\(\)/);
  assert.match(game, /if \(paused \|\| blocked\) stopRecognition\(\)/);
  assert.match(game, /\[paused, blocked\]/);
});

test("pronunciation controls respect both pause and interaction locks", () => {
  assert.match(game, /disabled=\{paused \|\| blocked\}/);
  assert.match(game, /disabled=\{listening \|\| paused \|\| blocked\}/);
  assert.match(game, /aria-disabled=\{paused \|\| blocked \|\| undefined\}/);
});
