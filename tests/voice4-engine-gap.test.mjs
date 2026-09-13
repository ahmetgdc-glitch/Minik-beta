import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an iOS Voice 4 engine gap cannot block fixed bundled narration", () => {
  assert.match(voice, /export function holdVoice4DuringEngineGap\(\) \{[\s\S]*return false;\s*\}/);

  const naturalPlan = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const naturalPlayback = voice.indexOf("speakNaturalPlan(plan, token)");
  const systemIndex = voice.indexOf("speakWithVoice4(");
  assert.ok(naturalPlan > 0, "fixed narrator plan must be the primary narrator path");
  assert.ok(naturalPlayback > naturalPlan, "fixed narrator must be attempted before Voice 4");
  assert.ok(systemIndex > naturalPlayback, "Voice 4 must remain a secondary emergency fallback");
});

test("Voice 4 still establishes continuity after successful or live selected playback", () => {
  assert.match(voice, /if \(playedSystem\) \{\s*markVoice4Established\(lang\);\s*return true;/s);
  assert.match(voice, /const selectedVoice4 = hasVoice4Selection\(lang, settings\);\s*if \(selectedVoice4\) markVoice4Established\(lang\);/s);
});

test("failed Voice 4 never switches to personal recordings or arbitrary system voices", () => {
  const naturalPlan = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const selectionIndex = voice.indexOf("const selectedVoice4 = hasVoice4Selection(lang, settings)");

  assert.ok(naturalPlan > 0, "fixed bundled narration must remain primary");
  assert.ok(selectionIndex > naturalPlan, "Voice 4 selection state belongs to the fallback path");
  assert.doesNotMatch(voice, /personalVoiceClip/);
  assert.match(voice, /must never switch MINIK to an arbitrary\/default system voice/);
});
