import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an iOS Voice 4 engine gap cannot block fixed bundled narration", () => {
  assert.match(voice, /export function holdVoice4DuringEngineGap\(\) \{[\s\S]*return false;\s*\}/);

  const naturalPlan = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const naturalPlayback = voice.indexOf("speakNaturalPlan(plan, token)");
  const gapGuard = voice.indexOf("if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;");
  assert.ok(naturalPlan > 0, "fixed narrator plan must be resolved");
  assert.ok(naturalPlayback > naturalPlan, "fixed narrator must be attempted before any system fallback");
  assert.ok(gapGuard > naturalPlayback, "Voice 4 engine state must only be consulted after bundled narration");
});

test("Voice 4 still establishes continuity after successful or live selected playback", () => {
  assert.match(voice, /if \(playedSystem\) \{\s*markVoice4Established\(lang\);\s*return true;/s);
  assert.match(voice, /const selectedVoice4 = hasVoice4Selection\(lang, settings\);\s*if \(selectedVoice4\) markVoice4Established\(lang\);/s);
});

test("failed iOS Voice 4 cannot switch to the removed personal narrator", () => {
  const naturalPlan = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const selectionIndex = voice.indexOf("const selectedVoice4 = hasVoice4Selection(lang, settings)");

  assert.ok(naturalPlan > 0, "fixed bundled narration must remain the primary path");
  assert.ok(selectionIndex > naturalPlan, "Voice 4 selection state is only checked after fixed narration fails");
  assert.doesNotMatch(voice, /personalVoiceClip/);
  assert.match(voice, /Personal recordings are intentionally not an automatic narrator/);
});
