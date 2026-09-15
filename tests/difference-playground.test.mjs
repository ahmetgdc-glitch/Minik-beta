import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/DifferentGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/difference-playground.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");

test("find-the-difference uses the immersive playground shell", () => {
  assert.match(game, /difference-playground/);
  assert.match(game, /different-grid/);
  assert.match(game, /different-tile/);
});

test("difference game keeps Mino visibly inside the play world without stealing interaction", () => {
  assert.match(game, /import Visual, \{ MinoAvatar \}/);
  assert.match(game, /progress,/);
  assert.match(game, /className="difference-detective" aria-hidden="true"/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(game, /className="difference-lens"/);
  assert.match(css, /\.difference-detective\s*\{[^}]*pointer-events:\s*none/);
  assert.match(css, /\.difference-detective \.mino-avatar/);
  assert.match(css, /grid-template-columns:\s*clamp\(108px, 14vw, 165px\) minmax\(0, 1fr\)/);
});

test("difference tiles are disabled in paused and stale transition states", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(game, /if \(controlsDisabled\) return/);
  assert.match(game, /aria-disabled=\{controlsDisabled \|\| undefined\}/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
});

test("difference playground keeps large touch tiles and phone adaptation", () => {
  assert.match(css, /min-height:\s*clamp\(190px, 31vw, 340px\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /grid-template-columns:\s*1fr/);
  assert.match(css, /\.difference-detective\s*\{[\s\S]*?min-height:\s*66px[\s\S]*?height:\s*66px/);
  assert.match(css, /prefers-reduced-motion/);
});

test("difference playground stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/difference-playground\.css/);
});
