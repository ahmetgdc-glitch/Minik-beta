import test from "node:test";
import assert from "node:assert/strict";
import { personalVoiceClip } from "../src/audio/personalVoiceClips.js";

const phrases = {
  de: [
    "Schau noch einmal.",
    "Soll ich dir helfen?",
    "Super gemacht!",
    "Wunderbar!",
    "Das hast du toll gemacht!",
  ],
  tr: [
    "Bir daha bak.",
    "Sana yardım edeyim mi?",
    "Harika!",
    "Çok güzel yaptın!",
  ],
};

test("central GameSession narration resolves to personal MINIK recordings", () => {
  for (const [lang, texts] of Object.entries(phrases)) {
    for (const text of texts) {
      assert.ok(personalVoiceClip(text, lang), `missing ${lang} personal voice clip: ${text}`);
    }
  }
});
