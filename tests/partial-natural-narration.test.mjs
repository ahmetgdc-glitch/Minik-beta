import test from "node:test";
import assert from "node:assert/strict";

import {
  fixedNaturalVoicePlan,
  isFixedNaturalVoiceClipUrl,
} from "../src/audio/fixedNaturalVoicePlans.js";

function assertFixedPlan(text, lang, expectedLength) {
  const plan = fixedNaturalVoicePlan(text, lang);
  assert.equal(
    plan.length,
    expectedLength,
    `${lang} should keep ${expectedLength} recorded fragment(s) for: ${text}`,
  );
  assert.ok(plan.every(isFixedNaturalVoiceClipUrl));
}

test("Turkish dynamic lessons keep recorded instructions when a vocabulary clip is missing", () => {
  const missing = "HenüzKaydıOlmayanKelime";
  assertFixedPlan(`${missing} nerede?`, "tr", 1);
  assertFixedPlan(`${missing} nerede? Bir kez daha hatırlayalım.`, "tr", 2);
  assertFixedPlan(`${missing}. Bunun zıttı hangisi?`, "tr", 1);
  assertFixedPlan(`${missing} sonrasında ne gelir?`, "tr", 1);
});

test("German dynamic lessons keep recorded instructions when a vocabulary clip is missing", () => {
  const missing = "NochNichtAufgenommenesWort";
  assertFixedPlan(`Finde: ${missing}.`, "de", 1);
  assertFixedPlan(`Wo ist ${missing}? Das wiederholen wir noch einmal.`, "de", 2);
  assertFixedPlan(`${missing}. Was ist das Gegenteil?`, "de", 1);
  assertFixedPlan(`Was kommt nach ${missing}?`, "de", 1);
});

test("existing fully recorded Turkish vocabulary still keeps the full composed narration", () => {
  const plan = fixedNaturalVoicePlan("Kedi nerede?", "tr");
  assert.equal(plan.length, 2);
  assert.ok(plan.every(isFixedNaturalVoiceClipUrl));
});
