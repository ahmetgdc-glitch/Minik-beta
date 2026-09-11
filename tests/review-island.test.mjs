import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/review-island.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/ReviewGame.jsx", import.meta.url), "utf8");

test("review rounds use an immersive Mino training island", () => {
  assert.match(game, /review-island__stage/);
  assert.match(game, /Trainingszeit mit Mino/);
  assert.match(game, /Visual item=\{target\}/);
  assert.match(css, /min-height: clamp\(250px, 38vh, 390px\)/);
});

test("review island keeps large choices on phones", () => {
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /min-height: 142px/);
});

test("review island stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/review-island\.css/);
});
