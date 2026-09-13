import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an initial iOS engine gap cannot block bundled MINIK narration", () => {
  const naturalPlan = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const naturalPlayback = voice.indexOf("speakNaturalPlan(plan, token)");
  const gapGuard = voice.indexOf("if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;");

  assert.ok(naturalPlan > 0, "fixed narrator plan must be resolved first");
  assert.ok(naturalPlayback > naturalPlan, "fixed narrator must be attempted before system speech");
  assert.ok(gapGuard > naturalPlayback, "an unavailable Voice 4 engine must not gate bundled narration");
  assert.match(
    voice,
    /export function holdVoice4DuringEngineGap\(\) \{[\s\S]*return false;\s*\}/,
  );
  assert.doesNotMatch(voice, /personalVoiceClip/);
});
