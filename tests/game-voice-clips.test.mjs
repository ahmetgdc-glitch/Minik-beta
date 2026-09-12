import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const clips = readFileSync(new URL("../src/audio/gameVoiceClips.js", import.meta.url), "utf8");
const animals = readFileSync(new URL("../src/audio/animalVoiceClips.js", import.meta.url), "utf8");
const food = readFileSync(new URL("../src/audio/foodVoiceClips.js", import.meta.url), "utf8");
const help = readFileSync(new URL("../src/audio/helpVoiceClips.js", import.meta.url), "utf8");
const plans = readFileSync(new URL("../src/audio/naturalVoicePlans.js", import.meta.url), "utf8");
const voiceLibrary = `${clips}\n${animals}\n${food}\n${help}\n${plans}`;
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

test("home and common unmapped game prompts have recorded Mino phrases", () => {
  for (const phrase of [
    "Hallo! Komm, wir entdecken die Welt!", "Merhaba! Haydi dünyayı keşfedelim!",
    "Wohin möchtest du? Tippe auf ein Bild.", "Nereye gidelim? Bir resme dokun.",
    "Schön, dass du da bist!", "İyi ki geldin!",
    "Hallo, ich bin Mino!", "Merhaba, ben Mino!",
    "Finde dieses Bild.", "Bu resmi bul.",
    "Mit welchem Buchstaben beginnt das Wort?", "Bu kelime hangi harfle başlıyor?",
    "Drei Bilder sind gleich. Finde das andere.", "Üç resim aynı. Farklı olanı bul.",
    "Welches Bild kommt als Nächstes?", "Sırada hangi resim var?",
    "Schau dir die Bilder gut an.", "Resimlere dikkatle bak.",
    "Was sieht Mino zum Schluss?", "Mino en son ne görüyor?",
    "Sprich mir nach.", "Benimle söyle.",
    "Fahre die Spur nach. Starte am grünen Punkt.", "İzi takip et. Yeşil noktadan başla.",
    "Das wiederholen wir noch einmal.", "Bir kez daha hatırlayalım.",
    "Tippe auf dieses Bild.", "Bu resmi seç.",
    "Was ist das Gegenteil?", "Bunun zıttı hangisi?",
    "Was kommt danach?", "Sonra ne gelir?",
    "Als Nächstes kommt:", "Sırada:",
  ]) assert.ok(plans.includes(phrase), `missing natural plan phrase: ${phrase}`);
});

test("new home and drawing guidance has full natural DE/TR recordings", () => {
  for (const phrase of [
    "Los geht’s!", "Haydi başlayalım!",
    "Male, zeichne und erfinde etwas auf der großen Fläche.",
    "Büyük tuvalde boya, çiz ve hayal et.",
    "Wähle eine Farbe. Du kannst auch eine Malvorlage wählen.",
    "Bir renk seç. İstersen bir boyama resmi seç.",
  ]) assert.ok(help.includes(phrase), `missing natural help clip: ${phrase}`);
});

test("dynamic common game prompts are composed only from recorded clips", () => {
  for (const [text, lang, minParts] of [
    ["Finde: Hund.", "de", 2],
    ["Köpek nerede?", "tr", 2],
    ["Finde: Apfel.", "de", 2],
    ["Elma nerede?", "tr", 2],
    ["Finde: Wassermelone.", "de", 2],
    ["Karpuz nerede?", "tr", 2],
    ["In welchen Korb gehört das? Katze.", "de", 2],
    ["Hangi sepete ait? Kedi.", "tr", 2],
    ["Mit welchem Buchstaben beginnt Hund?", "de", 2],
    ["Köpek hangi harfle başlıyor?", "tr", 2],
    ["Sprich mir nach: Löwe", "de", 2],
    ["Benimle söyle: Aslan", "tr", 2],
    ["Fahre den Buchstaben A nach. Starte am grünen Punkt.", "de", 1],
    ["A harfini çiz. Yeşil noktadan başla.", "tr", 1],
    ["Wo ist Hund? Das wiederholen wir noch einmal.", "de", 3],
    ["Köpek nerede? Bir kez daha hatırlayalım.", "tr", 3],
    ["Hund. Tippe auf dieses Bild.", "de", 2],
    ["Köpek. Bu resmi seç.", "tr", 2],
    ["Hund. Was ist das Gegenteil?", "de", 2],
    ["Köpek. Bunun zıttı hangisi?", "tr", 2],
    ["Was kommt nach Hund?", "de", 2],
    ["Köpek sonrasında ne gelir?", "tr", 2],
    ["Nach Hund kommt Katze.", "de", 3],
    ["Köpek sonrasında Kedi gelir.", "tr", 3],
  ]) {
    const plan = naturalVoicePlan(text, lang);
    assert.ok(plan.length >= minParts, `expected natural plan for ${lang}: ${text}`);
    assert.ok(plan.every((url) => /\.(?:mp3|wav)$/iu.test(url)), `plan must contain recordings: ${text}`);
  }
});

