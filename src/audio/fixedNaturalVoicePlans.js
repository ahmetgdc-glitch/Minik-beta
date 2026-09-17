import { gameVoiceClip } from "./gameVoiceClips.js";
import { foodVoiceClip } from "./foodVoiceClips.js";
import { helpVoiceClip } from "./helpVoiceClips.js";
import { categoryVoiceClip } from "./categoryVoiceClips.js";
import { vehicleVoiceClip } from "./vehicleVoiceClips.js";
import { bodyVoiceClip } from "./bodyVoiceClips.js";
import { naturalPhraseClip } from "./naturalVoicePlans.js";
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
  // Production narration is exact-text only. Legacy naturalVoicePlan can
  // compose semantic fragments for previews/tests, but a child must never hear
  // a rewritten sentence such as "Bu resmi bul. Ayı." when MINIK requested
  // "Ayı nerede?". If the complete requested sentence is not recorded as one
  // approved fixed clip, return no plan so voice.js speaks the complete original
  // text through the controlled Voice 4 fallback.
  return fixedNaturalVoiceFallbackPlan(text, lang);
}

export function fixedNaturalVoiceClip(text, lang = "de") {
  const direct = fixedClipForText(text, lang);
  if (isFixedNaturalVoiceClipUrl(direct)) return direct;
  const plan = fixedNaturalVoicePlan(text, lang);
  return plan.length === 1 ? plan[0] : "";
}

export const fixedNaturalVoiceCoverageCount =
  personalToFixed.de.size + personalToFixed.tr.size;
