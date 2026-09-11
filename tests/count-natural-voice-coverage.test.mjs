import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { itemsForWorld } from "../src/data/content.js";
import { hasGameVoiceClip } from "../src/audio/gameVoiceClips.js";

const countGame = readFileSync(new URL("../src/games/CountGame.jsx", import.meta.url), "utf8");

test("every number from one through twenty has natural speech in both languages", () => {
  const numbers = itemsForWorld("numbers");
  assert.equal(numbers.length, 20);
  for (const item of numbers) {
    assert.ok(hasGameVoiceClip(item.labels.de, "de"), `missing German voice for ${item.labels.de}`);
    assert.ok(hasGameVoiceClip(item.labels.tr, "tr"), `missing Turkish voice for ${item.labels.tr}`);
  }
});

test("counting game speaks the canonical number-world labels while children count", () => {
  assert.match(countGame, /itemsForWorld\("numbers"\)\[countedRef\.current\.length\]\.labels\[lang\]/);
  assert.match(countGame, /const maximum = difficulty === 2 \? 5 : difficulty === 4 \? 10 : 20/);
});
