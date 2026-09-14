import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/games/memory-playground.css", import.meta.url), "utf8");
const game = fs.readFileSync(new URL("../src/games/MemoryGame.jsx", import.meta.url), "utf8");

test("hard memory keeps twelve card positions visible in a three-column mobile board", () => {
  assert.match(game, /profile\.memoryPairs/);
  assert.match(game, /className={`memory-grid cards-\$\{cards\.length\}`}/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.memory-playground \.memory-grid\.cards-12\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)[\s\S]*?gap: 8px/);
  assert.match(css, /\.memory-playground \.memory-grid\.cards-12 \.memory-card\s*\{[\s\S]*?border-radius: 18px/);
  assert.match(css, /\.memory-playground \.memory-grid\.cards-12 \.memory-card \.visual[\s\S]*?width: 80%[\s\S]*?height: 80%/);
  assert.doesNotMatch(css, /@media \(max-width: 700px\)[\s\S]*?\.memory-playground \.memory-grid\.cards-12\s*\{[\s\S]*?grid-template-columns: repeat\(2,/);
});
