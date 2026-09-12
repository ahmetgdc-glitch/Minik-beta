import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("app primes WebAudio and one lazy voice player on the first direct user gesture", () => {
  const app = read("src/App.jsx");
  const hook = read("src/app/useAudioPrime.js");
  const voice = read("src/audio/voice.js");
  assert.match(
    app,
    /useAudioPrime\([\s\S]*progress\.settings\.audio \|\| progress\.settings\.sfx,[\s\S]*progress\.settings\.audio,[\s\S]*\)/,
  );
  assert.match(hook, /addEventListener\("pointerdown", prime, true\)/);
  assert.match(hook, /addEventListener\("touchstart", prime, true\)/);
  assert.match(hook, /addEventListener\("keydown", prime, true\)/);
  assert.match(hook, /unlockAudio\(\)/);
  assert.match(hook, /unlockVoiceAudio\(\)/);
  assert.match(hook, /startMusicAfterGesture\(\)/);
  assert.match(voice, /voicePlayer = new Audio\(\)/);
  assert.match(voice, /voicePlayer\.preload = "none"/);
});

test("audio priming re-arms after returning from the background without autoplaying", () => {
  const hook = read("src/app/useAudioPrime.js");
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /document\.visibilityState !== "visible"/);
  assert.match(hook, /pauseBackgroundMusic\("visibility"\)/);
  assert.match(hook, /webAudioReady = false/);

  const handlerStart = hook.indexOf("const resumeAfterBackground = () => {");
  const handlerEnd = hook.indexOf("\n    };", handlerStart);
  assert.ok(handlerStart >= 0 && handlerEnd > handlerStart);
  const backgroundHandler = hook.slice(handlerStart, handlerEnd);
  assert.doesNotMatch(
    backgroundHandler,
    /unlockVoiceAudio\(\)|startBackgroundMusic\(\)|\.play\(\)/,
  );
});

test("voice module never eagerly preloads the complete library during boot", () => {
  const voice = read("src/audio/voice.js");
  assert.doesNotMatch(voice, /preloadGameVoiceClips\(\)/);
  assert.doesNotMatch(voice, /preloadNaturalVoicePlans\(\)/);
  assert.doesNotMatch(voice, /import \{ preloadGameVoiceClips/);
  assert.doesNotMatch(voice, /preloadNaturalVoicePlans/);
});
