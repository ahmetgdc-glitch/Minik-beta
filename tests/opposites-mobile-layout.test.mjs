import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/games/opposites-playground.css", import.meta.url), "utf8");
const game = fs.readFileSync(new URL("../src/games/OppositesGame.jsx", import.meta.url), "utf8");

test("narrow iPhones keep opposites choices in a compact two-column visual grid", () => {
  assert.match(game, /data-difficulty=\{profile\.id\}/);
  assert.match(game, /profile\.options/);
  assert.match(game, /const showAnswerLabels = hint >= 3/);
  assert.match(game, /\{showAnswerLabels && <b>\{item\.labels\[lang\]\}<\/b>\}/);
  assert.match(game, /aria-label=\{item\.labels\[lang\]\}/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.opposites-stage\s*\{[\s\S]*?min-height: 390px[\s\S]*?padding: 16px/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.opposites-choice-grid\s*\{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)[\s\S]*?gap: 10px/);
  assert.match(css, /\.opposites-choice\s*\{[\s\S]*?aspect-ratio: 1 \/ 1[\s\S]*?padding: 10px[\s\S]*?border-radius: 22px/);
  assert.match(css, /\.opposites-playground\[data-difficulty="hard"\] \.opposites-choice \.item-visual[\s\S]*?width: min\(82%, 150px\)[\s\S]*?height: min\(82%, 150px\)/);
  assert.doesNotMatch(css, /@media \(max-width: 430px\)[\s\S]*?\.opposites-choice-grid\s*\{\s*grid-template-columns:\s*1fr/);
});
