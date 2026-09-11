import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/listen-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/ListenGame.jsx", import.meta.url), "utf8");

test("listening game uses its own immersive audio stage", () => {
  assert.match(game, /listen-playground/);
  assert.match(game, /listen-orb/);
  assert.match(css, /width:clamp\(180px,31vw,320px\)/);
  assert.match(css, /min-height:clamp\(190px,30svh,310px\)/);
});

test("listening playground keeps large choices on phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:clamp\(150px,24svh,225px\)/);
});

test("listening playground stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/listen-playground\.css/);
});
