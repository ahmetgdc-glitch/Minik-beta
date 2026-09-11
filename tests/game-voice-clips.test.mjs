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

test("core game starts and help prompts keep natural voice coverage", () => {
  for (const phrase of [
    "Schau mal! Tippe auf das Bild.", "Tippe zwei Teile an und tausche sie.",
    "Finde zwei gleiche Bilder.", "Bring das Bild zu seinem Zwilling.",
    "Wie viele sind es?", "Folge dem grünen Punkt.",
    "Wir drehen die Karten zusammen um.", "Schau auf das kleine Vorbild.",
    "Tippe jedes Bild einmal an und zähle mit.", "In welchen Korb gehört das?",
    "Hör zu und spiele die Melodie nach.", "Hör genau hin. Was klingt so?",
    "Zu welchem Bild gehört der Schatten?", "Bak bakalım! Resme dokun.",
    "İki parçaya dokun, yerlerini değiştir.", "Aynı iki resmi bul.",
    "Resmi eşine götür.", "Kaç tane var?", "Yeşil noktayı takip et.",
    "Kartları birlikte çevirelim.", "Küçük resme bak.",
    "Her resme bir kez dokun ve say.", "Hangi sepete ait?",
    "Dinle ve aynı melodiyi çal.", "Dinle. Bu ne sesi?",
    "Bu gölge hangi resme ait?",
  ]) assert.ok(clips.includes(phrase), `missing natural clip: ${phrase}`);
});

test("core color vocabulary uses the same natural Mino voice", () => {
  for (const word of ["Rot", "Blau", "Gelb", "Grün", "Kırmızı", "Mavi", "Sarı", "Yeşil"])
    assert.ok(clips.includes(`\"${word}\"`), `missing natural vocabulary clip: ${word}`);
});

test("numbers one through ten use natural Mino voice in both languages", () => {
  for (const word of [
    "Eins", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun", "Zehn",
    "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz", "On",
  ]) assert.ok(clips.includes(`\"${word}\"`), `missing natural number clip: ${word}`);
});

test("core shapes use natural Mino voice in both languages", () => {
  for (const word of ["Kreis", "Quadrat", "Dreieck", "Rechteck", "Daire", "Kare", "Üçgen", "Dikdörtgen"])
    assert.ok(clips.includes(`\"${word}\"`), `missing natural shape clip: ${word}`);
});

test("natural Mino library keeps at least 71 recorded prompts and words", () => {
  const urls = clips.match(/https:\/\/storage\.googleapis\.com\/adm--audio-playback[^\"]+\.mp3/g) || [];
  assert.ok(urls.length >= 71, `expected at least 71 natural clips, got ${urls.length}`);
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
