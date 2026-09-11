import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const screen = fs.readFileSync(new URL("../src/app/GamesScreen.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/app/playground.css", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("games screen uses the immersive playground instead of the legacy card grid", () => {
  assert.match(screen, /className="activity-playground"/);
  assert.match(screen, /className="playground-feature"/);
  assert.match(screen, /className="playground-river"/);
  assert.doesNotMatch(screen, /className="games-grid"/);
  assert.doesNotMatch(screen, /className="game-card"/);
});

test("world choice stays immersive after selecting a game", () => {
  assert.match(screen, /className="world-islands"/);
  assert.match(screen, /className="world-island"/);
  assert.doesNotMatch(screen, /<WorldCard/);
  assert.doesNotMatch(screen, /className="world-grid"/);
});

test("playground keeps large child-first touch scenes with narrow-phone adaptation", () => {
  assert.match(css, /\.playground-feature\s*\{[\s\S]*?min-height:\s*clamp\(230px/);
  assert.match(css, /\.playground-island\s*\{[\s\S]*?min-height:\s*clamp\(230px/);
  assert.match(css, /\.world-island\s*\{[\s\S]*?min-height:\s*clamp\(250px/);
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("playground stylesheet is part of the production entry", () => {
  assert.match(main, /import "\.\/app\/playground\.css";/);
});
