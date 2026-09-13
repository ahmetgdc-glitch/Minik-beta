import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  personalVoiceClip,
  personalVoiceClipCount,
  personalVoiceEntries,
} from "../src/audio/personalVoiceClips.js";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";
import { fixedNaturalVoicePlan, isFixedNaturalVoiceClipUrl } from "../src/audio/fixedNaturalVoicePlans.js";

const voice = readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
const systemVoice4 = readFileSync(new URL("../src/audio/systemVoice4.js", import.meta.url), "utf8");
const natural = readFileSync(new URL("../src/audio/naturalVoicePlans.js", import.meta.url), "utf8");
const downloader = readFileSync(new URL("../scripts/fetch-personal-voice-assets.mjs", import.meta.url), "utf8");
const parents = readFileSync(new URL("../src/parent/Parents.jsx", import.meta.url), "utf8");
const pkg = readFileSync(new URL("../package.json", import.meta.url), "utf8");

test("authorized personal voice assets remain intact for explicit parent-facing use", () => {
  assert.equal(personalVoiceClipCount, 332);
  assert.equal(Object.keys(personalVoiceEntries.de).length, 166);
  assert.equal(Object.keys(personalVoiceEntries.tr).length, 166);
  for (const [lang, entries] of Object.entries(personalVoiceEntries)) {
    for (const [text, url] of Object.entries(entries)) {
      assert.equal(personalVoiceClip(text, lang), url);
      assert.match(url, /^(?:https:\/\/resource2\.heygen\.ai\/text_to_speech\/.*id=[a-f0-9-]+\.wav|assets\/personal-voice\/personal-(?:de|tr)-[a-f0-9]{20}\.mp3)$/);
    }
  }
});

test("all modular MINIK vocabulary retains explicit personal assets without making them the narrator", async () => {
  const modules = [
    "../src/audio/animalVoiceClips.js",
    "../src/audio/bodyVoiceClips.js",
    "../src/audio/categoryVoiceClips.js",
    "../src/audio/foodVoiceClips.js",
    "../src/audio/helpVoiceClips.js",
    "../src/audio/numberVoiceClips.js",
    "../src/audio/vehicleVoiceClips.js",
  ];
  for (const modulePath of modules) {
    const imported = await import(modulePath);
    const entries = Object.values(imported).find((value) => value?.de && value?.tr);
    assert.ok(entries, `missing voice entries export: ${modulePath}`);
    for (const lang of ["de", "tr"]) {
      for (const text of Object.keys(entries[lang])) {
        assert.ok(personalVoiceClip(text, lang), `missing personal voice asset: ${lang} ${text}`);
      }
    }
  }
});

test("every legacy natural clip still has an exact personal asset mapping", () => {
  const files = ["gameVoiceClips.js", "animalVoiceClips.js", "numberVoiceClips.js", "helpVoiceClips.js", "categoryVoiceClips.js", "vehicleVoiceClips.js", "bodyVoiceClips.js", "foodVoiceClips.js", "naturalVoicePlans.js"];
  const checked = new Set();
  for (const filename of files) {
    const source = readFileSync(new URL(`../src/audio/${filename}`, import.meta.url), "utf8");
    let lang = "";
    for (const line of source.split("\n")) {
      const language = line.match(/^\s*(de|tr):\s*\{/);
      if (language) lang = language[1];
      const entry = line.match(/^\s*"((?:[^"\\]|\\.)+)":\s*"https:\/\/storage\.googleapis\.com\/adm--audio-playback/);
      if (!entry) continue;
      const text = JSON.parse(`"${entry[1]}"`);
      checked.add(`${lang}\0${text}`);
      assert.ok(personalVoiceClip(text, lang), `missing personal asset mapping: ${lang} ${text}`);
    }
  }
  assert.equal(checked.size, 332);
});

test("legacy composition may know personal assets but runtime converts to fixed natural narration", () => {
  const rawDe = naturalVoicePlan("Hallo! Komm, wir entdecken die Welt!", "de");
  const rawTr = naturalVoicePlan("Merhaba! Haydi dünyayı keşfedelim!", "tr");
  assert.equal(rawDe.length, 1);
  assert.equal(rawTr.length, 1);
  assert.match(rawDe[0], /resource2\.heygen\.ai/);
  assert.match(rawTr[0], /resource2\.heygen\.ai/);
  assert.ok(natural.includes("personalVoiceClip(text, lang)"));
  for (const [text, lang] of [["Hallo! Komm, wir entdecken die Welt!", "de"], ["Merhaba! Haydi dünyayı keşfedelim!", "tr"]]) {
    const fixed = fixedNaturalVoicePlan(text, lang);
    assert.equal(fixed.length, 1);
    assert.ok(fixed.every(isFixedNaturalVoiceClipUrl));
  }
});

test("runtime uses fixed natural narration first, Voice 4 only as fallback, and never auto-plays personal recordings", () => {
  const fixedIndex = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const playbackIndex = voice.indexOf("await speakNaturalPlan(plan, token)");
  const systemIndex = voice.indexOf("const playedSystem = await speakWithVoice4(");
  assert.ok(fixedIndex > 0);
  assert.ok(playbackIndex > fixedIndex);
  assert.ok(systemIndex > playbackIndex);
  assert.doesNotMatch(voice, /personalVoiceClip/);
  assert.doesNotMatch(voice, /resource2\.heygen\.ai/);
  assert.match(systemVoice4, /VOICE4_RE/);
  assert.doesNotMatch(systemVoice4, /voice\?\.default|voice\?\.localService|sameLanguage\[0\]|voices\[0\]/);
});

test("fixed natural runtime accepts only the bundled natural voice family", () => {
  assert.match(voice, /plan\.every\(isFixedNaturalVoiceClipUrl\)/);
  assert.match(voice, /await playPreferredClip\(clip, token\)/);
  assert.doesNotMatch(voice, /isPersonalVoiceClipUrl/);
});

test("personal assets remain buildable for explicit preview without becoming automatic narration", () => {
  const personalIndex = pkg.indexOf("fetch-personal-voice-assets.mjs");
  const workerIndex = pkg.indexOf("build-sw.mjs");
  assert.ok(personalIndex > 0);
  assert.ok(workerIndex > personalIndex);
  assert.ok(downloader.includes("src/audio/personalVoiceClips.js"));
  assert.ok(downloader.includes("resource2\\.heygen\\.ai"));
  assert.ok(downloader.includes(".voice-cache/personal"));
  assert.ok(downloader.includes("personal-manifest.json"));
});

test("dynamic story narration resolves to fixed natural clips at runtime", () => {
  for (const [text, lang, expected] of [
    ["Mino sieht zuerst Löwe, dann Hund und zum Schluss Katze.", "de", 3],
    ["Mino önce Aslan, sonra Köpek ve en son Kedi görüyor.", "tr", 3],
    ["Was sieht Mino zum Schluss? Löwe", "de", 2],
    ["Mino en son ne görüyor? Aslan", "tr", 2],
  ]) {
    const plan = fixedNaturalVoicePlan(text, lang);
    assert.equal(plan.length, expected, `unexpected fixed story plan: ${lang} ${text}`);
    assert.ok(plan.every(isFixedNaturalVoiceClipUrl));
  }
});

test("the parent personal-voice preview remains explicit and separate", () => {
  assert.match(parents, /"Hallo! Komm, wir entdecken die Welt!"/);
  assert.match(parents, /"Merhaba! Haydi dünyayı keşfedelim!"/);
});
