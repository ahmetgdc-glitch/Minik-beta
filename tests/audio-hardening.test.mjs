import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
test("MINIK has no native speech-synthesis path", () => {
  assert.doesNotMatch(voice, /speechSynthesis|SpeechSynthesisUtterance|engine\.speak/);
  assert.match(voice, /No native speech fallback exists/);
});
test("recorded speech keeps a stale-playback guard", () => {
  assert.match(voice, /token === sequence/);
  assert.match(voice, /settle\?\.\(false\)/);
});
test("recorded speech uses one lazy media player", () => {
  assert.match(voice, /voicePlayer = new Audio\(\)/);
  assert.match(voice, /voicePlayer\.preload = "none"/);
  assert.doesNotMatch(voice, /getVoices|voiceschanged/);
});
