import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/games/sort-workshop.css", import.meta.url), "utf8");
const game = fs.readFileSync(new URL("../src/games/SortGame.jsx", import.meta.url), "utf8");

test("mobile sorting keeps the workshop and Mino visible without shrinking touch targets", () => {
  assert.match(game, /aria-hidden="true"/);
  assert.match(game, /className="sort-mino-guide"/);
  assert.doesNotMatch(game, /<button[\s\S]*?sort-mino-guide/);
  assert.match(css, /@media \(max-width:700px\)[\s\S]*?\.sort-mino-guide \{[\s\S]*?width:54px; height:54px/);
  assert.match(css, /@media \(max-width:700px\)[\s\S]*?\.sort-mino-guide \{[\s\S]*?border-radius:17px/);
  assert.match(css, /@media \(max-width:700px\)[\s\S]*?\.sort-workshop \.sort-basket \{[\s\S]*?min-height:170px/);
  assert.match(css, /@media \(max-width:360px\)[\s\S]*?\.sort-workshop \.sort-basket \{[\s\S]*?min-height:154px/);
  assert.match(css, /touch-action:manipulation|touch-action: manipulation/);
});