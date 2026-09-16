import test from "node:test";
import assert from "node:assert/strict";

import {
  fixedNaturalVoicePlan,
  isFixedNaturalVoiceClipUrl,
} from "../src/audio/fixedNaturalVoicePlans.js";

function assertNoPartialPlan(text, lang) {
  assert.deepEqual(
    fixedNaturalVoicePlan(text, lang),
    [],
    `${lang} must keep the complete requested speech for the exact Voice 4 fallback: ${text}`,
  );
}

test("Turkish dynamic lessons never drop a missing vocabulary target", () => {
  const missing = "HenüzKaydıOlmayanKelime";
  assertNoPartialPlan(`${missing} nerede?`, "tr");
  assertNoPartialPlan(`${missing} nerede? Bir kez daha hatırlayalım.`, "tr");
  assertNoPartialPlan(`Hangi sepete ait? ${missing}.`, "tr");
  assertNoPartialPlan(`${missing} hangi harfle başlıyor?`, "tr");
  assertNoPartialPlan(`Benimle söyle: ${missing}.`, "tr");
  assertNoPartialPlan(`${missing}. Bunun zıttı hangisi?`, "tr");
  assertNoPartialPlan(`${missing} sonrasında ne gelir?`, "tr");
  assertNoPartialPlan(`Mino en son ne görüyor? ${missing}`, "tr");
});

test("German dynamic lessons never drop a missing vocabulary target", () => {
  const missing = "NochNichtAufgenommenesWort";
  assertNoPartialPlan(`Finde: ${missing}.`, "de");
  assertNoPartialPlan(`Wo ist ${missing}? Das wiederholen wir noch einmal.`, "de");
  assertNoPartialPlan(`In welchen Korb gehört das? ${missing}.`, "de");
  assertNoPartialPlan(`Mit welchem Buchstaben beginnt ${missing}?`, "de");
  assertNoPartialPlan(`Sprich mir nach: ${missing}.`, "de");
  assertNoPartialPlan(`${missing}. Was ist das Gegenteil?`, "de");
  assertNoPartialPlan(`Was kommt nach ${missing}?`, "de");
  assertNoPartialPlan(`Was sieht Mino zum Schluss? ${missing}`, "de");
});

test("trace lessons never replace their number or letter with a generic trace instruction", () => {
  assertNoPartialPlan("3 sayısını çiz. Yeşil noktadan başla.", "tr");
  assertNoPartialPlan("C harfini çiz. Yeşil noktadan başla.", "tr");
  assertNoPartialPlan("Fahre die 3 nach. Starte am grünen Punkt.", "de");
  assertNoPartialPlan("Fahre den Buchstaben C nach. Starte am grünen Punkt.", "de");
});

test("existing fully recorded Turkish vocabulary still keeps the full composed narration", () => {
  const plan = fixedNaturalVoicePlan("Kedi nerede?", "tr");
  assert.equal(plan.length, 2);
  assert.ok(plan.every(isFixedNaturalVoiceClipUrl));
});
