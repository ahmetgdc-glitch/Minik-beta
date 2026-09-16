import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/MissingGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/missing-stage.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");

test("missing-object game uses an immersive memory stage instead of the legacy remember row", () => {
  assert.match(game, /missing-stage-game/);
  assert.match(game, /missing-object-row/);
  assert.match(game, /missing-choice-grid/);
  assert.doesNotMatch(game, /className="remember-row"/);
  assert.doesNotMatch(game, /<OptionGrid/);
});

test("Mino stays visibly present in the memory stage without intercepting touches", () => {
  assert.match(game, /missing-mino-guide/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(css, /\.missing-mino-guide\s*\{[^}]*pointer-events:\s*none/s);
  assert.match(css, /\.missing-mino-guide \.mino-avatar/);
});

test("missing-object preview lets children hear visible words before the memory question", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(game, /function replayPreview\(item\)/);
  assert.match(game, /if \(hidden \|\| controlsDisabled\) return/);
  assert.match(game, /speak\(item\.labels\[lang\], lang, settings\)/);
  assert.match(game, /listening-target/);
  assert.match(game, /role={!hidden \? "button" : undefined}/);
  assert.match(game, /tabIndex={!hidden && !controlsDisabled \? 0 : undefined}/);
  assert.match(game, /aria-disabled={!hidden && controlsDisabled \? true : undefined}/);
  assert.match(game, /onKeyDown=\{\(event\) => previewKeyDown\(event, x\)\}/);
});

test("missing-object choices and continue button are truly disabled while locked", () => {
  assert.match(game, /disabled=\{controlsDisabled\}/);
  assert.match(game, /aria-disabled=\{controlsDisabled \|\| undefined\}/);
});

test("missing artwork rules target the actual Visual component class", () => {
  assert.match(css, /\.missing-object-slot \.item-visual\s*\{/);
  assert.match(css, /\.missing-choice \.item-visual\s*\{/);
  assert.doesNotMatch(css, /\.missing-object-slot \.visual\s*\{/);
  assert.doesNotMatch(css, /\.missing-choice \.visual\s*\{/);
});

test("missing-object stage preserves a visible vanished slot and large child-first controls", () => {
  assert.match(game, /missing-object-slot/);
  assert.match(game, /vanished/);
  assert.match(css, /min-height:\s*clamp\(330px, 56vh, 560px\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /\.missing-object-slot\.listening-target:active/);
  assert.match(css, /@media \(max-width: 680px\)/);
  const phoneBlock = css.slice(css.indexOf("@media (max-width: 430px)"), css.indexOf("@media (prefers-reduced-motion"));
  assert.match(phoneBlock, /\.missing-choice-grid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
  assert.doesNotMatch(phoneBlock, /\.missing-choice-grid\s*\{\s*grid-template-columns:\s*1fr/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /prefers-reduced-motion:[\s\S]*?\.missing-mino-guide[\s\S]*?animation:\s*none/);
});

test("missing-object stage stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/missing-stage\.css/);
});
