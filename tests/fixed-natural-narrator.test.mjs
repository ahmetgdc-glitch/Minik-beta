import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  fixedNaturalVoiceCoverageCount,
  fixedNaturalVoiceClip,
  fixedNaturalVoiceFallbackPlan,
  fixedNaturalVoicePlan,
  isFixedNaturalVoiceClipUrl,
} from "../src/audio/fixedNaturalVoicePlans.js";
import { allItems } from "../src/data/content.js";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

const assertFixedPlan = (text, lang, expectedLength = 1) => {
  const plan = fixedNaturalVoicePlan(text, lang);
  assert.equal(plan.length, expectedLength, `${lang} ${text}`);
  assert.ok(plan.every(isFixedNaturalVoiceClipUrl), `${lang} ${text} must stay on fixed natural clips`);
  assert.ok(plan.every((url) => !url.includes("heygen.ai")), `${lang} ${text} must not use personal voice`);
};

test("fixed natural narrator covers all 332 known DE/TR voice entries", () => {
  assert.equal(fixedNaturalVoiceCoverageCount, 332);
  assertFixedPlan("Hallo! Komm, wir entdecken die Welt!", "de");
  assertFixedPlan("Merhaba! Haydi dünyayı keşfedelim!", "tr");
  assertFixedPlan("Super gemacht!", "de");
  assertFixedPlan("Harika!", "tr");
  assertFixedPlan("Löwe", "de");
  assertFixedPlan("Aslan", "tr");
});

test("dynamic narration is composed only when every semantic part is recorded", () => {
  assertFixedPlan("Mino sieht zuerst Löwe, dann Hund und zum Schluss Katze.", "de", 3);
  assertFixedPlan("Mino önce Aslan, sonra Köpek ve en son Kedi görüyor.", "tr", 3);
  assertFixedPlan("Was sieht Mino zum Schluss? Löwe", "de", 2);
  assertFixedPlan("Mino en son ne görüyor? Aslan", "tr", 2);

  // Regression from real child QA: the old resolver dropped an uncovered
  // target and left only "Bu resmi bul." behind.
  assert.deepEqual(fixedNaturalVoicePlan("Oyuncak ayı", "tr"), []);
  assert.deepEqual(fixedNaturalVoicePlan("Oyuncak ayı nerede?", "tr"), []);
  assert.deepEqual(
    fixedNaturalVoicePlan("Oyuncak ayı nerede? Bir kez daha hatırlayalım.", "tr"),
    [],
  );
});

test("fallback plans never substitute a different child-facing sentence", () => {
  const cases = [
    ["Oyuncak ayı", "tr"],
    ["Oyuncak ayı nerede?", "tr"],
    ["Oyuncak ayı nerede? Bir kez daha hatırlayalım.", "tr"],
    ["Hangi sepete ait? Oyuncak ayı.", "tr"],
    ["Oyuncak ayı hangi harfle başlıyor?", "tr"],
    ["Oyuncak ayı. Bunun zıttı hangisi?", "tr"],
    ["Oyuncak ayı sonrasında ne gelir?", "tr"],
    ["Benimle söyle: Oyuncak ayı", "tr"],
    ["Mino en son ne görüyor? Oyuncak ayı", "tr"],
    ["Teddybär", "de"],
    ["Finde: Teddybär.", "de"],
    ["Wo ist Teddybär? Das wiederholen wir noch einmal.", "de"],
    ["Mit welchem Buchstaben beginnt Teddybär?", "de"],
    ["Teddybär. Was ist das Gegenteil?", "de"],
    ["Sprich mir nach: Teddybär", "de"],
  ];
  const generic = {
    tr: fixedNaturalVoiceClip("Bu resmi bul.", "tr"),
    de: fixedNaturalVoiceClip("Finde dieses Bild.", "de"),
  };

  for (const [text, lang] of cases) {
    const fallback = fixedNaturalVoiceFallbackPlan(text, lang);
    assert.ok(
      !fallback.includes(generic[lang]),
      `fallback must not replace ${lang} ${text} with a generic picture instruction`,
    );
  }
});

test("child QA: every learning word survives all dynamic game prompt plans", () => {
  assert.ok(allItems.length >= 500, "expected the complete learning catalog");

  const templates = {
    tr: [
      (label) => `${label} nerede?`,
      (label) => `${label} nerede? Bir kez daha hatırlayalım.`,
      (label) => `${label}. Bu resmi seç.`,
      (label) => `Hangi sepete ait? ${label}.`,
      (label) => `${label} hangi harfle başlıyor?`,
      (label) => `Benimle söyle: ${label}`,
      (label) => `${label}. Bunun zıttı hangisi?`,
      (label) => `${label} sonrasında ne gelir?`,
      (label) => `Mino en son ne görüyor? ${label}`,
    ],
    de: [
      (label) => `Finde: ${label}.`,
      (label) => `Wo ist ${label}? Das wiederholen wir noch einmal.`,
      (label) => `${label}. Tippe auf dieses Bild.`,
      (label) => `In welchen Korb gehört das? ${label}.`,
      (label) => `Mit welchem Buchstaben beginnt ${label}?`,
      (label) => `Sprich mir nach: ${label}`,
      (label) => `${label}. Was ist das Gegenteil?`,
      (label) => `Was kommt nach ${label}?`,
      (label) => `Was sieht Mino zum Schluss? ${label}`,
    ],
  };

  for (const lang of ["tr", "de"]) {
    const generic = fixedNaturalVoiceClip(
      lang === "tr" ? "Bu resmi bul." : "Finde dieses Bild.",
      lang,
    );

    for (const item of allItems) {
      const label = String(item?.labels?.[lang] || "").trim();
      if (!label) continue;
      const labelPlan = fixedNaturalVoicePlan(label, lang);

      assert.ok(
        !labelPlan.includes(generic),
        `${lang} ${label} must never be replaced by a generic picture instruction`,
      );

      for (const makePrompt of templates[lang]) {
        const prompt = makePrompt(label);
        const plan = fixedNaturalVoicePlan(prompt, lang);

        if (!labelPlan.length) {
          assert.deepEqual(
            plan,
            [],
            `${lang} ${prompt} must fall back to the complete original speech when ${label} has no fixed clip`,
          );
          continue;
        }

        if (!plan.length) continue;
        for (const labelClip of labelPlan) {
          assert.ok(
            plan.includes(labelClip),
            `${lang} ${prompt} must keep the target word ${label} in the fixed narration`,
          );
        }
      }
    }
  }
});

test("runtime tries fixed natural narration before iOS Voice 4 fallback", () => {
  const fixedPlanIndex = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const naturalPlaybackIndex = voice.indexOf("await speakNaturalPlan(plan, token)");
  const voice4Index = voice.indexOf("const playedSystem = await speakWithVoice4(");
  assert.ok(fixedPlanIndex > 0);
  assert.ok(naturalPlaybackIndex > fixedPlanIndex);
  assert.ok(voice4Index > naturalPlaybackIndex);
  assert.doesNotMatch(voice, /personalVoiceClip/);
  assert.doesNotMatch(voice, /resource2\.heygen\.ai/);
});
