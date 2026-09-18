import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/OppositesGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/opposites-playground.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");

test("opposites uses a visual two-sided playground instead of the legacy concept prompt", () => {
  assert.match(game, /opposites-playground/);
  assert.match(game, /opposites-prompt-scene/);
  assert.match(game, /opposites-choice-grid/);
  assert.match(game, /<Visual item={prompt}/);
  assert.doesNotMatch(game, /concept-prompt/);
  assert.doesNotMatch(game, /<OptionGrid/);
});

test("Mino visibly occupies the question side without becoming another control", () => {
  assert.match(game, /import Visual, \{ MinoAvatar \}/);
  assert.match(game, /progress,/);
  assert.match(game, /className="opposites-mino-guide" aria-hidden="true"/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(css, /\.opposites-mino-guide \{[\s\S]*?pointer-events: none/);
  assert.match(css, /\.opposites-thought-mark/);
  assert.match(css, /@keyframes opposite-think/);
});

test("opposites lets children replay the prompt word without bypassing interaction guards", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(game, /function replayPrompt\(\)/);
  assert.match(game, /if \(controlsDisabled\) return/);
  assert.match(game, /speak\(prompt\.labels\[lang\], lang, settings\)/);
  assert.match(game, /onClick={replayPrompt}/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
  assert.match(game, /noch einmal anhören/);
  assert.match(game, /tekrar dinle/);
});

test("opposites playground keeps large visual controls and phone adaptation", () => {
  assert.match(css, /min-height:\s*clamp\(310px, 52vh, 520px\)/);
  assert.match(css, /width:\s*min\(64%, 290px\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /\.opposites-prompt-scene:active/);
  assert.match(css, /@media \(max-width: 650px\)/);
  assert.match(css, /\.opposites-mino-guide \{[\s\S]*?width: 72px;[\s\S]*?height: 82px/);
  assert.match(css, /prefers-reduced-motion/);
});

test("opposites playground stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/opposites-playground\.css/);
});
