import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/MemoryGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/memory-playground.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("memory renders inside the immersive playground shell", () => {
  assert.match(game, /memory-playground/);
  assert.match(game, /memory-playground-status/);
  assert.match(game, /memory-grid/);
});

test("memory playground keeps large touch targets and responsive layouts", () => {
  assert.match(css, /min-height:\s*clamp\(170px, 24vw, 280px\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("memory playground stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/memory-playground\.css/);
});
