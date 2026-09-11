import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/shadow-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/ShadowGame.jsx", import.meta.url), "utf8");

test("shadow game renders inside an immersive cave playground", () => {
  assert.match(game, /shadow-playground/);
  assert.match(game, /shadow-stage/);
  assert.match(css, /min-height:clamp\(300px,48svh,500px\)/);
  assert.match(css, /width:min\(56vw,330px\)/);
});

test("shadow stage replays only the spoken task and keeps the answer hidden", () => {
  assert.match(game, /function repeatPrompt\(\)/);
  assert.match(game, /speak\(text, lang, settings\)/);
  assert.match(game, /onClick=\{repeatPrompt\}/);
  assert.match(game, /if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /shadow-listen-hint/);
  assert.doesNotMatch(game, /speak\(target\.labels/);
});

test("shadow playground keeps large answer choices on narrow phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:clamp\(150px,24svh,220px\)/);
});

test("shadow playground stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/shadow-playground\.css/);
});
