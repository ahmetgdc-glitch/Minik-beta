import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an established iOS Voice 4 blocks recorded fallback during a transient engine gap", () => {
  assert.match(voice, /const establishedVoice4Languages = new Set\(\)/);
  assert.match(voice, /const VOICE4_ENGINE_GRACE_MS = 5000/);
  assert.match(voice, /export function holdVoice4DuringEngineGap/);
  assert.match(voice, /isIOSSpeechEnvironment\(\)/);

  const gapGuard = voice.indexOf("if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;");
  const personalFallback = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(gapGuard > 0, "engine-gap guard must exist");
  assert.ok(personalFallback > gapGuard, "recorded fallback must stay behind the Voice 4 engine-gap guard");
});

test("Voice 4 continuity is established only after a real selection and cleared after confirmed absence", () => {
  assert.match(voice, /if \(playedSystem\) \{\s*markVoice4Established\(lang\);\s*return true;/s);
  assert.match(voice, /if \(hasVoice4Selection\(lang, settings\)\) \{\s*markVoice4Established\(lang\);\s*return false;/s);
  assert.match(voice, /if \(!voice4InventoryReady\(\)\) return false;\s*[\s\S]*clearVoice4Continuity\(lang\);/);
});

test("the engine-gap hold expires instead of permanently disabling the recorded fallback", () => {
  assert.match(voice, /voice4EngineMissingSince\.set\(lang, now\)/);
  assert.match(voice, /return now - missingSince < VOICE4_ENGINE_GRACE_MS/);
});
