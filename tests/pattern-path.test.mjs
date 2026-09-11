import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/PatternGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/pattern-path.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("pattern game uses a large visual path instead of the legacy row and option grid", () => {
  assert.match(game, /pattern-path-game/);
  assert.match(game, /pattern-path-sequence/);
  assert.match(game, /pattern-choice-grid/);
  assert.doesNotMatch(game, /className="pattern-row"/);
  assert.doesNotMatch(game, /<OptionGrid/);
});

test("pattern path nodes can replay their spoken labels without bypassing lifecycle guards", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(game, /function speakNode\(item\)/);
  assert.match(game, /if \(controlsDisabled\) return/);
  assert.match(game, /speak\(item\.labels\[lang\], lang, settings\)/);
  assert.match(game, /onClick=\{\(\) => speakNode\(base\[i\]\)\}/);
  assert.match(game, /role="button"/);
  assert.match(game, /tabIndex=\{controlsDisabled \? -1 : 0\}/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
});

test("pattern path keeps large child-first nodes and responsive controls", () => {
  assert.match(css, /min-height:\s*clamp\(330px, 55vh, 560px\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /@media \(max-width: 720px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("pattern path stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/pattern-path\.css/);
});
