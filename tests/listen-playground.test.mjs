import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/listen-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/ListenGame.jsx", import.meta.url), "utf8");

test("listening game uses an immersive Mino listening station", () => {
  assert.match(game, /listen-playground/);
  assert.match(game, /listen-stage/);
  assert.match(game, /listen-orb/);
  assert.match(game, /Minos Hörstation/);
  assert.match(game, /listen-wave/);
  assert.match(css, /min-height:clamp\(300px,48svh,470px\)/);
  assert.match(css, /width:clamp\(190px,30vw,330px\)/);
  assert.match(css, /min-height:clamp\(190px,30svh,310px\)/);
});

test("listening replay and answer paths share lifecycle safety", () => {
  assert.match(game, /function repeatWord\(\)/);
  assert.match(game, /if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /onClick=\{repeatWord\}/);
  assert.match(game, /disabled=\{paused\}/);
});

test("listening playground keeps large choices on phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /grid-template-columns:1fr/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:clamp\(150px,24svh,225px\)/);
});

test("listening playground respects reduced motion and is loaded in production", () => {
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(entry, /\.\/games\/listen-playground\.css/);
});
