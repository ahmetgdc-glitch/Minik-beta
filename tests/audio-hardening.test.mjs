import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("MINIK uses system speech as the primary narrator", () => {
  assert.match(voice, /speechSynthesis/);
  assert.match(voice, /SpeechSynthesisUtterance/);
  assert.match(voice, /selectMinoSystemVoice/);
  assert.match(voice, /stimme\\s\*4\|voice\\s\*4\|siri/iu);
  const systemIndex = voice.indexOf("await speakSystem(text, lang, settings, token)");
  const personalIndex = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(systemIndex > 0 && personalIndex > systemIndex, "system voice must run before recorded fallback");
});

test("system voice keeps only small Mino adjustments", () => {
  assert.match(voice, /Math\.min\(1, Math\.max\(0\.86/);
  assert.match(voice, /0\.94/);
  assert.match(voice, /Math\.min\(1\.08, Math\.max\(0\.98/);
  assert.match(voice, /1\.03/);
});

test("speech keeps a stale-playback guard", () => {
  assert.match(voice, /token === sequence/);
  assert.match(voice, /settle\?\.\(false\)/);
  assert.match(voice, /systemSpeechEngine\(\)\?\.cancel/);
});

test("recorded fallback still uses one lazy media player", () => {
  assert.match(voice, /voicePlayer = new Audio\(\)/);
  assert.match(voice, /voicePlayer\.preload = "none"/);
});
