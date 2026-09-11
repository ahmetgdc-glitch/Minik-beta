import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/MatchGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/match-playground.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("matching uses a large twin playground with progress", () => {
  assert.match(game, /match-playground/);
  assert.match(game, /match-stage-header/);
  assert.match(game, /match-progress/);
  assert.match(game, /matching-zone-grid/);
  assert.match(game, /Finde die Zwillinge/);
});

test("matching preserves safe drag and tap placement", () => {
  assert.match(game, /useDragPlacement/);
  assert.match(game, /placePair/);
  assert.match(game, /paused \|\| interactionBlocked\(\)/);
  assert.match(game, /data-drop-id/);
});

test("matching playground stays large and adapts to phones", () => {
  assert.match(css, /min-height:420px/);
  assert.match(css, /@media\(max-width:760px\)/);
  assert.match(css, /grid-template-columns:1fr/);
  assert.match(css, /prefers-reduced-motion/);
});

test("matching playground stylesheet is loaded in production", () => {
  assert.match(main, /\.\/games\/match-playground\.css/);
});
