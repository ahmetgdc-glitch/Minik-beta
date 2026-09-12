import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const sounds = readFileSync(new URL("../src/audio/sounds.js", import.meta.url), "utf8");
const session = readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

const personalOnly = (plan) =>
  plan.length > 0 &&
  plan.every((url) =>
    /^(?:assets\/personal-voice\/personal-(?:de|tr)-[a-f0-9]{20}\.mp3|https:\/\/resource2\.heygen\.ai\/text_to_speech\/)/u.test(url),
  );

test("personal narrator cancels and blocks competing game effects", () => {
  assert.match(sounds, /if \(next && !speechActive\) stopSounds\(\);/);
  assert.match(sounds, /if \(!sfx \|\| speechActive \|\| !unlockAudio\(\)\) return 0;/);
  assert.match(sounds, /personal MINIK narrator always has priority/);
});

test("game session speaks on lesson, wrong answer, help and success paths", () => {
  assert.match(session, /lesson\.repeat\?\.\(\);/);
  assert.match(session, /speak\(text, lang, settings\);/);
  assert.match(session, /speak\(lesson\.help \|\| lesson\.text, lang, settings\);/);
  assert.match(session, /const text = praise\[lang\]\[round % praise\[lang\]\.length\];/);
});

test("representative dynamic game prompts resolve to personal voice only", () => {
  const cases = [
    ["Finde: Katze.", "de"],
    ["Kedi nerede?", "tr"],
    ["Mit welchem Buchstaben beginnt Katze?", "de"],
    ["Kedi hangi harfle başlıyor?", "tr"],
    ["Sprich mir nach: Katze.", "de"],
    ["Benimle söyle: Kedi.", "tr"],
    ["Was sieht Mino zum Schluss? Katze", "de"],
    ["Mino en son ne görüyor? Kedi", "tr"],
    ["Super gemacht!", "de"],
    ["Harika!", "tr"],
    ["Schau noch einmal.", "de"],
    ["Bir daha bak.", "tr"],
  ];

  for (const [text, lang] of cases) {
    const plan = naturalVoicePlan(text, lang);
    assert.ok(personalOnly(plan), `gameplay narration must be personal-only: ${lang} ${text}`);
  }
});
