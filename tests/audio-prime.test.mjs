import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("app primes WebAudio on the first direct user gesture", () => {
  const app = read("src/App.jsx");
  const hook = read("src/app/useAudioPrime.js");
  assert.match(app, /useAudioPrime\(progress\.settings\.audio \|\| progress\.settings\.sfx\)/);
  assert.match(hook, /addEventListener\("pointerdown", prime, true\)/);
  assert.match(hook, /addEventListener\("touchend", prime, true\)/);
  assert.match(hook, /addEventListener\("keydown", prime, true\)/);
  assert.match(hook, /unlockAudio\(\)/);
  assert.match(hook, /primeVoiceAudio\(\)/);
});

test("audio priming is restored after returning from the background", () => {
  const hook = read("src/app/useAudioPrime.js");
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /visibilityState !== "visible"/);
  assert.match(hook, /webAudioReady = false/);
  assert.match(hook, /refreshVoices\(\)/);
});
