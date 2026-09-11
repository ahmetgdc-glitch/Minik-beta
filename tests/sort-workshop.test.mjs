import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/SortGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/sort-workshop.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("sorting uses an immersive Mino workshop", () => {
  assert.match(game, /sort-playground sort-workshop/);
  assert.match(game, /sort-workshop-header/);
  assert.match(game, /sort-object-stage/);
  assert.match(game, /sort-baskets/);
  assert.match(game, /Mino'nun ayırma atölyesi|Minos Sortierwerkstatt/);
});

test("sorting preserves drag placement and tap fallback", () => {
  assert.match(game, /useDragPlacement/);
  assert.match(game, /placement\.sourceProps\(target\.id\)/);
  assert.match(game, /data-drop-id=\{g\.id\}/);
  assert.match(game, /onClick=\{\(\) => place\(target\.id, g\.id\)\}/);
  assert.match(game, /interactionBlocked\(\)/);
});

test("sorting keeps large targets and phone adaptation", () => {
  assert.match(css, /min-height: min\(72vh, 820px\)/);
  assert.match(css, /grid-template-columns:repeat\(2|minmax/);
  assert.match(css, /touch-action:none|touch-action: none/);
  assert.match(css, /touch-action:manipulation|touch-action: manipulation/);
  assert.match(css, /@media \(max-width:700px\)|@media \(max-width: 700px\)/);
});

test("sorting shows explicit drag feedback and reduced motion support", () => {
  assert.match(game, /drop-hover/);
  assert.match(game, /Buraya bırak!|Hier ablegen!/);
  assert.match(css, /prefers-reduced-motion:reduce|prefers-reduced-motion: reduce/);
});

test("sorting workshop stylesheet is loaded in production", () => {
  assert.match(main, /sort-workshop\.css/);
});
