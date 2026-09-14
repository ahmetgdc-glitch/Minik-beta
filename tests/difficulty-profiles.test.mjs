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
  ]) {
    assert.match(read(path), /difficultyProfile/iu, `${path} must use shared difficulty profiles`);
  }
});
