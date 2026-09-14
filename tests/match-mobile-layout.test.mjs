import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/games/match-playground.css", import.meta.url), "utf8");
const game = fs.readFileSync(new URL("../src/games/MatchGame.jsx", import.meta.url), "utf8");

test("mobile match keeps sources and targets visible side by side without losing tap fallback", () => {
  assert.match(game, /useDragPlacement/);
  assert.match(game, /sourceProps\(item\.id\)/);
  assert.match(game, /onClick=\{\(\) => drop\(selected, item\.id\)\}/);
  assert.match(game, /Önce resmi, sonra eşini seç\./);
  assert.match(css, /@media \(max-width: 900px\)[\s\S]*?\.matching-board\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 46px minmax\(0, 1fr\)[\s\S]*?align-items: start/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.matching-board\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 34px minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.matching-zone-grid,[\s\S]*?\.pairs-2 \.matching-zone-grid\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.match-source,[\s\S]*?\.match-slot\s*\{[\s\S]*?min-height: clamp\(116px, 32vw, 158px\)/);
  assert.match(css, /@media \(max-width: 370px\)[\s\S]*?\.match-source,[\s\S]*?\.match-slot\s*\{[\s\S]*?min-height: 110px/);
  assert.doesNotMatch(css, /@media\s*\(max-width:\s*900px\)[^}]*\.matching-board\s*\{[^}]*grid-template-columns:\s*1fr/);
});
