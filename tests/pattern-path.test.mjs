import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/PatternGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/pattern-path.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");

test("pattern game uses a large visual path instead of the legacy row and option grid", () => {
  assert.match(game, /pattern-path-game/);
  assert.match(game, /pattern-path-sequence/);
  assert.match(game, /pattern-choice-grid/);
  assert.doesNotMatch(game, /className="pattern-row"/);
  assert.doesNotMatch(game, /<OptionGrid/);
});

test("Mino is visibly present in the pattern journey without blocking play", () => {
  assert.match(game, /pattern-mino-guide/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(css, /\.pattern-mino-guide\s*\{[^}]*pointer-events:\s*none/s);
  assert.match(css, /\.pattern-mino-guide \.mino-avatar/);
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

test("pattern answers stay visual-first until demonstration help", () => {
  assert.match(game, /\{hint >= 3 && <b>\{x\.labels\[lang\]\}<\/b>\}/);
  assert.doesNotMatch(game, /<Visual item=\{x\}[^>]*\/\>\s*<b>\{x\.labels\[lang\]\}<\/b>/);
  assert.match(game, /aria-label=\{x\.labels\[lang\]\}/);
});

test("pattern artwork rules target the actual Visual component class", () => {
  assert.match(css, /\.pattern-path-node \.item-visual\s*\{/);
  assert.match(css, /\.pattern-choice \.item-visual\s*\{/);
  assert.doesNotMatch(css, /\.pattern-path-node \.visual\s*\{/);
  assert.doesNotMatch(css, /\.pattern-choice \.visual\s*\{/);
});

test("pattern path keeps large child-first nodes and two-column phone answers", () => {
  assert.match(css, /min-height:\s*clamp\(330px, 55vh, 560px\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /@media \(max-width: 720px\)/);
  const phoneBlock = css.slice(css.indexOf("@media (max-width: 430px)"), css.indexOf("@media (prefers-reduced-motion"));
  assert.match(phoneBlock, /\.pattern-choice-grid \{ grid-template-columns: repeat\(2, minmax\(0,1fr\)\); \}/);
  assert.doesNotMatch(phoneBlock, /\.pattern-choice-grid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /prefers-reduced-motion:[\s\S]*?\.pattern-mino-guide[\s\S]*?animation:\s*none/);
});

test("pattern path stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/pattern-path\.css/);
});
