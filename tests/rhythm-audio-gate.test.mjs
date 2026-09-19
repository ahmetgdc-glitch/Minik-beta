import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/RhythmGame.jsx", import.meta.url), "utf8");
const sounds = readFileSync(new URL("../src/audio/sounds.js", import.meta.url), "utf8");

test("rhythm derives its audio gate from the parent master audio switch", () => {
  assert.match(game, /settings\?\.audio === false/);
  assert.match(game, /const audioDisabled = settings\?\.audio === false/);
});

test("a muted family never produces a tone, not during preview and not on taps", () => {
  assert.match(game, /if \(!audioDisabled\) await prepareSoundPlayback\(\)/);
  assert.match(game, /if \(!audioDisabled\) playNote\(sequence\[cursor\]\)/);
  assert.match(game, /const sounded = audioDisabled \? false : await playNote\(i\)/);
});

test("the silent melody stays playable so a muted round is never a dead end", () => {
  assert.doesNotMatch(game, /if \(!context \|\| paused \|\| interactionBlocked\(\) \|\| audioDisabled\) return/);
  assert.match(game, /if \(!sounded\) \{[\s\S]*setLit\(i\)[\s\S]*setLit\(-1\)/);
  assert.match(game, /if \(i !== sequence\[input\.length\]\) \{/);
  assert.match(game, /next\.length === sequence\.length && !interactionBlocked\(\)\) onSolve/);
  assert.match(game, /disabled=\{playing \|\| controlsDisabled\}/);
  assert.doesNotMatch(game, /disabled=\{playing \|\| controlsDisabled \|\| audioDisabled\}/);
});

test("rhythm shows a clear bilingual tone-off status instead of a misleading prompt", () => {
  assert.match(game, /const status = audioDisabled/);
  assert.match(game, /"Ses kapalı/);
  assert.match(game, /"Ton aus/);
});

test("rhythm notes remain a learning cue, not a reward effect, consistent with the sounds game", () => {
  assert.match(sounds, /export async function playNote\(/);
  assert.match(sounds, /prepareSoundPlayback\(\)/);
  assert.match(game, /playNote\(sequence\[cursor\]\)/);
  assert.match(game, /await playNote\(i\)/);
});