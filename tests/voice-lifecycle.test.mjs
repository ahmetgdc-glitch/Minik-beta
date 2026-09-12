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

test("hidden MINIK cannot start a delayed narrator after lifecycle cancellation", () => {
  assert.match(voice, /function speechForegroundAllowed\(\)/);
  assert.match(voice, /return !document\.hidden && document\.visibilityState !== "hidden"/);
  assert.match(voice, /if \(!text \|\| settings\.audio === false \|\| !speechForegroundAllowed\(\)\) return false/);
  assert.match(voice, /\(\) => token === sequence && speechForegroundAllowed\(\)/);
  assert.match(voice, /if \(!speechForegroundAllowed\(\)\) return false;\n\s*const personalClip/);
  assert.match(voice, /export async function cloudTTS[\s\S]*?if \(!speechForegroundAllowed\(\)\) return false/);
  assert.match(voice, /if \(token !== sequence \|\| !speechForegroundAllowed\(\)\) return false/);
});

test("audio priming and recorded playback stay blocked while hidden", () => {
  assert.match(voice, /export async function unlockVoiceAudio\(\) \{\n\s*if \(!speechForegroundAllowed\(\)\) return false/);
  assert.match(voice, /async function speakMediaClip\(url, token\) \{\n\s*if \(!url \|\| !speechForegroundAllowed\(\)\) return false/);
  assert.match(voice, /async function speakGameClip\(url, token\) \{\n\s*if \(!url \|\| !speechForegroundAllowed\(\)\) return false/);
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
