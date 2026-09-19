import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const game = fs.readFileSync(new URL("../src/games/ExploreGame.jsx", import.meta.url), "utf8");
const worlds = fs.readFileSync(new URL("../src/worlds/worlds.css", import.meta.url), "utf8");
const themes = fs.readFileSync(new URL("../src/worlds/scene-themes.css", import.meta.url), "utf8");

test("discovery celebrates with a gentle pulse once the last picture is found", () => {
  assert.match(game, /discovery-progress \$\{found\.length >= targetCount \? "all-found" : ""\}/);
  assert.match(worlds, /\.discovery-progress\.all-found \{[\s\S]*?animation:discoveryAllFound/);
  assert.match(worlds, /\.discovery-progress\.all-found i\.done \{[\s\S]*?animation:discoveryDotPop/);
  assert.match(worlds, /@keyframes discoveryAllFound/);
  assert.match(worlds, /@keyframes discoveryDotPop/);
  assert.match(themes, /prefers-reduced-motion[\s\S]*?\.discovery-progress\.all-found,[\s\S]*?\.discovery-progress\.all-found i\.done \{[\s\S]*?animation: none;/);
});