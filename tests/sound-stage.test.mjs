import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/sound-stage.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/SoundsGame.jsx", import.meta.url), "utf8");

test("real-sound game uses an immersive sound stage", () => {
  assert.match(game, /sounds-playground/);
  assert.match(game, /sound-orb/);
  assert.match(css, /width:clamp\(210px,36vw,360px\)/);
  assert.match(css, /min-height:clamp\(190px,30svh,300px\)/);
});

test("real-sound stage keeps large answer choices on phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:clamp\(150px,24svh,220px\)/);
});

test("real-sound stage stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/sound-stage\.css/);
});
