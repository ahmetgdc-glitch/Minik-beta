import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/social-journey.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/SocialStepsGame.jsx", import.meta.url), "utf8");

test("social steps use a large visual journey", () => {
  assert.match(game, /social-sequence-strip/);
  assert.match(game, /social-step-card complete/);
  assert.match(css, /min-height: clamp\(260px, 38vw, 420px\)/);
  assert.match(css, /grid-template-columns: 1fr auto 1fr auto 1fr/);
});

test("social journey becomes a vertical route on phones", () => {
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(css, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
});

test("social journey stylesheet is loaded", () => {
  assert.match(entry, /\.\/games\/social-journey\.css/);
});
