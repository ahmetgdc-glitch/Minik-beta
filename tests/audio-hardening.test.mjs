import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("MINIK uses the owner's personal recordings as the only narrator", () => {
  assert.doesNotMatch(voice, /speechSynthesis/);
  assert.doesNotMatch(voice, /SpeechSynthesisUtterance/);
  const personalIndex = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(personalIndex > 0);
});

test("no named iPhone or Siri voice can bypass personal narration", () => {
  assert.doesNotMatch(voice, /selectMinoSystemVoice|stimme\\s\*4|voice\\s\*4|siri/iu);
});

test("speech keeps a stale-playback guard", () => {
  assert.match(voice, /token === sequence/);
  assert.match(voice, /settle\?\.\(false\)/);
});

test("recorded fallback still uses one lazy media player", () => {
  assert.match(voice, /voicePlayer = new Audio\(\)/);
  assert.match(voice, /voicePlayer\.preload = "none"/);
});
