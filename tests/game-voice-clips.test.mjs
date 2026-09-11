import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const clips = readFileSync(new URL("../src/audio/gameVoiceClips.js", import.meta.url), "utf8");
const voice = readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
const session = readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("MINIK has natural Mino voice clips in both languages", () => {
  assert.match(clips, /Super gemacht!/);
  assert.match(clips, /Wunderbar!/);
  assert.match(clips, /Harika!/);
  assert.match(clips, /Çok güzel yaptın!/);
  assert.match(clips, /Schau noch einmal\./);
  assert.match(clips, /Bir daha bak\./);
});

test("speech prefers recorded game voice before browser synthesis", () => {
  assert.match(voice, /gameVoiceClip\(text, lang\)/);
  assert.match(voice, /speakGameClip\(clip, token\)/);
  assert.match(voice, /return speakSystem\(text, lang, settings, token\)/);
});

test("recorded clip failure safely falls back to local speech", () => {
  assert.match(voice, /if \(played \|\| token !== sequence\) return played/);
  assert.match(voice, /return speakSystem/);
});

test("game praise only uses phrases with natural clip coverage", () => {
  assert.match(session, /de: \["Super gemacht!", "Wunderbar!", "Das hast du toll gemacht!"\]/);
  assert.match(session, /tr: \["Harika!", "Çok güzel yaptın!"\]/);
});
