import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/review-island.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/ReviewGame.jsx", import.meta.url), "utf8");

test("review rounds use an immersive Mino training island without revealing the target image", () => {
  assert.match(game, /review-island__stage/);
  assert.match(game, /Trainingszeit mit Mino/);
  assert.doesNotMatch(game, /Visual item=\{target\}/);
  assert.match(game, /review-island__listen/);
  assert.match(game, /<Volume2/);
  assert.match(css, /min-height: clamp\(250px, 38vh, 390px\)/);
});

test("review target can be replayed as speech without leaking visual answer", () => {
  assert.match(game, /function replayTarget\(\)/);
  assert.match(game, /if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /speak\(target\.labels\[lang\], lang, settings\)/);
  assert.match(game, /onClick=\{replayTarget\}/);
  assert.match(game, /kelimesini tekrar dinle|noch einmal anhören/);
});

test("review listening target is tactile and reduced-motion safe", () => {
  assert.match(css, /\.review-island__listen:not\(:disabled\):active/);
  assert.match(css, /touch-action: manipulation/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("review island keeps large choices on phones", () => {
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /min-height: 142px/);
});

test("review island stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/review-island\.css/);
});
