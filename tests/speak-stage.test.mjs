import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/speak-stage.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/SpeakGame.jsx", import.meta.url), "utf8");

test("speaking game uses a large visual speech stage", () => {
  assert.match(game, /speak-hero/);
  assert.match(game, /mic-button/);
  assert.match(css, /min-height: clamp\(260px, 40vw, 430px\)/);
  assert.match(css, /width: min\(82vw, 360px\)/);
});

test("speaking stage stays touch friendly on phones", () => {
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /width: min\(92vw, 360px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
});

test("speaking stage stylesheet is loaded", () => {
  assert.match(entry, /\.\/games\/speak-stage\.css/);
});
