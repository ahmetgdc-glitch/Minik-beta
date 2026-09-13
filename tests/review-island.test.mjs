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
  assert.match(game, /review-island__mino/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\}/);
  assert.match(css, /min-height: clamp\(300px, 44svh, 450px\)/);
});

test("review target can be replayed as speech without leaking visual answer", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\)/);
  assert.match(game, /function replayTarget\(\)/);
  assert.match(game, /if \(controlsDisabled\) return/);
  assert.match(game, /speak\(target\.labels\[lang\], lang, settings\)/);
  assert.match(game, /onClick=\{replayTarget\}/);
  assert.match(game, /kelimesini tekrar dinle|noch einmal anhören/);
});

test("review answers use dedicated visual training islands instead of shared answer cards", () => {
  assert.match(game, /review-island__choices/);
  assert.match(game, /className=\{`review-island__choice review-choice-/);
  assert.match(game, /<Visual item=\{item\} lang=\{lang\} photos=\{settings\.photos\}/);
  assert.doesNotMatch(game, /OptionGrid/);
  assert.match(css, /\.review-island__choice \{/);
  assert.match(css, /min-height: clamp\(200px, 29svh, 310px\)/);
  assert.match(css, /\.review-island__choices\.choices-6 \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); \}/);
});

test("review choices preserve lifecycle locks and Mino hint emphasis", () => {
  assert.match(game, /disabled=\{controlsDisabled\}/);
  assert.match(game, /function pick\(item\) \{\s*if \(controlsDisabled\) return;/s);
  assert.match(game, /hint >= 2 && isTarget/);
  assert.match(game, /hint-target/);
  assert.match(game, /quiet-option/);
});

test("review listening target is tactile and reduced-motion safe", () => {
  assert.match(css, /\.review-island__listen:not\(:disabled\):active/);
  assert.match(css, /touch-action: manipulation/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test("review island keeps large choices on phones", () => {
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /\.review-island__choices,\s*\.review-island__choices\.choices-6 \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/s);
  assert.match(css, /min-height: clamp\(145px, 23svh, 220px\)/);
});

test("review island stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/review-island\.css/);
});
