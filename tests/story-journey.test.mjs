import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const story = fs.readFileSync(new URL("../src/games/StoryGame.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/games/story-journey.css", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("story game uses large picture-book pages instead of small scene cards", () => {
  assert.match(story, /className="story-journey"/);
  assert.match(story, /story-page story-page-listenable/);
  assert.match(story, /className="story-page-visual"/);
  assert.doesNotMatch(story, /story-scene-card/);
  assert.doesNotMatch(story, /story-strip/);
});

test("story narration handles one, two and three scene journeys without undefined labels", () => {
  assert.match(story, /function storySentence\(labels, lang\)/);
  assert.match(story, /if \(labels\.length <= 1\)/);
  assert.match(story, /if \(labels\.length === 2\)/);
  assert.match(story, /const story = storySentence\(labels, lang\)/);
  assert.doesNotMatch(story, /labels\[2\][\s\S]*const story = lang ===/);
});

test("story journey keeps the recall question and scoring behavior", () => {
  assert.match(story, /setQuestion\(true\)/);
  assert.match(story, /<OptionGrid/);
  assert.match(story, /disabled=\{controlsDisabled\}/);
  assert.match(story, /storyItems\.slice\(0, -1\)\.map/);
  assert.match(story, /item\.id === target\.id \? onSolve\(\[target\.id\]\) : onWrong\(\[target\.id\]\)/);
});

test("story pages replay their spoken labels only before recall begins", () => {
  assert.match(story, /async function hearStoryItem\(item\)/);
  assert.match(story, /if \(blocked\(\) \|\| question\) return/);
  assert.match(story, /await speak\(item\.labels\[lang\], lang, settings\)/);
  assert.match(story, /onClick=\{\(\) => hearStoryItem\(item\)\}/);
  assert.match(story, /onKeyDown=\{\(event\) => handleStoryKeyDown\(event, item\)\}/);
  assert.match(story, /<Volume2 size=\{18\} \/>/);
  assert.match(story, /aria-label=\{lang === "tr" \? `\$\{item\.labels\.tr\} kelimesini tekrar dinle` : `\$\{item\.labels\.de\} noch einmal anhören`\}/);
});

test("story page stays visibly linked to the label while speech is active", () => {
  assert.match(story, /const \[speakingId, setSpeakingId\] = useState\(null\)/);
  assert.match(story, /const speechRun = useRef\(0\)/);
  assert.match(story, /const run = \+\+speechRun\.current/);
  assert.match(story, /if \(run === speechRun\.current\) setSpeakingId\(null\)/);
  assert.match(story, /speakingId === item\.id \? "speaking" : ""/);
  assert.match(story, /speechRun\.current \+= 1;[\s\S]*setSpeakingId\(null\);[\s\S]*setQuestion\(true\)/);
  assert.match(css, /\.story-page-listenable\.speaking\s*\{/);
  assert.match(css, /\.story-page-listenable\.speaking \.story-page-visual\s*\{[\s\S]*?animation:\s*story-speaking-bounce/);
  assert.match(css, /@keyframes story-speaking-cue/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.story-page-listenable\.speaking \.story-page-visual/);
});

test("picture-book scenes remain large and clearly tappable on phones", () => {
  assert.match(css, /\.story-page\s*\{[\s\S]*?min-height:\s*clamp\(320px/);
  assert.match(css, /\.story-page-listenable\s*\{[\s\S]*?touch-action:\s*manipulation/);
  assert.match(css, /\.story-hear-cue/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /@media \(max-width: 360px\)/);
});

test("story journey stylesheet is loaded in production", () => {
  assert.match(main, /import "\.\/games\/story-journey\.css";/);
});
