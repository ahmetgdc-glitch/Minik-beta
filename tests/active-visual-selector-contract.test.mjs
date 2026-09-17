import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const activeVisualStyles = [
  "speak-stage.css",
  "social-journey.css",
  "routine-journey.css",
  "memory-playground.css",
  "opposites-playground.css",
  "difference-playground.css",
  "pattern-path.css",
  "missing-stage.css",
  "letter-playground.css",
  "listen-playground.css",
  "review-island.css",
  "sound-stage.css",
  "shadow-playground.css",
];

test("active immersive game styles target Visual.jsx through item-visual", () => {
  for (const name of activeVisualStyles) {
    const css = readFileSync(new URL(`../src/games/${name}`, import.meta.url), "utf8");
    assert.match(css, /\.item-visual\b/, `${name} has no active item-visual rule`);
    assert.doesNotMatch(
      css,
      /\.visual\b/,
      `${name} still targets the removed legacy .visual class instead of .item-visual`,
    );
  }
});
