import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/DailyOrderGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/routine-journey.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("daily order uses an immersive routine scene instead of the legacy answer card grid", () => {
  assert.match(game, /routine-journey-stage/);
  assert.match(game, /routine-next-scenes/);
  assert.match(game, /routine-next-scene/);
  assert.doesNotMatch(game, /className={`answer-grid/);
  assert.doesNotMatch(game, /answer-card/);
});

test("routine prompt can replay the current step without bypassing lifecycle guards", () => {
  assert.match(game, /function replayPrompt\(\)/);
  assert.match(game, /if \(paused \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /speak\(prompt\.labels\[lang\], lang, settings\)/);
  assert.match(game, /className="routine-now-scene"/);
  assert.match(game, /onClick=\{replayPrompt\}/);
  assert.match(game, /disabled=\{paused\}/);
});

test("routine journey keeps large child-first scenes with phone adaptation", () => {
  assert.match(css, /min-height:\s*clamp\(300px, 58vh, 560px\)/);
  assert.match(css, /width:\s*min\(52vw, 320px\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("routine journey stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/routine-journey\.css/);
});
