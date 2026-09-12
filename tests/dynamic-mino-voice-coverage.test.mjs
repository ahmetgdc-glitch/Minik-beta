import test from "node:test";
import assert from "node:assert/strict";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const cases = [
  ["Finde: Katze.", "de"],
  ["Kedi nerede?", "tr"],
  ["Mit welchem Buchstaben beginnt Katze?", "de"],
  ["Kedi hangi harfle başlıyor?", "tr"],
  ["Mino sieht zuerst Löwe, dann Hund und zum Schluss Katze.", "de"],
  ["Mino önce Aslan, sonra Köpek ve en son Kedi görüyor.", "tr"],
  ["Was sieht Mino zum Schluss? Katze", "de"],
  ["Mino en son ne görüyor? Kedi", "tr"],
];

test("representative dynamic game prompts compose from recorded MINIK voice clips", () => {
  for (const [text, lang] of cases) {
    const plan = naturalVoicePlan(text, lang);
    assert.ok(plan.length > 0, `missing dynamic voice plan: ${lang} ${text}`);
    assert.ok(
      plan.every((url) => /(?:assets\/personal-voice|resource2\.heygen\.ai)/u.test(url)),
      `non-personal clip leaked into dynamic plan: ${lang} ${text}`,
    );
  }
});