test("all color vocabulary uses natural Mino voice in both languages", () => {
  for (const word of [
    "Rot", "Blau", "Gelb", "Grün", "Orange", "Lila", "Rosa", "Braun", "Schwarz", "Weiß", "Grau", "Türkis",
    "Kırmızı", "Mavi", "Sarı", "Yeşil", "Turuncu", "Mor", "Pembe", "Kahverengi", "Siyah", "Beyaz", "Gri", "Turkuaz",
  ]) assert.ok(clips.includes(`\"${word}\"`), `missing natural color clip: ${word}`);
});

test("numbers one through ten use natural Mino voice in both languages", () => {
  for (const word of [
    "Eins", "Zwei", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun", "Zehn",
    "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz", "On",
  ]) assert.ok(clips.includes(`\"${word}\"`), `missing natural number clip: ${word}`);
});

test("all shape vocabulary uses natural Mino voice in both languages", () => {
  for (const word of [
    "Kreis", "Quadrat", "Dreieck", "Rechteck", "Stern", "Herz", "Raute", "Oval",
    "Daire", "Kare", "Üçgen", "Dikdörtgen", "Yıldız", "Kalp", "Eşkenar dörtgen",
  ]) assert.ok(clips.includes(`\"${word}\"`), `missing natural shape clip: ${word}`);
});

test("all thirty animals use natural Mino voice in both languages", () => {
  for (const word of [
    "Löwe", "Hund", "Katze", "Kuh", "Pferd", "Schaf", "Tiger", "Affe",
    "Kaninchen", "Bär", "Elefant", "Giraffe", "Pinguin", "Frosch", "Fisch", "Vogel",
    "Fuchs", "Schwein", "Ente", "Huhn", "Schildkröte", "Schmetterling", "Marienkäfer", "Biene",
    "Oktopus", "Delfin", "Hai", "Wal", "Schnecke", "Igel",
    "Aslan", "Köpek", "Kedi", "İnek", "At", "Koyun", "Kaplan", "Maymun",
    "Tavşan", "Ayı", "Fil", "Zürafa", "Penguen", "Kurbağa", "Balık", "Kuş",
    "Tilki", "Domuz", "Ördek", "Tavuk", "Kaplumbağa", "Kelebek", "Uğur böceği", "Arı",
    "Ahtapot", "Yunus", "Köpek balığı", "Balina", "Salyangoz", "Kirpi",
  ]) assert.ok(animals.includes(`\"${word}\"`), `missing natural animal clip: ${word}`);
});

test("core fruit vocabulary uses natural Mino voice in both languages", () => {
  for (const word of [
    "Apfel", "Banane", "Birne", "Erdbeere", "Trauben", "Wassermelone", "Kirschen", "Pfirsich", "Zitrone", "Ananas", "Kiwi",
    "Elma", "Muz", "Armut", "Portakal", "Çilek", "Üzüm", "Karpuz", "Kiraz", "Şeftali", "Limon", "Ananas", "Kivi",
  ]) assert.ok(food.includes(`\"${word}\"`), `missing natural food clip: ${word}`);
  assert.ok(clips.includes(`\"Orange\"`), "German Orange reuses the natural color recording");
});

test("animal vocabulary remains modular and wired into the shared player", () => {
  assert.match(clips, /animalVoiceClip\(text, lang\)/);
  assert.match(clips, /animalVoiceEntries/);
  assert.match(clips, /animalVoiceClipCount/);
});

test("natural Mino library keeps at least 218 recorded prompts and words", () => {
  const urls = voiceLibrary.match(/https:\/\/storage\.googleapis\.com\/adm--audio-playback[^\"]+\.mp3/g) || [];
  assert.ok(urls.length >= 218, `expected at least 218 natural clips, got ${urls.length}`);
});

test("fixed Mino speech keeps recorded plans while pronunciation-sensitive speech can use native locale", () => {
  assert.match(voice, /naturalVoicePlan\(text, lang\)/);
  assert.match(voice, /speakNaturalPlan\(plan, token\)/);
  assert.match(voice, /shouldPreferNativeSystem\(text, lang, settings\)/);
  assert.match(voice, /lang === "tr" \? "tr-TR" : "de-DE"/);
});

test("device speech is opt-in so personal MINIK audio never silently becomes a phone voice", () => {
  assert.match(voice, /if \(systemVoiceEnabled\(settings\)\)/);
  assert.match(voice, /void settings/);
  assert.match(voice, /return false/);
  assert.match(voice, /return speakSystem\(text, lang, settings, token\)/);
  assert.match(voice, /settings\.preferNativeSystem === true/);
  assert.match(voice, /settings\.preferNativeSystem === false/);
});

test("game praise only uses phrases with natural clip coverage", () => {
  assert.match(session, /de: \["Super gemacht!", "Wunderbar!", "Das hast du toll gemacht!"\]/);
  assert.match(session, /tr: \["Harika!", "Çok güzel yaptın!"\]/);
});
