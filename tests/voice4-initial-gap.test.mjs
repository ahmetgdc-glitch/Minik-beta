import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("an initial iOS engine gap can fall through to bundled MINIK audio", () => {
  const gapGuard = voice.indexOf("if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;");
  const personalFallback = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");

  assert.ok(gapGuard > 0, "Voice 4 engine-gap check must remain explicit");
  assert.ok(personalFallback > gapGuard, "Voice 4 is still attempted before recorded fallback");
  assert.match(
    voice,
    /export function holdVoice4DuringEngineGap\(\) \{[\s\S]*return false;\s*\}/,
  );
});
