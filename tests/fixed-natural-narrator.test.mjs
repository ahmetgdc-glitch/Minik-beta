import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  fixedNaturalVoiceCoverageCount,
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

test("runtime tries fixed natural narration before iOS Voice 4 fallback", () => {
  const fixedPlanIndex = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const naturalPlaybackIndex = voice.indexOf("speakNaturalPlan(plan, token)");
  const voice4Index = voice.indexOf("const playedSystem = await speakWithVoice4(");
  assert.ok(fixedPlanIndex > 0);
  assert.ok(naturalPlaybackIndex > fixedPlanIndex);
  assert.ok(voice4Index > naturalPlaybackIndex);
  assert.doesNotMatch(voice, /personalVoiceClip/);
  assert.doesNotMatch(voice, /resource2\.heygen\.ai/);
});
