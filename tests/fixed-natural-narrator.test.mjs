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

test("dynamic narration is composed only from the fixed natural library", () => {
  assertFixedPlan("Mino sieht zuerst Löwe, dann Hund und zum Schluss Katze.", "de", 3);
  assertFixedPlan("Mino önce Aslan, sonra Köpek ve en son Kedi görüyor.", "tr", 3);
  assertFixedPlan("Was sieht Mino zum Schluss? Löwe", "de", 2);
  assertFixedPlan("Mino en son ne görüyor? Aslan", "tr", 2);
});

test("uncovered game words keep a recorded task instruction", () => {
  const cases = [
    ["Havuç nerede?", "tr", "Bu resmi bul."],
    ["Havuç nerede? Bir kez daha hatırlayalım.", "tr", "Bir kez daha hatırlayalım."],
    ["Hangi sepete ait? Havuç.", "tr", "Hangi sepete ait?"],
    ["Havuç hangi harfle başlıyor?", "tr", "Bu kelime hangi harfle başlıyor?"],
    ["Havuç. Bunun zıttı hangisi?", "tr", "Bunun zıttı hangisi?"],
    ["Havuç sonrasında ne gelir?", "tr", "Sonra ne gelir?"],
    ["Benimle söyle: Havuç", "tr", "Benimle söyle."],
    ["Havuç", "tr", "Bu resmi bul."],
    ["Mino en son ne görüyor? Havuç", "tr", "Mino en son ne görüyor?"],
    ["Finde: Karotte.", "de", "Finde dieses Bild."],
    ["Wo ist Karotte? Das wiederholen wir noch einmal.", "de", "Das wiederholen wir noch einmal."],
    ["Mit welchem Buchstaben beginnt Karotte?", "de", "Mit welchem Buchstaben beginnt das Wort?"],
    ["Karotte. Was ist das Gegenteil?", "de", "Was ist das Gegenteil?"],
    ["Sprich mir nach: Karotte", "de", "Sprich mir nach."],
    ["Karotte", "de", "Finde dieses Bild."],
    ["Ziehe die Puzzleteile an die richtige Stelle.", "de", "Schau auf das kleine Vorbild."],
  ];
  for (const [text, lang, expected] of cases) {
    const plan = fixedNaturalVoicePlan(text, lang);
    assert.ok(plan.length > 0, `missing fallback plan: ${lang} ${text}`);
    assert.ok(plan.every(isFixedNaturalVoiceClipUrl), `fallback must stay fixed: ${lang} ${text}`);
    assert.equal(
      fixedNaturalVoiceFallbackPlan(text, lang).length,
      plan.length,
      `fallback should be used for uncovered word: ${lang} ${text}`,
    );
    assert.ok(
      plan.includes(fixedNaturalVoiceClip(expected, lang)),
      `fallback should speak the recorded instruction: ${lang} ${expected}`,
    );
  }
  assert.deepEqual(fixedNaturalVoiceFallbackPlan("This is unrelated text", "tr"), []);
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
