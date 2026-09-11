import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/DifferentGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/difference-playground.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("find-the-difference uses the immersive playground shell", () => {
  assert.match(game, /difference-playground/);
  assert.match(game, /different-grid/);
  assert.match(game, /different-tile/);
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
  assert.match(css, /prefers-reduced-motion/);
});

test("difference playground stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/difference-playground\.css/);
});
