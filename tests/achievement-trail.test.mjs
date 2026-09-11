import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const achievements = fs.readFileSync(new URL("../src/rewards/Achievements.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/rewards/achievement-trail.css", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("achievements use a milestone trail instead of the legacy card grid", () => {
  assert.match(achievements, /className="achievement-trail"/);
  assert.match(achievements, /className={`achievement-stop/);
  assert.match(achievements, /className="achievement-finish"/);
  assert.doesNotMatch(achievements, /achievement-grid/);
  assert.doesNotMatch(achievements, /achievement-card/);
});

test("achievement trail preserves locked and unlocked states", () => {
  assert.match(achievements, /achievement\.unlocked \? "unlocked" : "locked"/);
  assert.match(achievements, /achievement\.unlocked \? <Check/);
  assert.match(achievements, /<Lock size=/);
});

test("achievement trail remains large and adapts to small screens", () => {
  assert.match(css, /\.achievement-stop\s*\{[\s\S]*?min-height:\s*clamp\(250px/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(max-width: 380px\)/);
});

test("achievement trail stylesheet is part of the production entry", () => {
  assert.match(main, /import "\.\/rewards\/achievement-trail\.css";/);
});
