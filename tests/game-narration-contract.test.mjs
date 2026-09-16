import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readGame = (name) => readFileSync(new URL(`../src/games/${name}`, import.meta.url), "utf8");

const listen = readGame("ListenGame.jsx");
const review = readGame("ReviewGame.jsx");
const sort = readGame("SortGame.jsx");
const initialLetter = readGame("InitialLetterGame.jsx");
const speakGame = readGame("SpeakGame.jsx");
const opposites = readGame("OppositesGame.jsx");
const dailyOrder = readGame("DailyOrderGame.jsx");
const story = readGame("StoryGame.jsx");
const trace = readGame("TraceGame.jsx");
const socialSteps = readGame("SocialStepsGame.jsx");
const puzzle = readGame("PuzzleGame.jsx");
const sounds = readGame("SoundsGame.jsx");
const rhythm = readGame("RhythmGame.jsx");

function mustContain(source, snippets, game) {
  for (const snippet of snippets) {
    assert.ok(source.includes(snippet), `${game} lost child-facing narration contract: ${snippet}`);
  }
}

test("listen and review always speak the requested learning word", () => {
  mustContain(listen, [
    "`${target.labels.tr} nerede?`",
    "`Finde: ${target.labels.de}.`",
    "() => speak(text, lang, settings)",
    "speak(target.labels[lang], lang, settings)",
  ], "listen");
  mustContain(review, [
    "`${target.labels.tr} nerede? Bir kez daha hatırlayalım.`",
    "`Wo ist ${target.labels.de}? Das wiederholen wir noch einmal.`",
    "() => speak(text, lang, settings)",
    "speak(target.labels[lang], lang, settings)",
  ], "review");
});

test("sorting names the object both in the task and in Mino help", () => {
  mustContain(sort, [
    "const lessonText = `${text} ${target.labels[lang]}.`;",
    "`${target.labels.tr}, ${group.labels.tr} grubuna ait.`",
    "`${target.labels.de} gehört in die Gruppe ${group.labels.de}.`",
    "() => speak(lessonText, lang, settings)",
    "onSelect: () => speak(lessonText, lang, settings)",
  ], "sort");
});

test("initial-letter and speaking replay the exact learning word", () => {
  mustContain(initialLetter, [
    "`${target.labels.tr} hangi harfle başlıyor?`",
    "`Mit welchem Buchstaben beginnt ${target.labels.de}?`",
    "() => speak(prompt, lang, settings)",
    "speak(target.labels[lang], lang, settings)",
  ], "initialletter");
  mustContain(speakGame, [
    "`Benimle söyle: ${expected}`",
    "`Sprich mir nach: ${expected}`",
    "speak(prompt, lang, settings)",
    "speak(expected, lang, settings)",
  ], "speak");
});

test("opposites and daily order keep the concrete prompt in narration", () => {
  mustContain(opposites, [
    "`${prompt.labels.tr}. Bunun zıttı hangisi?`",
    "`${prompt.labels.de}. Was ist das Gegenteil?`",
    "`${target.labels.tr}, ${prompt.labels.tr} kelimesinin zıttıdır.`",
    "() => speak(text, lang, settings)",
    "speak(prompt.labels[lang], lang, settings)",
  ], "opposites");
  mustContain(dailyOrder, [
    "`${prompt.labels.tr} sonrasında ne gelir?`",
    "`Was kommt nach ${prompt.labels.de}?`",
    "`${prompt.labels.tr} sonrasında ${target.labels.tr} gelir.`",
    "() => speak(text, lang, settings)",
    "speak(prompt.labels[lang], lang, settings)",
  ], "dailyorder");
});

test("story narration and replay stay linked to the visible story labels", () => {
  mustContain(story, [
    "const labels = storyItems.map((item) => item.labels[lang]);",
    "const story = storySentence(labels, lang);",
    "() => speak(text, lang, settings)",
    "`${prompt} ${target.labels[lang]}`",
    "await speak(item.labels[lang], lang, settings)",
  ], "story");
});

test("number and letter tracing never replace their target with generic help", () => {
  mustContain(trace, [
    "`${target} harfini çiz. Yeşil noktadan başla.`",
    "`Fahre den Buchstaben ${target} nach. Starte am grünen Punkt.`",
    "`${target} sayısını çiz. Yeşil noktadan başla.`",
    "`Fahre die ${target} nach. Starte am grünen Punkt.`",
    "useLesson(onReady, text, () => speak(text, lang, settings), [itemId], text)",
  ], "trace/lettertrace");
});

test("social safety speaks the actual scenario instead of a generic next-step sentence", () => {
  mustContain(socialSteps, [
    "`${round.title.tr}. Sonra ne yapmalıyız?`",
    "`${round.title.de}. Was machen wir danach?`",
    "() => speak(text, lang, settings)",
  ], "socialsteps");
  assert.doesNotMatch(socialSteps, /const spokenPrompt\s*=/u);
  assert.match(socialSteps, /round\.items\.map\(\(item\) => item\.id\),\s*text,/u);
});

test("puzzle speaks the real task first and reserves the short cue for Mino help", () => {
  mustContain(puzzle, [
    "const text = lang === \"tr\" ? \"Puzzle parçalarını doğru yere sürükle.\" : \"Ziehe die Puzzleteile an die richtige Stelle.\";",
    "const help = lang === \"tr\" ? \"Küçük resme bak.\" : \"Schau auf das kleine Vorbild.\";",
    "useLesson(onReady, text, () => speak(text, lang, settings), [target.id], help)",
  ], "puzzle");
  assert.doesNotMatch(puzzle, /useLesson\(onReady, text, \(\) => speak\(help,/u);
});

test("sound and rhythm games explain the task before playing the nonverbal cue", () => {
  mustContain(sounds, [
    "lang === \"tr\" ? \"Dinle. Bu ne sesi?\" : \"Hör genau hin. Was klingt so?\"",
    "async function playLesson()",
    "await speak(text, lang, settings)",
    "await repeat()",
    "useLesson(onReady, text, playLesson, [target.id], help)",
    "onClick={repeat}",
  ], "sounds");
  mustContain(rhythm, [
    "? \"Dinle ve aynı melodiyi çal.\"",
    ": \"Hör zu und spiele die Melodie nach.\";",
    "async function playLesson()",
    "await speak(text, lang, settings)",
    "await repeat()",
    "playLesson,",
    "onClick={repeat}",
  ], "rhythm");
});
