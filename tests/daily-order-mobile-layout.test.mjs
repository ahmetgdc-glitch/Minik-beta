import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/games/routine-journey.css", import.meta.url), "utf8");
const game = fs.readFileSync(new URL("../src/games/DailyOrderGame.jsx", import.meta.url), "utf8");

test("narrow iPhones keep daily-order choices in a compact two-column visual grid", () => {
  assert.match(game, /data-difficulty=\{profile\.id\}/);
  assert.match(game, /profile\.options/);
  assert.match(game, /profile\.id !== "hard" \|\| hint >= 1/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.routine-journey-stage\s*\{[\s\S]*?min-height: 350px[\s\S]*?padding: 16px/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.routine-next-scenes\s*\{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)[\s\S]*?gap: 10px/);
  assert.match(css, /\.routine-next-scene\s*\{[\s\S]*?aspect-ratio: 1 \/ 1[\s\S]*?padding: 10px[\s\S]*?border-radius: 22px/);
  assert.match(css, /\.routine-order-game\[data-difficulty="hard"\] \.routine-next-scene \.item-visual[\s\S]*?width: min\(82%, 150px\)[\s\S]*?height: min\(82%, 150px\)/);
  assert.doesNotMatch(css, /@media \(max-width: 430px\)[\s\S]*?\.routine-next-scenes\s*\{\s*grid-template-columns:\s*1fr/);
});
