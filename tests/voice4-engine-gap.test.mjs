import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an iOS Voice 4 engine gap cannot block fixed bundled narration", () => {
  assert.match(voice, /export function holdVoice4DuringEngineGap\(\) \{[\s\S]*return false;\s*\}/);

  const systemIndex = voice.indexOf("speakWithVoice4(");
  const naturalPlan = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const naturalPlayback = voice.indexOf("speakNaturalPlan(plan, token)");
  assert.ok(systemIndex > 0, "Voice 4 must remain the primary narrator path");
  assert.ok(naturalPlan > systemIndex, "fixed narrator plan must remain reachable after Voice 4");
  assert.ok(naturalPlayback > naturalPlan, "fixed narrator must play when Voice 4 is unavailable");
});

test("Voice 4 still establishes continuity after successful or live selected playback", () => {
  assert.match(voice, /if \(playedSystem\) \{\s*markVoice4Established\(lang\);\s*return true;/s);
  assert.match(voice, /const selectedVoice4 = hasVoice4Selection\(lang, settings\);\s*if \(selectedVoice4\) markVoice4Established\(lang\);/s);
});

test("failed iOS Voice 4 falls back to fixed narrator, never personal recordings", () => {
  const selectionIndex = voice.indexOf("const selectedVoice4 = hasVoice4Selection(lang, settings)");
  const naturalPlan = voice.indexOf("fixedNaturalVoicePlan(text, lang)");

  assert.ok(selectionIndex > 0, "Voice 4 selection state must be handled first");
  assert.ok(naturalPlan > selectionIndex, "fixed bundled narration must remain the audible fallback");
  assert.doesNotMatch(voice, /personalVoiceClip/);
  assert.match(voice, /Every next utterance tries Voice 4 first/);
});
