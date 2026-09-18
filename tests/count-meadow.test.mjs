import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/CountGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/count-meadow.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");

test("counting uses an immersive Mino meadow", () => {
  assert.match(game, /count-playground count-meadow/);
  assert.match(game, /count-meadow-header/);
  assert.match(game, /count-answer-stage/);
  assert.match(game, /Zähl mit Mino|Mino ile say/);
});

test("Mino is visibly present in the counting world without stealing touches", () => {
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(game, /Dokun • Dinle • Say/);
  assert.match(css, /\.count-mino-guide\s*\{[^}]*pointer-events:none/s);
  assert.match(css, /\.count-mino-guide \.mino-avatar/);
  assert.match(css, /\.count-meadow \.count-field::before/);
  assert.match(css, /\.count-meadow \.count-field::after/);
});

test("counting keeps one-tap-per-object progression and natural number speech", () => {
  assert.match(game, /countedRef\.current\.includes\(i\)/);
  assert.match(game, /const numberItem = itemsForWorld\("numbers"\)\[countedRef\.current\.length\]/);
  assert.match(game, /countedRef\.current = \[\.\.\.countedRef\.current, i\]/);
  assert.match(game, /await speak\(numberItem\.labels\[lang\], lang, settings\)/);
});

test("counting keeps answers locked until the final spoken number has finished", () => {
  assert.match(game, /const \[countingSpeech, setCountingSpeech\] = useState\(false\)/);
  assert.match(game, /const answersReady = allCounted && !countingSpeech/);
  assert.match(game, /const run = \+\+countSpeechRun\.current;[\s\S]*?setCountingSpeech\(true\);[\s\S]*?await speak\(numberItem\.labels\[lang\]/);
  assert.match(game, /if \(run === countSpeechRun\.current\) setCountingSpeech\(false\)/);
});

test("counting blocks answers until every object is counted and its final number is heard", () => {
  assert.match(game, /count-answer-stage \$\{answersReady \? "ready" : "locked"\}/);
  assert.match(game, /aria-disabled=\{!answersReady \|\| controlsDisabled \|\| undefined\}/);
  assert.match(game, /disabled=\{!answersReady \|\| controlsDisabled\}/);
  assert.match(game, /if \(!answersReady \|\| controlsDisabled\) return/);
  assert.match(css, /\.count-answer-stage\.locked \.number-options \{ pointer-events:none/);
});

test("counting blocks object and answer interactions while paused or lifecycle-blocked", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\)/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
  assert.match(game, /if \(controlsDisabled \|\| countedRef\.current\.includes\(i\)\) return/);
  assert.match(game, /onPick=\{\(item\) => \{[\s\S]*if \(!answersReady \|\| controlsDisabled\) return/);
  assert.match(game, /if \(!controlsDisabled\) return;[\s\S]*countSpeechRun\.current \+= 1;[\s\S]*setCountingSpeech\(false\)/);
});

test("count meadow keeps large responsive touch targets", () => {
  assert.match(css, /min-height:min\(72vh,820px\)|min-height: min\(72vh, 820px\)/);
  assert.match(css, /\.count-meadow \.count-object\s*\{[\s\S]*?min-height:min\(var\(--count-height\),210px\)/);
  assert.match(css, /@media \(max-width:700px\)[\s\S]*?\.count-meadow \.count-object \{ min-height:min\(var\(--count-height\),150px\)/);
  assert.match(css, /touch-action:manipulation|touch-action: manipulation/);
  assert.match(css, /@media \(max-width:700px\)|@media \(max-width: 700px\)/);
  assert.match(css, /prefers-reduced-motion:reduce|prefers-reduced-motion: reduce/);
  assert.match(css, /prefers-reduced-motion:reduce[\s\S]*?\.count-mino-guide \{ animation:none/);
});

test("count meadow stylesheet is loaded in production", () => {
  assert.match(main, /count-meadow\.css/);
});
