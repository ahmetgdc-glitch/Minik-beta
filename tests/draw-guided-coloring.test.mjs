import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/DrawGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/draw-coloring.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("drawing offers a spill-proof smart coloring mode for templates", () => {
  assert.match(game, /smartColor/);
  assert.match(game, /Zauber-Ausmalen/);
  assert.match(game, /Taşırmadan boya/);
  assert.match(game, /destination-in/);
  assert.match(game, /confineToTemplate/);
});

test("smart coloring samples the source artwork for correct automatic colors", () => {
  assert.match(game, /getImageData/);
  assert.match(game, /guidedColorAt/);
  assert.match(game, /Renkler otomatik/);
  assert.match(game, /Farben automatisch/);
});

test("switching coloring templates resets incompatible old paint safely", () => {
  assert.match(game, /function selectTemplate/);
  assert.match(game, /resetCanvas\(\)/);
  assert.match(game, /setSmartColor\(Boolean\(item\)\)/);
});

test("guided coloring has dedicated mobile and reduced-motion styling", () => {
  assert.match(css, /smart-color-toggle/);
  assert.match(css, /smart-coloring/);
  assert.match(css, /@media\(max-width:680px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(main, /\.\/games\/draw-coloring\.css/);
});
