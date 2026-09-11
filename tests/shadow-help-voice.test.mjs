import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { helpVoiceClip } from "../src/audio/helpVoiceClips.js";

const shadow = readFileSync(new URL("../src/games/ShadowGame.jsx", import.meta.url), "utf8");

test("ShadowGame uses generic natural help narration in both languages", () => {
  const phrases = [
    ["Schau genau auf die Form.", "de"],
    ["Şekle dikkatlice bak.", "tr"],
  ];
  for (const [phrase, lang] of phrases) {
    assert.ok(shadow.includes(phrase), `ShadowGame must use ${lang} natural help`);
    assert.match(helpVoiceClip(phrase, lang), /^https:\/\/storage\.googleapis\.com\/.+\.mp3$/u);
  }
  assert.doesNotMatch(shadow, /target\.labels\[lang\],\n\s*\);/);
});
