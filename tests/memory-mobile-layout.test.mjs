import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/games/memory-playground.css", import.meta.url), "utf8");
const game = fs.readFileSync(new URL("../src/games/MemoryGame.jsx", import.meta.url), "utf8");

const mobileStart = css.indexOf("@media (max-width: 700px)");
const desktopStart = css.indexOf("@media (min-width: 900px)");
const mobileCss = css.slice(mobileStart, desktopStart);

test("hard memory keeps twelve card positions visible in a three-column mobile board", () => {
  assert.ok(mobileStart >= 0 && desktopStart > mobileStart);
  assert.match(game, /profile\.memoryPairs/);
  assert.match(game, /className={`memory-grid cards-\$\{cards\.length\}`}/);
  assert.match(mobileCss, /\.memory-playground \.memory-grid\.cards-12\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);[^}]*gap:\s*8px;/);
  assert.match(mobileCss, /\.memory-playground \.memory-grid\.cards-12 \.memory-card\s*\{[^}]*border-radius:\s*18px;/);
  assert.match(mobileCss, /\.memory-playground \.memory-grid\.cards-12 \.memory-card \.item-visual\s*\{[^}]*width:\s*80%;[^}]*height:\s*80%;/);
  assert.doesNotMatch(mobileCss, /\.memory-playground \.memory-grid\.cards-12\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
});
