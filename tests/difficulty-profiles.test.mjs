import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { difficultyProfile, difficultyLabel, normalizeDifficulty } from "../src/games/difficulty.js";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("difficulty profiles expose three distinct child-facing stages", () => {
  const easy = difficultyProfile(2);
  const medium = difficultyProfile(4);
  const hard = difficultyProfile(6);
  assert.equal(normalizeDifficulty(1), 2);
  assert.equal(normalizeDifficulty(5), 4);
  assert.equal(normalizeDifficulty(99), 6);
  assert.deepEqual([difficultyLabel(2, "de"), difficultyLabel(4, "de"), difficultyLabel(6, "de")], ["Leicht", "Mittel", "Schwer"]);
  assert.deepEqual([difficultyLabel(2, "tr"), difficultyLabel(4, "tr"), difficultyLabel(6, "tr")], ["Kolay", "Orta", "Zor"]);
  assert.ok(easy.options < medium.options && medium.options < hard.options);
  assert.ok(easy.memoryPairs < medium.memoryPairs && medium.memoryPairs < hard.memoryPairs);
  assert.ok(easy.puzzlePieces < medium.puzzlePieces && medium.puzzlePieces < hard.puzzlePieces);
  assert.ok(easy.countMax < medium.countMax && medium.countMax < hard.countMax);
  assert.ok(easy.hintDelayMs < medium.hintDelayMs && medium.hintDelayMs < hard.hintDelayMs);
  assert.ok(easy.demoAfterMistakes < medium.demoAfterMistakes && medium.demoAfterMistakes < hard.demoAfterMistakes);
});

test("core game families consume shared difficulty profiles instead of isolated magic numbers", () => {
  for (const path of [
    "src/games/shared.jsx",
    "src/games/MemoryGame.jsx",
    "src/games/PuzzleGame.jsx",
    "src/games/CountGame.jsx",
    "src/games/PatternGame.jsx",
    "src/games/MissingGame.jsx",
    "src/games/TraceGame.jsx",
    "src/games/StoryGame.jsx",
    "src/games/DailyOrderGame.jsx",
    "src/games/SocialStepsGame.jsx",
    "src/games/OppositesGame.jsx",
    "src/games/InitialLetterGame.jsx",
  ]) {
    assert.match(read(path), /difficultyProfile/iu, `${path} must use shared difficulty profiles`);
  }
});

test("hard story and routine games increase memory load and reduce visual text cues", () => {
  const story = read("src/games/StoryGame.jsx");
  const daily = read("src/games/DailyOrderGame.jsx");
  const social = read("src/games/SocialStepsGame.jsx");
  const opposites = read("src/games/OppositesGame.jsx");
  const initialLetter = read("src/games/InitialLetterGame.jsx");
  assert.match(story, /profile\.id === "easy" \? 2 : profile\.id === "medium" \? 3 : 4/);
  assert.match(story, /choicesFor\(target, items, profile\.options\)/);
  assert.match(daily, /profile\.id !== "hard" \|\| hint >= 1/);
  assert.match(social, /profile\.id !== "hard" \|\| hint >= 1/);
  assert.match(social, /profile\.id === "easy" \|\| hint >= 1/);
  assert.match(opposites, /profile\.id !== "hard" \|\| hint >= 1/);
  assert.match(initialLetter, /const optionCount = profile\.options/);
});
