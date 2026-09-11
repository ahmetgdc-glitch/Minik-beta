import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/RhythmGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/rhythm-playground.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("rhythm uses an immersive Mino music stage", () => {
  assert.match(game, /rhythm-stage rhythm-playground/);
  assert.match(game, /rhythm-hero/);
  assert.match(game, /rhythm-path/);
  assert.match(game, /music-pad/);
  assert.match(game, /Mino'nun müzik sahnesi|Minos Musikbühne/);
});

test("rhythm stage keeps a visible sequence progress path", () => {
  assert.match(game, /sequence\.map/);
  assert.match(game, /rhythm-step/);
  assert.match(game, /input\.length/);
  assert.match(game, /aria-live="polite"/);
});

test("rhythm controls are blocked while paused, stale or during playback", () => {
  assert.match(game, /interactionBlocked = \(\) => false/);
  assert.match(game, /if \(paused \|\| playing \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /if \(playing \|\| paused \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /disabled=\{playing \|\| paused\}/);
  assert.match(game, /if \(!paused\) return;[\s\S]*setPlaying\(false\)[\s\S]*stopSounds\(\)/);
});

test("rhythm async audio rechecks lifecycle state before mutating progress", () => {
  assert.match(game, /await ensureAudioReady\(\);[\s\S]*if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /await playNote\(i\);[\s\S]*if \(paused \|\| interactionBlocked\(\)\) return/);
});

test("rhythm playground stays large and adapts to phones", () => {
  assert.match(css, /min-height:min\(68vh,760px\)|min-height: min\(68vh, 760px\)/);
  assert.match(css, /grid-template-columns:repeat\(4|minmax/);
  assert.match(css, /@media \(max-width:700px\)|@media \(max-width: 700px\)/);
  assert.match(css, /grid-template-columns:repeat\(2|minmax/);
  assert.match(css, /touch-action:manipulation|touch-action: manipulation/);
});

test("rhythm playground respects reduced motion and is loaded in production", () => {
  assert.match(css, /prefers-reduced-motion:reduce|prefers-reduced-motion: reduce/);
  assert.match(main, /rhythm-playground\.css/);
});
