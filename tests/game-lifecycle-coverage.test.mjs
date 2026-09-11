import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const interactiveGames = [
  "ListenGame.jsx",
  "MemoryGame.jsx",
  "MatchGame.jsx",
  "SortGame.jsx",
  "CountGame.jsx",
  "SoundsGame.jsx",
  "PuzzleGame.jsx",
  "ShadowGame.jsx",
  "MissingGame.jsx",
  "PatternGame.jsx",
  "TraceGame.jsx",
  "RhythmGame.jsx",
  "DrawGame.jsx",
  "ExploreGame.jsx",
  "ReviewGame.jsx",
  "StoryGame.jsx",
  "InitialLetterGame.jsx",
  "OppositesGame.jsx",
  "DailyOrderGame.jsx",
  "DifferentGame.jsx",
  "SocialStepsGame.jsx",
  "SpeakGame.jsx",
];

test("every interactive game accepts the shared synchronous lifecycle guard", () => {
  const missing = [];
  for (const name of interactiveGames) {
    const source = readFileSync(new URL(`../src/games/${name}`, import.meta.url), "utf8");
    if (!/interactionBlocked/.test(source)) missing.push(name);
  }
  assert.deepEqual(missing, [], `Games missing interactionBlocked: ${missing.join(", ")}`);
});

test("interactive games recheck the guard inside their own input path", () => {
  const missing = [];
  for (const name of interactiveGames) {
    const source = readFileSync(new URL(`../src/games/${name}`, import.meta.url), "utf8");
    if (!/interactionBlocked\(\)/.test(source)) missing.push(name);
  }
  assert.deepEqual(missing, [], `Games not invoking interactionBlocked(): ${missing.join(", ")}`);
});
