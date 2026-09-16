import test from "node:test";
import assert from "node:assert/strict";

import {
  fixedNaturalVoiceClip,
  fixedNaturalVoicePlan,
  isFixedNaturalVoiceClipUrl,
} from "../src/audio/fixedNaturalVoicePlans.js";

const missingLabel = "HenüzKaydıOlmayanKelime";

const exactFallbackPrompts = [
  ["listen", `${missingLabel} nerede?`],
  ["review", `${missingLabel} nerede? Bir kez daha hatırlayalım.`],
  ["sort", `Hangi sepete ait? ${missingLabel}.`],
  ["initialletter", `${missingLabel} hangi harfle başlıyor?`],
  ["speak", `Benimle söyle: ${missingLabel}.`],
  ["opposites", `${missingLabel}. Bunun zıttı hangisi?`],
  ["dailyorder", `${missingLabel} sonrasında ne gelir?`],
  ["story-target", `Mino en son ne görüyor? ${missingLabel}`],
];

const fixedTurkishGamePrompts = [
  ["count", "Kaç tane var?"],
  ["memory", "Aynı iki resmi bul."],
  ["match", "Resmi eşine götür."],
  ["sounds", "Dinle. Bu ne sesi?"],
  ["shadow", "Bu gölge hangi resme ait?"],
  ["missing", "Hangi resim kayboldu?"],
  ["pattern", "Sırada hangi resim var?"],
  ["different", "Üç resim aynı. Farklı olanı bul."],
  ["trace", "İzi takip et. Yeşil noktadan başla."],
  ["rhythm", "Dinle ve aynı melodiyi çal."],
  ["explore", "Bak bakalım! Resme dokun."],
  ["draw", "Büyük tuvalde boya, çiz ve hayal et."],
  ["puzzle-fallback", "Küçük resme bak."],
  ["socialsteps-fallback", "Sonra ne gelir?"],
  ["story", "Mino en son ne görüyor?"],
];

test("Turkish game prompts with a missing target preserve the complete requested speech", () => {
  const genericPictureInstruction = fixedNaturalVoiceClip("Bu resmi bul.", "tr");
  assert.ok(genericPictureInstruction);

  for (const [game, text] of exactFallbackPrompts) {
    const plan = fixedNaturalVoicePlan(text, "tr");
    assert.deepEqual(
      plan,
      [],
      `${game} must use the exact Voice 4 fallback instead of dropping ${missingLabel}`,
    );
    assert.ok(
      !plan.includes(genericPictureInstruction),
      `${game} must never replace the missing target with Bu resmi bul.`,
    );
  }
});

test("fixed Turkish game-family instructions still use the MINIK narrator", () => {
  for (const [game, text] of fixedTurkishGamePrompts) {
    const plan = fixedNaturalVoicePlan(text, "tr");
    assert.ok(plan.length > 0, `${game} has no fixed Turkish narration for: ${text}`);
    assert.ok(
      plan.every(isFixedNaturalVoiceClipUrl),
      `${game} leaked a non-fixed narrator for: ${text}`,
    );
  }
});
