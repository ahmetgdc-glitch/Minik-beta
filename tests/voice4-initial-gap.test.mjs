import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("iOS engine gaps cannot switch to the personal narrator before Voice 4 establishes", () => {
  const gapGuard = voice.indexOf("if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;");
  const personalFallback = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");

  assert.ok(gapGuard > 0, "Voice 4 engine-gap guard must exist");
  assert.ok(personalFallback > gapGuard, "engine-gap guard must run before personal fallback");
  assert.match(
    voice,
    /if \(!isIOSSpeechEnvironment\(\)\) return false;\s*\/\/[^]*?if \(!establishedVoice4Languages\.has\(lang\)\) return true;/,
  );
});
