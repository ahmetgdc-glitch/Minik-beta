import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { hasGameVoiceClip } from "../src/audio/gameVoiceClips.js";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const game = readFileSync(new URL("../src/games/MissingGame.jsx", import.meta.url), "utf8");

test("missing-object game has natural narration before and after the object vanishes", () => {
  const prompts = [
    ["Schau dir die Bilder gut an.", "de"],
    ["Resimlere dikkatle bak.", "tr"],
    ["Welches Bild ist verschwunden?", "de"],
    ["Hangi resim kayboldu?", "tr"],
  ];
  for (const [text, lang] of prompts) {
    assert.ok(game.includes(text), `game must use prompt: ${text}`);
    assert.ok(naturalVoicePlan(text, lang).length > 0 || hasGameVoiceClip(text, lang), `missing natural voice: ${text}`);
  }
});
