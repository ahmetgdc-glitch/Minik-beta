import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { itemsForWorld } from "../src/data/content.js";
import { hasGameVoiceClip } from "../src/audio/gameVoiceClips.js";
import { difficultyProfile } from "../src/games/difficulty.js";

const countGame = readFileSync(new URL("../src/games/CountGame.jsx", import.meta.url), "utf8");

test("every number from one through twenty has natural speech in both languages", () => {
  const numbers = itemsForWorld("numbers");
  assert.equal(numbers.length, 20);
  for (const item of numbers) {
    assert.ok(hasGameVoiceClip(item.labels.de, "de"), `missing German voice for ${item.labels.de}`);
    assert.ok(hasGameVoiceClip(item.labels.tr, "tr"), `missing Turkish voice for ${item.labels.tr}`);
  }
});

test("counting game speaks canonical number labels and scales its number range by difficulty", () => {
  assert.match(countGame, /const numberItem = itemsForWorld\("numbers"\)\[countedRef\.current\.length\]/);
  assert.match(countGame, /await speak\(numberItem\.labels\[lang\], lang, settings\)/);
  assert.match(countGame, /const profile = difficultyProfile\(difficulty\)/);
  assert.match(countGame, /const maximum = profile\.countMax/);
  assert.deepEqual(
    [difficultyProfile(2).countMax, difficultyProfile(4).countMax, difficultyProfile(6).countMax],
    [5, 10, 20],
  );
});
