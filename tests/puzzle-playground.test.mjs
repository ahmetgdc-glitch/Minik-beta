import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/puzzle-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/PuzzleGame.jsx", import.meta.url), "utf8");

test("puzzle uses a large playmat and reference scene", () => {
  assert.match(game, /puzzle-layout/);
  assert.match(game, /puzzle-reference/);
  assert.match(css, /width: min\(100%, 560px\)/);
  assert.match(css, /aspect-ratio: 1/);
});

test("puzzle remains large on phones", () => {
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /width: min\(92vw, 520px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
});

test("puzzle playground stylesheet is loaded", () => {
  assert.match(entry, /\.\/games\/puzzle-playground\.css/);
});
