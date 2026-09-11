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

test("initial-letter target can replay the spoken learning word", () => {
  assert.match(game, /function hearTarget\(\)/);
  assert.match(game, /speak\(target\.labels\[lang\], lang, settings\)/);
  assert.match(game, /onClick=\{hearTarget\}/);
  assert.match(game, /onKeyDown=\{handleTargetKeyDown\}/);
  assert.match(game, /aria-label=\{replayLabel\}/);
});

test("initial-letter replay and letter choices respect paused and stale interaction guards", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(game, /function blocked\(\)/);
  assert.match(game, /return paused \|\| interactionBlocked\(\)/);
  assert.match(game, /if \(blocked\(\)\) return/);
  assert.match(game, /tabIndex=\{controlsDisabled \? -1 : 0\}/);
  assert.match(game, /aria-disabled=\{controlsDisabled \|\| undefined\}/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
});

test("initial-letter playground adapts to narrow phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:112px/);
});

test("initial-letter playground stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/letter-playground\.css/);
});
