import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an iOS Voice 4 engine gap cannot permanently silence recorded fallback", () => {
  assert.match(voice, /export function holdVoice4DuringEngineGap\(\) \{[\s\S]*return false;\s*\}/);

  const gapGuard = voice.indexOf("if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;");
  const personalFallback = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(gapGuard > 0, "engine-gap guard call must remain explicit");
  assert.ok(personalFallback > gapGuard, "recorded fallback remains behind the Voice 4 attempt");
});

test("Voice 4 still establishes continuity after successful playback", () => {
  assert.match(voice, /if \(playedSystem\) \{\s*markVoice4Established\(lang\);\s*return true;/s);
  assert.match(voice, /if \(hasVoice4Selection\(lang, settings\)\) \{\s*markVoice4Established\(lang\);\s*\}/s);
});

test("failed Voice 4 playback falls through to the bundled MINIK narrator", () => {
  const stickyIndex = voice.indexOf("if (hasVoice4Selection(lang, settings)) {");
  const personalFallback = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(stickyIndex > 0);
  assert.ok(personalFallback > stickyIndex);
  assert.doesNotMatch(
    voice,
    /if \(hasVoice4Selection\(lang, settings\)\) \{\s*markVoice4Established\(lang\);\s*return false;/s,
  );
});
