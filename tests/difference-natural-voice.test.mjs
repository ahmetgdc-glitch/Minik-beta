import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const game = readFileSync(new URL("../src/games/DifferentGame.jsx", import.meta.url), "utf8");

test("difference game starts with recorded natural narration in both languages", () => {
  const de = "Drei Bilder sind gleich. Finde das andere.";
  const tr = "Üç resim aynı. Farklı olanı bul.";
  assert.ok(game.includes(de));
  assert.ok(game.includes(tr));
  assert.ok(naturalVoicePlan(de, "de").length > 0);
  assert.ok(naturalVoicePlan(tr, "tr").length > 0);
});
