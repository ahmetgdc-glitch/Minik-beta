import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const story = fs.readFileSync(new URL("../src/games/StoryGame.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/games/story-journey.css", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("story game uses large picture-book pages instead of small scene cards", () => {
  assert.match(story, /className="story-journey"/);
  assert.match(story, /className="story-page"/);
  assert.match(story, /className="story-page-visual"/);
  assert.doesNotMatch(story, /story-scene-card/);
  assert.doesNotMatch(story, /story-strip/);
});

test("story journey keeps the recall question and scoring behavior", () => {
  assert.match(story, /setQuestion\(true\)/);
  assert.match(story, /<OptionGrid/);
  assert.match(story, /item\.id === target\.id \? onSolve\(\[target\.id\]\) : onWrong\(\[target\.id\]\)/);
});

test("picture-book scenes remain large on phones", () => {
  assert.match(css, /\.story-page\s*\{[\s\S]*?min-height:\s*clamp\(320px/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(max-width: 360px\)/);
});

test("story journey stylesheet is loaded in production", () => {
  assert.match(main, /import "\.\/games\/story-journey\.css";/);
});
