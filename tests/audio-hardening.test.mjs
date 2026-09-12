import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
const systemVoice4 = fs.readFileSync(new URL("../src/audio/systemVoice4.js", import.meta.url), "utf8");

test("MINIK prefers iOS Voice 4 before recorded fallback", () => {
  const systemIndex = voice.indexOf("speakWithVoice4(");
  const personalIndex = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(systemIndex > 0);
  assert.ok(personalIndex > systemIndex);
});

test("Voice 4 selector never falls back to arbitrary robotic system voices", () => {
  assert.match(systemVoice4, /VOICE4_RE/);
  assert.match(systemVoice4, /SIRI_RE/);
  assert.match(systemVoice4, /return \([\s\S]*sameLanguage\.find[\s\S]*\|\|[\s\S]*sameLanguage\.find[\s\S]*\|\|[\s\S]*null/);
  assert.doesNotMatch(systemVoice4, /voice\?\.default/);
  assert.doesNotMatch(systemVoice4, /voice\?\.localService/);
  assert.doesNotMatch(systemVoice4, /sameLanguage\[0\]|voices\[0\]/);
});

test("Voice 4 waits briefly for Safari voiceschanged", () => {
  assert.match(systemVoice4, /voiceschanged/);
  assert.match(systemVoice4, /waitForVoice4/);
  assert.match(systemVoice4, /setTimeout\(\(\) => finish\(null\), timeoutMs\)/);
});

test("speech keeps stale-playback and cancellation guards", () => {
  assert.match(voice, /token === sequence/);
  assert.match(voice, /stopSystemVoice4\(\)/);
  assert.match(systemVoice4, /synth\.cancel\(\)/);
});

test("recorded fallback still uses one lazy media player", () => {
  assert.match(voice, /voicePlayer = new Audio\(\)/);
  assert.match(voice, /voicePlayer\.preload = "none"/);
});
