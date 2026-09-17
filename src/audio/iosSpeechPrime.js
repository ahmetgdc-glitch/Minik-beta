let primedSynth = null;
let primedAt = 0;
const REPRIME_AFTER_MS = 15000;

function isIOSSpeechEnvironment() {
  if (typeof navigator === "undefined") return false;
  const ua = String(navigator.userAgent || "");
  const platform = String(navigator.platform || "");
  const touchPoints = Number(navigator.maxTouchPoints || 0);
  return /iPad|iPhone|iPod/iu.test(ua) || (platform === "MacIntel" && touchPoints > 1);
}

/**
 * iOS WebKit keeps speech synthesis behind a user-gesture gate until the first
 * speak() call happens synchronously inside a real tap/key gesture. MINIK's
 * real narrator can be selected asynchronously afterwards, so prime the gate
 * with one silent blank utterance before any promise/await work begins.
 *
 * This deliberately does not choose a fallback voice and never cancels active
 * narration. It only removes Safari's first-speech gesture restriction.
 * A long-idle PWA is allowed to re-prime on a later real gesture because iOS
 * may revoke media/speech readiness after sleep without replacing the engine.
 */
export function primeSystemSpeechForIOS() {
  if (!isIOSSpeechEnvironment()) return true;
  const synth = typeof globalThis !== "undefined" ? globalThis.speechSynthesis || null : null;
  const Utterance = typeof globalThis !== "undefined" ? globalThis.SpeechSynthesisUtterance || null : null;
  if (!synth || !Utterance || typeof synth.speak !== "function") return false;
  const now = Date.now();
  if (primedSynth === synth && now - primedAt < REPRIME_AFTER_MS) return true;

  try {
    const utterance = new Utterance(" ");
    utterance.volume = 0;
    utterance.rate = 10;
    synth.speak(utterance);
    primedSynth = synth;
    primedAt = now;
    return true;
  } catch {
    return false;
  }
}

export function systemSpeechGesturePrimed() {
  const synth = typeof globalThis !== "undefined" ? globalThis.speechSynthesis || null : null;
  return Boolean(synth && primedSynth === synth);
}
