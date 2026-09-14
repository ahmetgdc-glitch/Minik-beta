import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const css = fs.readFileSync(new URL("../src/games/social-journey.css", import.meta.url), "utf8");
const game = fs.readFileSync(new URL("../src/games/SocialStepsGame.jsx", import.meta.url), "utf8");

test("narrow iPhones keep social safety steps as a compact vertical story", () => {
  assert.match(game, /data-difficulty=\{profile\.id\}/);
  assert.match(game, /showSequenceLabels = profile\.id === "easy" \|\| hint >= 1/);
  assert.match(game, /className="social-step-card complete social-step-listenable"/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.social-sequence-strip\s*\{[\s\S]*?gap: 6px[\s\S]*?padding: 12px[\s\S]*?border-radius: 26px/);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.social-step-card\s*\{[\s\S]*?min-height: 118px[\s\S]*?grid-template-columns: minmax\(78px, 96px\) minmax\(0, 1fr\) 34px/);
  assert.match(css, /\.social-step-card\.question\s*\{[\s\S]*?min-height: 98px/);
  assert.match(css, /\.social-steps-game \.answer-grid\s*\{[\s\S]*?gap: 10px/);
  assert.match(css, /\.social-steps-game\[data-difficulty="hard"\] \.social-step-card\.complete \.visual[\s\S]*?width: min\(100%, 106px\)[\s\S]*?max-height: 106px/);
  assert.doesNotMatch(css, /@media \(max-width: 430px\)[\s\S]*?\.social-sequence-strip\s*\{[\s\S]*?grid-template-columns: repeat\(/);
});
