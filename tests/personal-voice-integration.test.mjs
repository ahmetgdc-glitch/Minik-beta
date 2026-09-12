import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  personalVoiceClip,
  personalVoiceClipCount,
  personalVoiceEntries,
} from "../src/audio/personalVoiceClips.js";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const voice = readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
const natural = readFileSync(new URL("../src/audio/naturalVoicePlans.js", import.meta.url), "utf8");
const downloader = readFileSync(new URL("../scripts/fetch-personal-voice-assets.mjs", import.meta.url), "utf8");
const parents = readFileSync(new URL("../src/parent/Parents.jsx", import.meta.url), "utf8");
const pkg = readFileSync(new URL("../package.json", import.meta.url), "utf8");

test("authorized personal voice covers the central DE/TR MINIK prompts", () => {
  assert.equal(personalVoiceClipCount, 332);
  assert.equal(Object.keys(personalVoiceEntries.de).length, 166);
  assert.equal(Object.keys(personalVoiceEntries.tr).length, 166);

  for (const [lang, entries] of Object.entries(personalVoiceEntries)) {
    for (const [text, url] of Object.entries(entries)) {
      assert.equal(personalVoiceClip(text, lang), url);
      assert.match(
        url,
        /^(?:https:\/\/resource2\.heygen\.ai\/text_to_speech\/.*id=[a-f0-9-]+\.wav|assets\/personal-voice\/personal-(?:de|tr)-[a-f0-9]{20}\.mp3)$/,
      );
    }
  }
});

test("all modular MINIK vocabulary is superseded by the personal voice", async () => {
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
        assert.ok(personalVoiceClip(text, lang), `missing personal voice: ${lang} ${text}`);
      }
    }
  }
});

test("every legacy natural clip now has an exact personal replacement", () => {
  const files = [
    "gameVoiceClips.js",
    "animalVoiceClips.js",
    "numberVoiceClips.js",
    "helpVoiceClips.js",
    "categoryVoiceClips.js",
    "vehicleVoiceClips.js",
    "bodyVoiceClips.js",
    "foodVoiceClips.js",
    "naturalVoicePlans.js",
  ];
  const checked = new Set();
  for (const filename of files) {
    const source = readFileSync(new URL(`../src/audio/${filename}`, import.meta.url), "utf8");
    let lang = "";
    for (const line of source.split("\n")) {
      const language = line.match(/^\s*(de|tr):\s*\{/);
      if (language) lang = language[1];
      const entry = line.match(
        /^\s*"((?:[^"\\]|\\.)+)":\s*"https:\/\/storage\.googleapis\.com\/adm--audio-playback/,
      );
      if (!entry) continue;
      const text = JSON.parse(`"${entry[1]}"`);
      checked.add(`${lang}\0${text}`);
      assert.ok(personalVoiceClip(text, lang), `missing personal replacement: ${lang} ${text}`);
    }
  }
  assert.equal(checked.size, 332);
});

test("natural speech plans prefer the personal voice over legacy recordings", () => {
  const de = naturalVoicePlan("Hallo! Komm, wir entdecken die Welt!", "de");
  const tr = naturalVoicePlan("Merhaba! Haydi dünyayı keşfedelim!", "tr");
  assert.equal(de.length, 1);
  assert.equal(tr.length, 1);
  assert.match(de[0], /resource2\.heygen\.ai/);
  assert.match(tr[0], /resource2\.heygen\.ai/);
  assert.ok(
    natural.indexOf("personalVoiceClip(text, lang)") < natural.indexOf("naturalPhraseClip(text, lang)"),
    "personal voice must be checked before the legacy natural recording library",
  );
});

test("runtime tries an exact personal clip before any native system voice", () => {
  assert.match(voice, /import \{ personalVoiceClip \} from "\.\/personalVoiceClips\.js";/);
  const personalIndex = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  const nativeIndex = voice.indexOf("const preferNative = shouldPreferNativeSystem(text, lang, settings)");
  assert.ok(personalIndex > 0, "runtime must look up the exact authorized personal clip");
  assert.ok(nativeIndex > personalIndex, "native system speech must not bypass an available personal clip");
  assert.match(voice, /await playPreferredClip\(personalClip, token\)/);
});

test("personal wav clips are localized before service worker generation", () => {
  const personalIndex = pkg.indexOf("fetch-personal-voice-assets.mjs");
  const workerIndex = pkg.indexOf("build-sw.mjs");
  assert.ok(personalIndex > 0, "personal voice localization must be part of npm build");
  assert.ok(workerIndex > personalIndex, "service worker must be generated after personal voice files exist");
  assert.ok(downloader.includes("src/audio/personalVoiceClips.js"));
  assert.ok(downloader.includes("resource2\\.heygen\\.ai"));
  assert.ok(downloader.includes(".voice-cache/personal"));
  assert.ok(downloader.includes("personal-manifest.json"));
  assert.ok(downloader.includes("MINIK_REQUIRE_LOCAL_VOICE"));
});

test("runtime can resolve both legacy mp3 and personal wav files locally", () => {
  assert.ok(voice.includes("(?:mp3|wav)"));
  assert.ok(voice.includes("assets/voice/${filename}"));
});

test("the parent voice preview always uses exact personal MINIK recordings", () => {
  assert.match(parents, /"Hallo! Komm, wir entdecken die Welt!"/);
  assert.match(parents, /"Merhaba! Haydi dünyayı keşfedelim!"/);
  assert.doesNotMatch(parents, /Hallo! Ich bin Mino\. Wir entdecken heute die Tiere\./);
  assert.doesNotMatch(parents, /Merhaba! Ben Mino\. Bugün hayvanları keşfediyoruz\./);
});
