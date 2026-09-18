import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/RhythmGame.jsx", import.meta.url), "utf8");
const sounds = readFileSync(new URL("../src/audio/sounds.js", import.meta.url), "utf8");

test("rhythm derives its audio gate from the parent master audio switch", () => {
  assert.match(game, /settings\?\.audio === false/);
  assert.match(game, /const audioDisabled = settings\?\.audio === false/);
});

test("rhythm never starts a silent melody preview when master audio is off", () => {
  assert.match(
    game,
    /if \(!context \|\| paused \|\| interactionBlocked\(\) \|\| audioDisabled\) return/,
  );
});

test("rhythm pads never accept melody input while master audio is off", () => {
  assert.match(game, /if \(playing \|\| paused \|\| interactionBlocked\(\) \|\| audioDisabled\) return/);
});

test("rhythm shows a clear bilingual tone-off status instead of a misleading prompt", () => {
  assert.match(game, /const status = audioDisabled/);
  assert.match(game, /"Ses kapalı"/);
  assert.match(game, /"Ton aus"/);
});

test("rhythm notes remain a learning cue, not a reward effect, consistent with the sounds game", () => {
  assert.match(sounds, /export async function playNote\(/);
  assert.match(sounds, /prepareSoundPlayback\(\)/);
  assert.match(game, /playNote\(sequence\[cursor\]\)/);
  assert.match(game, /await playNote\(i\)/);
});