import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/letter-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/InitialLetterGame.jsx", import.meta.url), "utf8");

test("initial-letter game keeps a large visual target and toy-like letter choices", () => {
  assert.match(game, /initial-letter-target/);
  assert.match(game, /letter-choice-grid/);
  assert.match(css, /min-height:clamp\(280px,48svh,500px\)/);
  assert.match(css, /font:900 clamp\(2\.8rem,9vw,5\.4rem\)/);
});

test("initial-letter playground adapts to narrow phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:112px/);
});

test("initial-letter playground stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/letter-playground\.css/);
});
