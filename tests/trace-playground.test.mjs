import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/trace-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/TraceGame.jsx", import.meta.url), "utf8");

test("tracing uses a large touch-first playground", () => {
  assert.match(game, /trace-board/);
  assert.match(css, /width: min\(78vw, 620px\)/);
  assert.match(css, /touch-action: none/);
  assert.match(css, /max-height: min\(70svh, 620px\)/);
});

test("tracing expands for phones", () => {
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /width: min\(94vw, 560px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
});

test("tracing playground stylesheet is loaded", () => {
  assert.match(entry, /\.\/games\/trace-playground\.css/);
});
