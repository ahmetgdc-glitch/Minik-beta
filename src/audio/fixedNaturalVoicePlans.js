import { gameVoiceClip } from "./gameVoiceClips.js";
import { foodVoiceClip } from "./foodVoiceClips.js";
import { helpVoiceClip } from "./helpVoiceClips.js";
import { categoryVoiceClip } from "./categoryVoiceClips.js";
import { vehicleVoiceClip } from "./vehicleVoiceClips.js";
import { bodyVoiceClip } from "./bodyVoiceClips.js";
import { naturalPhraseClip, naturalVoicePlan } from "./naturalVoicePlans.js";
import { personalVoiceEntries } from "./personalVoiceClips.js";
import { allItems } from "../data/content.js";

const FIXED_NATURAL_RE = /^https:\/\/storage\.googleapis\.com\/adm--audio-playback--7d--public\/mcp-preview\/[a-f0-9-]+\.mp3$/iu;
const learningLabels = Object.fromEntries(
  ["de", "tr"].map((lang) => [
    lang,
    new Set(allItems.map((item) => String(item?.labels?.[lang] || "").trim()).filter(Boolean)),
  ]),
);

export function isFixedNaturalVoiceClipUrl(url) {
  return FIXED_NATURAL_RE.test(String(url || ""));
}

function fixedClipForText(text, lang) {
  return (
    naturalPhraseClip(text, lang) ||
    helpVoiceClip(text, lang) ||
    categoryVoiceClip(text, lang) ||
    vehicleVoiceClip(text, lang) ||
    bodyVoiceClip(text, lang) ||
    gameVoiceClip(text, lang) ||
    foodVoiceClip(text, lang) ||
    ""
  );
}

function fallbackPlan(parts, lang) {
  const plan = parts
    .map((part) => fixedClipForText(part, lang))
    .filter((url) => isFixedNaturalVoiceClipUrl(url));
  return plan.length ? plan : [];
}

/**
 * Keep a game audible when a dynamic learning word has no fixed recording yet.
 *
 * The full sentence is always attempted first. If one of its words is still
 * missing from the bundled library, these short, already recorded instructions
 * preserve the task context without inventing a robotic voice or speaking an
 * unrelated label. The visible word remains on the large game object for the
 * child to see and hear later when its recording is added.
 */
