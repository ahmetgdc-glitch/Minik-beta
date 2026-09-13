import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/listen-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/ListenGame.jsx", import.meta.url), "utf8");

test("listening game uses an immersive Mino listening station", () => {
  assert.match(game, /listen-playground/);
  assert.match(game, /listen-stage/);
  assert.match(game, /listen-orb/);
  assert.match(game, /Minos Hörstation/);
  assert.match(game, /listen-wave/);
  assert.match(game, /listen-mino/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\}/);
  assert.match(css, /min-height:clamp\(320px,50svh,500px\)/);
  assert.match(css, /width:clamp\(185px,25vw,315px\)/);
});

test("listening choices are dedicated visual islands instead of the shared answer-card grid", () => {
  assert.match(game, /listen-choice-field/);
  assert.match(game, /className=\{`listen-choice listen-choice-/);
  assert.match(game, /<Visual item=\{item\} lang=\{lang\} photos=\{settings\.photos\}/);
  assert.doesNotMatch(game, /OptionGrid/);
  assert.match(css, /\.listen-choice\{[^}]*min-height:clamp\(210px,30svh,330px\)/s);
  assert.match(css, /\.listen-choice-field\.choices-6\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)\}/);
});

test("listening choices preserve lifecycle locks and Mino hint emphasis", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\)/);
  assert.match(game, /if \(controlsDisabled\) return/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
  assert.match(game, /hint >= 2 && isTarget/);
  assert.match(game, /hint-target/);
  assert.match(game, /quiet-option/);
});

test("listening replay speaks only the target word and keeps lifecycle safety", () => {
  assert.match(game, /function repeatWord\(\)/);
  assert.match(game, /speak\(target\.labels\[lang\], lang, settings\)/);
  assert.match(game, /onClick=\{repeatWord\}/);
});

test("listening playground keeps large choices on phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /grid-template-columns:minmax\(0,\.72fr\) minmax\(0,1fr\)/);
  assert.match(css, /\.listen-choice-field,\.listen-choice-field\.choices-6\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:clamp\(150px,24svh,225px\)/);
});

test("listening playground respects reduced motion and is loaded in production", () => {
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /\.listen-orb,\.listen-mino-ring,\.listen-choice\.hint-target\{animation:none\}/);
  assert.match(entry, /\.\/games\/listen-playground\.css/);
});
