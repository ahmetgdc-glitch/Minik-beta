import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const numbers = readFileSync(new URL("../src/audio/numberVoiceClips.js", import.meta.url), "utf8");
const gameClips = readFileSync(new URL("../src/audio/gameVoiceClips.js", import.meta.url), "utf8");
const downloader = readFileSync(new URL("../scripts/fetch-voice-assets.mjs", import.meta.url), "utf8");
const verifier = readFileSync(new URL("../scripts/verify-build.mjs", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");

test("numbers eleven through twenty have natural German and Turkish recordings", () => {
  for (const word of [
    "Elf", "Zwölf", "Dreizehn", "Vierzehn", "Fünfzehn", "Sechzehn", "Siebzehn", "Achtzehn", "Neunzehn", "Zwanzig",
    "On bir", "On iki", "On üç", "On dört", "On beş", "On altı", "On yedi", "On sekiz", "On dokuz", "Yirmi",
  ]) {
    assert.ok(numbers.includes(`\"${word}\"`), `missing natural number recording: ${word}`);
  }
  const urls = numbers.match(/https:\/\/storage\.googleapis\.com\/adm--audio-playback[^\"]+\.mp3/g) || [];
  assert.equal(urls.length, 20);
});

test("shared voice player resolves and preloads the extended number module", () => {
  assert.match(gameClips, /numberVoiceClip\(text, lang\)/);
  assert.match(gameClips, /numberVoiceEntries/);
  assert.match(gameClips, /numberVoiceClipCount/);
});

test("offline production pipeline localizes the extended number recordings", () => {
  for (const source of [downloader, verifier, workflow]) {
    assert.match(source, /numberVoiceClips\.js/);
  }
});
