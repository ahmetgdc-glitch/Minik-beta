import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/puzzle-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/PuzzleGame.jsx", import.meta.url), "utf8");

test("puzzle uses loose pieces and a real destination board instead of tile swapping", () => {
  assert.match(game, /real-puzzle-board/);
  assert.match(game, /puzzle-tray/);
  assert.match(game, /useDragPlacement/);
  assert.match(game, /data-drop-id=\{slotId\(index\)\}/);
  assert.match(game, /piece !== slot/);
  assert.doesNotMatch(game, /\[next\[i\], next\[selected\]\]/);
});

test("puzzle adapts from four to six to nine pieces", () => {
  assert.match(game, /difficulty === 6[^\n]+count: 9/);
  assert.match(game, /difficulty === 4[^\n]+count: 6/);
  assert.match(game, /count: 4/);
  assert.match(game, /backgroundSize: `\$\{cols \* 100\}% \$\{rows \* 100\}%`/);
});

test("puzzle pieces are visibly puzzle-shaped and large on phones", () => {
  assert.match(css, /puzzle-piece\.shape-0/);
  assert.match(css, /clip-path:polygon/);
  assert.match(css, /max-width:760px/);
  assert.match(css, /@media\(max-width:480px\)/);
  assert.match(css, /min-height:108px/);
});

test("puzzle keeps lifecycle-safe drag and tap placement", () => {
  assert.match(game, /if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /paused,/);
  assert.match(game, /interactionBlocked,/);
});

test("puzzle playground stylesheet is loaded", () => {
  assert.match(entry, /\.\/games\/puzzle-playground\.css/);
});
