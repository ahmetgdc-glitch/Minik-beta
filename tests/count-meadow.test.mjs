import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/CountGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/count-meadow.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("counting uses an immersive Mino meadow", () => {
  assert.match(game, /count-playground count-meadow/);
  assert.match(game, /count-meadow-header/);
  assert.match(game, /count-answer-stage/);
  assert.match(game, /Zähl mit Mino|Mino ile say/);
});

test("counting keeps one-tap-per-object progression and natural number speech", () => {
  assert.match(game, /countedRef\.current\.includes\(i\)/);
  assert.match(game, /itemsForWorld\("numbers"\)\[countedRef\.current\.length\]\.labels\[lang\]/);
  assert.match(game, /countedRef\.current = \[\.\.\.countedRef\.current, i\]/);
});

test("counting blocks answers until every object has been counted", () => {
  assert.match(game, /count-answer-stage \$\{allCounted \? "ready" : "locked"\}/);
  assert.match(game, /aria-disabled=\{!allCounted \|\| paused \|\| undefined\}/);
  assert.match(game, /if \(!allCounted \|\| paused \|\| interactionBlocked\(\)\) return/);
  assert.match(css, /\.count-answer-stage\.locked \.number-options \{ pointer-events:none/);
});

test("counting blocks object and answer interactions while paused", () => {
  assert.match(game, /if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /disabled=\{paused\}/);
  assert.match(game, /onPick=\{\(item\) => \{[\s\S]*if \(!allCounted \|\| paused \|\| interactionBlocked\(\)\) return/);
});

test("count meadow keeps large responsive touch targets", () => {
  assert.match(css, /min-height:min\(72vh,820px\)|min-height: min\(72vh, 820px\)/);
  assert.match(css, /touch-action:manipulation|touch-action: manipulation/);
  assert.match(css, /@media \(max-width:700px\)|@media \(max-width: 700px\)/);
  assert.match(css, /prefers-reduced-motion:reduce|prefers-reduced-motion: reduce/);
});

test("count meadow stylesheet is loaded in production", () => {
  assert.match(main, /count-meadow\.css/);
});
