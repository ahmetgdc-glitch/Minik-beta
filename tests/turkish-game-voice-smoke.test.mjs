import test from "node:test";
import assert from "node:assert/strict";

import {
  fixedNaturalVoicePlan,
  isFixedNaturalVoiceClipUrl,
} from "../src/audio/fixedNaturalVoicePlans.js";

const missingLabel = "HenüzKaydıOlmayanKelime";

const turkishGamePrompts = [
  ["listen", `${missingLabel} nerede?`],
  ["review", `${missingLabel} nerede? Bir kez daha hatırlayalım.`],
  ["count", "Kaç tane var?"],
  ["memory", "Aynı iki resmi bul."],
  ["match", "Resmi eşine götür."],
  ["sort", `Hangi sepete ait? ${missingLabel}.`],
  ["sounds", "Dinle. Bu ne sesi?"],
  ["shadow", "Bu gölge hangi resme ait?"],
  ["missing", "Hangi resim kayboldu?"],
  ["pattern", "Sırada hangi resim var?"],
  ["different", "Üç resim aynı. Farklı olanı bul."],
  ["initialletter", `${missingLabel} hangi harfle başlıyor?`],
  ["speak", `Benimle söyle: ${missingLabel}.`],
  ["opposites", `${missingLabel}. Bunun zıttı hangisi?`],
  ["dailyorder", `${missingLabel} sonrasında ne gelir?`],
  ["trace", "İzi takip et. Yeşil noktadan başla."],
  ["rhythm", "Dinle ve aynı melodiyi çal."],
  ["explore", "Bak bakalım! Resme dokun."],
  ["draw", "Büyük tuvalde boya, çiz ve hayal et."],
  ["puzzle-fallback", "Küçük resme bak."],
  ["socialsteps-fallback", "Sonra ne gelir?"],
  ["story", "Mino en son ne görüyor?"],
];

test("every Turkish game family has an audible fixed MINIK lesson or fallback", () => {
  for (const [game, text] of turkishGamePrompts) {
    const plan = fixedNaturalVoicePlan(text, "tr");
    assert.ok(plan.length > 0, `${game} has no fixed Turkish narration for: ${text}`);
    assert.ok(
      plan.every(isFixedNaturalVoiceClipUrl),
      `${game} leaked a non-fixed narrator for: ${text}`,
    );
  }
});
