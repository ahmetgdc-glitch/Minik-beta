import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const gameFiles = [
  "SpeakGame.jsx",
  "SocialStepsGame.jsx",
  "DifferentGame.jsx",
  "DailyOrderGame.jsx",
  "OppositesGame.jsx",
  "InitialLetterGame.jsx",
  "StoryGame.jsx",
  "ReviewGame.jsx",
  "ExploreGame.jsx",
  "DrawGame.jsx",
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
];

test("every interactive MINIK game consumes the synchronous lifecycle guard", () => {
  for (const file of gameFiles) {
    const source = fs.readFileSync(`src/games/${file}`, "utf8");
    assert.match(
      source,
      /interactionBlocked/,
      `${file} must consume GameSession's synchronous interaction guard`,
    );
  }
});

test("GameSession forwards the same guard to the mounted game", () => {
  const source = fs.readFileSync("src/games/GameSession.jsx", "utf8");
  assert.match(source, /interactionBlocked=\{interactionBlocked\}/);
});
