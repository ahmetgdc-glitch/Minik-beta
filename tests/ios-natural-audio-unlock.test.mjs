import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const voice = readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
const prime = readFileSync(new URL("../src/app/useAudioPrime.js", import.meta.url), "utf8");

test("recorded Mino voice reuses one gesture-unlocked HTML audio element", () => {
  assert.match(voice, /let voices = \[\],[\s\S]*voicePlayer = null/);
  assert.match(voice, /const SILENT_WAV =/);
  assert.match(voice, /export async function primeVoiceAudio\(\)/);
  assert.match(voice, /player\.src = SILENT_WAV/);
  assert.match(voice, /const player = naturalPlayer\(\);/);
  assert.doesNotMatch(voice, /cloudPlayer = new Audio\(url\);[\s\S]*speakGameClip/);
});

test("app primes both WebAudio and recorded voice on iOS gestures", () => {
  assert.match(prime, /primeVoiceAudio/);
  assert.match(prime, /voiceAudioReady/);
  assert.match(prime, /webAudioReady/);
  assert.match(prime, /addEventListener\("pointerdown", prime, true\)/);
  assert.match(prime, /addEventListener\("touchend", prime, true\)/);
  assert.match(prime, /if \(!webAudioReady \|\| !voiceAudioReady\) return;/);
});
