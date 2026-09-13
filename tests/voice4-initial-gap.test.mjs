import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an initial iOS engine gap cannot block bundled MINIK narration", () => {
  const systemCheck = voice.indexOf("const voice4Available = systemVoice4Available()");
  const gapGuard = voice.indexOf("if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;");
  const naturalPlan = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const naturalPlayback = voice.indexOf("speakNaturalPlan(plan, token)");

  assert.ok(systemCheck > 0, "Voice 4 availability must be checked first");
  assert.ok(gapGuard > systemCheck, "engine-gap policy belongs to the Voice 4 primary path");
  assert.ok(naturalPlan > gapGuard, "bundled fallback must remain reachable after a missing engine");
  assert.ok(naturalPlayback > naturalPlan, "bundled fallback must remain playable");
  assert.match(
    voice,
    /export function holdVoice4DuringEngineGap\(\) \{[\s\S]*return false;\s*\}/,
  );
  assert.doesNotMatch(voice, /personalVoiceClip/);
});
