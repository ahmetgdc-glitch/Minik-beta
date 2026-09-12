import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("MINIK stops every narrator when the page leaves the foreground", () => {
  assert.match(voice, /function bindSpeechLifecycle\(\)/);
  assert.match(voice, /window\.addEventListener\("pagehide", stopOnPageHide\)/);
  assert.match(voice, /document\.addEventListener\("visibilitychange", stopWhenHidden\)/);
  assert.match(voice, /if \(document\.hidden\) stopSpeech\(\)/);
  assert.match(voice, /const stopOnPageHide = \(\) => stopSpeech\(\)/);
  assert.match(voice, /bindSpeechLifecycle\(\)/);
});

test("global lifecycle cancellation reaches Voice 4 and recorded fallbacks", () => {
  const stopStart = voice.indexOf("export function stopSpeech()");
  const lifecycleStart = voice.indexOf("function bindSpeechLifecycle()");
  assert.ok(stopStart >= 0 && lifecycleStart > stopStart);
  const stopBody = voice.slice(stopStart, lifecycleStart);
  assert.match(stopBody, /stopSystemVoice4\(\)/);
  assert.match(stopBody, /voiceSource\?\.stop\(\)/);
  assert.match(stopBody, /voicePlayer\?\.pause\(\)/);
  assert.match(stopBody, /cloudAbort\?\.abort\(\)/);
});