export function fixedNaturalVoiceFallbackPlan(text, lang = "de") {
  const value = String(text || "").trim();
  if (!value) return [];

  if (lang === "tr") {
    if (/nerede\?/u.test(value)) {
      return fallbackPlan(
        /Bir kez daha hatırlayalım\./u.test(value)
          ? ["Bu resmi bul.", "Bir kez daha hatırlayalım."]
          : ["Bu resmi bul."],
        lang,
      );
    }
    if (/^Hangi sepete ait\?/u.test(value)) return fallbackPlan(["Hangi sepete ait?"], lang);
    if (/hangi harfle başlıyor\?$/u.test(value)) {
      return fallbackPlan(["Bu kelime hangi harfle başlıyor?"], lang);
    }
    if (/Bunun zıttı hangisi\?$/u.test(value)) return fallbackPlan(["Bunun zıttı hangisi?"], lang);
    if (/sonrasında ne gelir\?$/u.test(value)) return fallbackPlan(["Sonra ne gelir?"], lang);
    if (/sonrasında\s+.+?\s+gelir\.$/u.test(value)) return fallbackPlan(["Sırada:"], lang);
    if (/^Benimle söyle:/u.test(value)) return fallbackPlan(["Benimle söyle."], lang);
    if (/^Mino en son ne görüyor\?/u.test(value)) {
      return fallbackPlan(["Mino en son ne görüyor?"], lang);
    }
    if (/^Mino\b[\s\S]*\bgörüyor\.?$/u.test(value)) {
      return fallbackPlan(["Mino en son ne görüyor?"], lang);
    }
    if (/\.\s*Bu resmi seç\.$/u.test(value)) return fallbackPlan(["Bu resmi seç."], lang);
    if (/Sonra ne yapmalıyız\?/u.test(value)) return fallbackPlan(["Sonra ne gelir?"], lang);
    if (/,\s*sonra\s+.+?,\s*ardından\s+/u.test(value)) return fallbackPlan(["Sırada:"], lang);
    if (/kelimesinin zıttıdır\.$/u.test(value)) return fallbackPlan(["Bunun zıttı hangisi?"], lang);
    if (/^Puzzle parçalarını doğru yere sürükle\.$/u.test(value)) {
      return fallbackPlan(["Küçük resme bak."], lang);
    }
  } else {
    if (/^Finde:\s*/u.test(value)) return fallbackPlan(["Finde dieses Bild."], lang);
    if (/^Wo ist\s+/u.test(value)) {
      return fallbackPlan(
        /Das wiederholen wir noch einmal\./u.test(value)
          ? ["Finde dieses Bild.", "Das wiederholen wir noch einmal."]
          : ["Finde dieses Bild."],
        lang,
      );
    }
    if (/^In welchen Korb gehört das\?/u.test(value)) {
      return fallbackPlan(["In welchen Korb gehört das?"], lang);
    }
    if (/^Mit welchem Buchstaben beginnt\s+/u.test(value)) {
      return fallbackPlan(["Mit welchem Buchstaben beginnt das Wort?"], lang);
    }
    if (/Was ist das Gegenteil\?$/u.test(value)) return fallbackPlan(["Was ist das Gegenteil?"], lang);
    if (/^Was kommt nach\s+/u.test(value)) return fallbackPlan(["Was kommt danach?"], lang);
    if (/^Nach\s+.+?\s+kommt\s+/u.test(value)) return fallbackPlan(["Als Nächstes kommt:"], lang);
    if (/^Sprich mir nach:/u.test(value)) return fallbackPlan(["Sprich mir nach."], lang);
    if (/^Was sieht Mino zum Schluss\?/u.test(value)) {
      return fallbackPlan(["Was sieht Mino zum Schluss?"], lang);
    }
    if (/^Mino sieht\b[\s\S]*\.$/u.test(value)) return fallbackPlan(["Was sieht Mino zum Schluss?"], lang);
    if (/\.\s+Tippe auf dieses Bild\.$/u.test(value)) return fallbackPlan(["Tippe auf dieses Bild."], lang);
    if (/Was machen wir danach\?/u.test(value)) return fallbackPlan(["Was kommt danach?"], lang);
    if (/^.+?,\s*dann\s+.+?,\s*danach\s+/u.test(value)) return fallbackPlan(["Als Nächstes kommt:"], lang);
    if (/^.+?\s+ist das Gegenteil von\s+.+?\.$/u.test(value)) {
      return fallbackPlan(["Was ist das Gegenteil?"], lang);
    }
    if (/^Ziehe die Puzzleteile an die richtige Stelle\.$/u.test(value)) {
      return fallbackPlan(["Schau auf das kleine Vorbild."], lang);
    }
  }
  // Tappable vocabulary is also used in exploration, memory, story and
  // replay controls. A missing word recording must not make those controls
  // silent; use one short fixed instruction until the exact word take exists.
  if (learningLabels[lang]?.has(value)) {
    return fallbackPlan([lang === "tr" ? "Bu resmi bul." : "Finde dieses Bild."], lang);
  }
  return [];
}

const personalToFixed = Object.fromEntries(
  ["de", "tr"].map((lang) => {
    const replacements = new Map();
    for (const [text, personalUrl] of Object.entries(personalVoiceEntries[lang] || {})) {
      const fixedUrl = fixedClipForText(text, lang);
      if (fixedUrl && isFixedNaturalVoiceClipUrl(fixedUrl)) replacements.set(personalUrl, fixedUrl);
    }
    return [lang, replacements];
  }),
);

export function fixedNaturalVoicePlan(text, lang = "de") {
  const sourcePlan = naturalVoicePlan(text, lang);
  if (!sourcePlan.length) return fixedNaturalVoiceFallbackPlan(text, lang);
  const replacements = personalToFixed[lang] || new Map();
  const plan = sourcePlan.map((url) => {
    if (isFixedNaturalVoiceClipUrl(url)) return url;
    return replacements.get(url) || "";
  });
  return plan.length && plan.every(isFixedNaturalVoiceClipUrl)
    ? plan
    : fixedNaturalVoiceFallbackPlan(text, lang);
}

export function fixedNaturalVoiceClip(text, lang = "de") {
  const direct = fixedClipForText(text, lang);
  if (isFixedNaturalVoiceClipUrl(direct)) return direct;
  const plan = fixedNaturalVoicePlan(text, lang);
  return plan.length === 1 ? plan[0] : "";
}

export const fixedNaturalVoiceCoverageCount =
  personalToFixed.de.size + personalToFixed.tr.size;
