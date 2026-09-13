import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an initial iOS engine gap cannot block bundled MINIK narration", () => {
  const naturalPlan = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const naturalPlayback = voice.indexOf("speakNaturalPlan(plan, token)");
  const systemCheck = voice.indexOf("const voice4Available = systemVoice4Available()");
  const gapGuard = voice.indexOf("if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;");

  assert.ok(naturalPlan > 0, "fixed narrator plan must be resolved first");
  assert.ok(naturalPlayback > naturalPlan, "fixed narrator must be attempted before system fallback");
  assert.ok(systemCheck > naturalPlayback, "Voice 4 availability belongs to the secondary fallback path");
  assert.ok(gapGuard > systemCheck, "engine-gap policy must only guard the Voice 4 fallback path");
  assert.match(
    voice,
    /export function holdVoice4DuringEngineGap\(\) \{[\s\S]*return false;\s*\}/,
  );
  assert.doesNotMatch(voice, /personalVoiceClip/);
});
