import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const shared = readFileSync(new URL("../src/games/shared.jsx", import.meta.url), "utf8");
const count = readFileSync(new URL("../src/games/CountGame.jsx", import.meta.url), "utf8");
const listen = readFileSync(new URL("../src/games/ListenGame.jsx", import.meta.url), "utf8");
const shadow = readFileSync(new URL("../src/games/ShadowGame.jsx", import.meta.url), "utf8");
const sounds = readFileSync(new URL("../src/games/SoundsGame.jsx", import.meta.url), "utf8");
const review = readFileSync(new URL("../src/games/ReviewGame.jsx", import.meta.url), "utf8");
const story = readFileSync(new URL("../src/games/StoryGame.jsx", import.meta.url), "utf8");

test("OptionGrid exposes a real disabled state to every answer button", () => {
  assert.match(shared, /disabled = false/);
  assert.match(shared, /aria-disabled=\{disabled \|\| undefined\}/);
  assert.match(shared, /disabled=\{disabled\}/);
  assert.match(shared, /if \(!disabled\) onPick\(item\)/);
});

test("choice games wire the shared lock state into OptionGrid", () => {
  for (const [name, source] of Object.entries({ ShadowGame: shadow, SoundsGame: sounds, StoryGame: story })) {
    assert.match(source, /const controlsDisabled = paused \|\| interactionBlocked\(\);/, `${name} must derive the live session lock`);
    assert.match(source, /<OptionGrid[\s\S]*?disabled=\{controlsDisabled\}/, `${name} must disable its shared answer cards`);
  }
});

test("ListenGame custom visual islands preserve the full session lock", () => {
  assert.match(listen, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(listen, /className=\{`listen-choice listen-choice-/);
  assert.match(listen, /disabled=\{controlsDisabled\}/);
  assert.match(listen, /function pick\(item\) \{\s*if \(controlsDisabled\) return;/s);
  assert.doesNotMatch(listen, /<OptionGrid/);
});

test("ReviewGame training islands preserve the full session lock", () => {
  assert.match(review, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(review, /className=\{`review-island__choice review-choice-/);
  assert.match(review, /disabled=\{controlsDisabled\}/);
  assert.match(review, /function pick\(item\) \{\s*if \(controlsDisabled\) return;/s);
  assert.doesNotMatch(review, /<OptionGrid/);
});

test("counting answers are unfocusable and unclickable until every object is counted", () => {
  assert.match(count, /disabled=\{!allCounted \|\| controlsDisabled\}/);
  assert.match(count, /aria-disabled=\{!allCounted \|\| controlsDisabled \|\| undefined\}/);
  assert.match(count, /disabled=\{controlsDisabled\}/);
});
