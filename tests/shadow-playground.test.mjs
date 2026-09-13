import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/shadow-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/ShadowGame.jsx", import.meta.url), "utf8");

test("shadow game renders inside an immersive cave playground", () => {
  assert.match(game, /shadow-playground/);
  assert.match(game, /shadow-stage/);
  assert.match(game, /shadow-cave-glow/);
  assert.match(game, /shadow-mino-guide/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\}/);
  assert.match(css, /min-height:clamp\(330px,50svh,520px\)/);
  assert.match(css, /width:min\(56vw,340px\)/);
});

test("shadow stage replays only the spoken task and keeps the answer hidden", () => {
  assert.match(game, /function repeatPrompt\(\)/);
  assert.match(game, /speak\(text, lang, settings\)/);
  assert.match(game, /onClick=\{repeatPrompt\}/);
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\)/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
  assert.match(game, /shadow-listen-hint/);
  assert.match(game, /<Volume2 size=\{24\} \/>/);
  assert.doesNotMatch(game, /🔊/);
  assert.doesNotMatch(game, /speak\(target\.labels/);
});

test("shadow answers use cave stones instead of shared answer cards", () => {
  assert.match(game, /shadow-choice-field/);
  assert.match(game, /className=\{`shadow-choice shadow-choice-/);
  assert.match(game, /<Visual item=\{item\} lang=\{lang\} photos=\{settings\.photos\}/);
  assert.doesNotMatch(game, /OptionGrid/);
  assert.match(css, /\.shadow-choice\{[^}]*min-height:clamp\(195px,29svh,300px\)/s);
  assert.match(css, /\.shadow-choice-field\.choices-6\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
});

test("shadow cave choices preserve lifecycle locks and hint emphasis", () => {
  assert.match(game, /function pick\(item\) \{\s*if \(controlsDisabled\) return;/s);
  assert.match(game, /disabled=\{controlsDisabled\}/);
  assert.match(game, /hint >= 2 && isTarget/);
  assert.match(game, /hint-target/);
  assert.match(game, /quiet-option/);
});

test("shadow playground keeps large answer choices on narrow phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /\.shadow-choice-field,\.shadow-choice-field\.choices-6\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:clamp\(150px,24svh,220px\)/);
});

test("shadow playground respects reduced motion and is loaded in production", () => {
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.shadow-mino-guide/);
  assert.match(entry, /\.\/games\/shadow-playground\.css/);
});
