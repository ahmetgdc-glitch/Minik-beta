import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an iOS Voice 4 engine gap cannot permanently silence recorded fallback", () => {
  assert.match(voice, /export function holdVoice4DuringEngineGap\(\) \{[\s\S]*return false;\s*\}/);

  const gapGuard = voice.indexOf("if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;");
  const personalFallback = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(gapGuard > 0, "engine-gap guard call must remain explicit");
  assert.ok(personalFallback > gapGuard, "recorded fallback remains available when the Voice 4 engine itself is absent");
});

test("Voice 4 still establishes continuity after successful or live selected playback", () => {
  assert.match(voice, /if \(playedSystem\) \{\s*markVoice4Established\(lang\);\s*return true;/s);
  assert.match(voice, /const selectedVoice4 = hasVoice4Selection\(lang, settings\);\s*if \(selectedVoice4\) markVoice4Established\(lang\);/s);
});

test("failed iOS Voice 4 playback keeps bundled audio reachable", () => {
  const selectionIndex = voice.indexOf("const selectedVoice4 = hasVoice4Selection(lang, settings)");
  const personalFallback = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");

  assert.ok(selectionIndex > 0, "Voice 4 selection state must be checked after playback failure");
  assert.ok(personalFallback > selectionIndex, "bundled fallback must remain reachable after Voice 4 fails");
  assert.doesNotMatch(voice, /if \(isIOSSpeechEnvironment\(\)\) return false;/);
});
