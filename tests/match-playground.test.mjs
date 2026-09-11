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

test("matching makes artwork substantially larger and stays phone friendly", () => {
  assert.match(css, /min-height:clamp\(500px,58svh,650px\)/);
  assert.match(css, /height:clamp\(185px,24svh,270px\)/);
  assert.match(css, /@media\(max-width:520px\)/);
  assert.match(css, /height:145px/);
  assert.match(css, /prefers-reduced-motion/);
});

test("matching can expand beyond the legacy narrow game area", () => {
  assert.match(css, /game-area:has\(> \.match-playground\)/);
  assert.match(css, /max-width:1260px/);
});

test("matching playground stylesheet is loaded in production", () => {
  assert.match(main, /\.\/games\/match-playground\.css/);
});
