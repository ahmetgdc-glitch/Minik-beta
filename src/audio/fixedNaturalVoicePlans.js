import { gameVoiceClip } from "./gameVoiceClips.js";
import { foodVoiceClip } from "./foodVoiceClips.js";
import { helpVoiceClip } from "./helpVoiceClips.js";
import { categoryVoiceClip } from "./categoryVoiceClips.js";
import { vehicleVoiceClip } from "./vehicleVoiceClips.js";
import { bodyVoiceClip } from "./bodyVoiceClips.js";
import { naturalPhraseClip, naturalVoicePlan } from "./naturalVoicePlans.js";
import { personalVoiceEntries } from "./personalVoiceClips.js";

const FIXED_NATURAL_RE = /^https:\/\/storage\.googleapis\.com\/adm--audio-playback--7d--public\/mcp-preview\/[a-f0-9-]+\.mp3$/iu;

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

/**
 * Never replace requested child-facing speech with a different instruction.
 *
 * Returning an empty plan is intentional: voice.js will then ask the approved
 * Voice 4 fallback to speak the original text verbatim. This is safer than
 * saying a generic sentence such as "Bu resmi bul." when the child actually
 * needs to hear a missing learning word such as "Oyuncak ayı".
 */
export function fixedNaturalVoiceFallbackPlan(text, lang = "de") {
  const value = String(text || "").trim();
  if (!value) return [];
  const exact = fixedClipForText(value, lang);
  return isFixedNaturalVoiceClipUrl(exact) ? [exact] : [];
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
