import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/games/trace-playground.css", import.meta.url), "utf8");
const game = fs.readFileSync(new URL("../src/games/TraceGame.jsx", import.meta.url), "utf8");

test("mobile tracing stacks the Mino coach above the board and keeps the tracing touch surface clean", () => {
  assert.match(game, /className="trace-mino-guide"/);
  assert.match(game, /aria-hidden="true"/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.trace-court \{[\s\S]*?flex-direction: column/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.trace-mino-guide \{[\s\S]*?width: clamp\(84px, 22vw, 120px\)/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.trace-mino-guide \{[\s\S]*?width: clamp\(72px, 20vw, 96px\)/);
  assert.match(css, /@media \(max-width: 700px\)[\s\S]*?\.trace-board \{[\s\S]*?width: min\(94vw, 560px\)/);
  assert.match(css, /touch-action: none/);
  assert.match(game, /onPointerDown=\{start\}/);
  assert.match(game, /onPointerMove=\{follow\}/);
});