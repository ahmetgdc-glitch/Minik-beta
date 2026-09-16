import test from "node:test";
import assert from "node:assert/strict";

import {
  fixedNaturalVoiceClip,
  fixedNaturalVoicePlan,
  isFixedNaturalVoiceClipUrl,
} from "../src/audio/fixedNaturalVoicePlans.js";
import { gameCatalog } from "../src/games/registry.js";

const missingLabel = "HenüzKaydıOlmayanKelime";

const exactFallbackPrompts = [
  ["listen", `${missingLabel} nerede?`],
  ["review", `${missingLabel} nerede? Bir kez daha hatırlayalım.`],
  ["sort", `Hangi sepete ait? ${missingLabel}.`],
  ["initialletter", `${missingLabel} hangi harfle başlıyor?`],
  ["speak", `Benimle söyle: ${missingLabel}.`],
  ["opposites", `${missingLabel}. Bunun zıttı hangisi?`],
  ["dailyorder", `${missingLabel} sonrasında ne gelir?`],
  ["story", `Mino en son ne görüyor? ${missingLabel}`],
  ["trace", "3 sayısını çiz. Yeşil noktadan başla."],
  ["lettertrace", "C harfini çiz. Yeşil noktadan başla."],
  ["socialsteps", "Yoldan güvenle geç. Sonra ne yapmalıyız?"],
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
  ["rhythm", "Dinle ve aynı melodiyi çal."],
  ["explore", "Bak bakalım! Resme dokun."],
  ["draw", "Büyük tuvalde boya, çiz ve hayal et."],
  ["puzzle", "Küçük resme bak."],
  ["story", "Mino en son ne görüyor?"],
];

test("semantic Turkish audio QA explicitly covers every registered game family", () => {
  const covered = new Set([
    ...exactFallbackPrompts.map(([game]) => game),
    ...fixedTurkishGamePrompts.map(([game]) => game),
  ]);
  const registered = new Set(gameCatalog.map((game) => game.id));
  assert.deepEqual([...covered].sort(), [...registered].sort());
  assert.equal(registered.size, 23);
});

test("Turkish game prompts with semantic targets preserve the complete requested speech", () => {
  const genericPictureInstruction = fixedNaturalVoiceClip("Bu resmi bul.", "tr");
  assert.ok(genericPictureInstruction);

  for (const [game, text] of exactFallbackPrompts) {
    const plan = fixedNaturalVoicePlan(text, "tr");
    assert.deepEqual(
      plan,
      [],
      `${game} must use exact Voice 4 speech instead of dropping target details: ${text}`,
    );
    assert.ok(
      !plan.includes(genericPictureInstruction),
      `${game} must never replace its target with Bu resmi bul.`,
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
