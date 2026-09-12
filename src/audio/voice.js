import { naturalVoicePlan } from "./naturalVoicePlans.js";
import { personalVoiceClip } from "./personalVoiceClips.js";
import { setSpeechActive } from "./sounds.js";

let settle = null,
  cloudPlayer = null,
  voicePlayer = null,
  cloudAbort = null,
  sequence = 0;
const SILENT_WAV =
  "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAA";

function naturalPlayer() {
  if (typeof Audio === "undefined") return null;
  if (!voicePlayer) {
    voicePlayer = new Audio();
    // Never eagerly fetch speech. iOS Safari is sensitive to hundreds of media
    // elements/requests during app boot. One reusable player is enough.
    voicePlayer.preload = "none";
    voicePlayer.setAttribute?.("playsinline", "");
  }
  return voicePlayer;
}

/**
 * Unlock exactly one reusable HTMLMediaElement from a real user gesture.
 * No network request is made and no voice library is preloaded.
 */
export async function unlockVoiceAudio() {
  const player = naturalPlayer();
  if (!player) return false;
  try {
    player.pause();
    player.onended = null;
    player.onerror = null;
    player.preload = "none";
    player.src = SILENT_WAV;
    player.currentTime = 0;
    player.volume = 1;
    const started = player.play();
    if (started?.then) await started;
    player.pause();
    player.currentTime = 0;
    return true;
  } catch {
    return false;
  }
}

export function stopSpeech() {
  sequence++;
  cloudAbort?.abort();
  cloudPlayer?.pause();
  voicePlayer?.pause();
  if (voicePlayer) {
    voicePlayer.onended = null;
    voicePlayer.onerror = null;
  }
  cloudPlayer = null;
  settle?.(false);
  settle = null;
  setSpeechActive(false);
}

function isPersonalVoiceClipUrl(url) {
  return (
    /^assets\/personal-voice\/personal-(?:de|tr)-[a-f0-9]{20}\.mp3$/u.test(url || "") ||
    /^https:\/\/resource2\.heygen\.ai\/text_to_speech\/[^\s]+\/id=[a-f0-9-]+\.wav$/u.test(url || "")
  );
}

function localizedGameClip(url) {
  if (!url || typeof document === "undefined") return "";
  try {
    // Generated personal clips are already relative to the app root. Resolve
    // them against the current document so GitHub Pages' `/Minik-beta/` base
    // path is preserved instead of treating them as browser-root URLs.
    if (/^assets\/personal-voice\//u.test(url)) {
      return new URL(url, document.baseURI).href;
    }
    const filename = new URL(url).pathname.split("/").pop();
    if (!/\.(?:mp3|wav)$/iu.test(filename || "")) return "";
    return new URL(`assets/voice/${filename}`, document.baseURI).href;
  } catch {
    return "";
  }
}
async function speakGameClip(url, token) {
  if (!url) return false;
  const player = naturalPlayer();
  if (!player) return false;
  try {
    player.pause();
    player.onended = null;
    player.onerror = null;
    player.preload = "metadata";
    player.src = url;
    player.currentTime = 0;
    player.load?.();
    return await new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        player.onended = null;
        player.onerror = null;
        settle = null;
        resolve(Boolean(ok && token === sequence));
      };
      settle = () => finish(false);
      player.onended = () => finish(true);
      player.onerror = () => finish(false);
      try {
        const started = player.play();
        Promise.resolve(started).catch(() => finish(false));
      } catch {
        finish(false);
      }
    });
  } catch {
    return false;
  }
}
async function playPreferredClip(url, token) {
  const localClip = localizedGameClip(url);
  if (localClip) {
    const playedLocal = await speakGameClip(localClip, token);
    if (playedLocal || token !== sequence) return playedLocal;
  }
  return speakGameClip(url, token);
}
async function speakNaturalPlan(plan, token) {
  if (!plan?.length || !plan.every(isPersonalVoiceClipUrl)) return false;
  for (const clip of plan) {
    if (token !== sequence) return false;
    const played = await playPreferredClip(clip, token);
    if (!played) return false;
  }
  return token === sequence;
}
export async function speak(text, lang = "de", settings = {}) {
  stopSpeech();
  if (!text || settings.audio === false) return false;
  const token = sequence;
  setSpeechActive(true);
  try {
    // The owner's authorized MINIK voice is the only gameplay narrator.
    // Exact recordings are preferred; composed plans are accepted only when
    // every segment is also from the owner's personal voice library.
    const personalClip = personalVoiceClip(text, lang);
    if (personalClip) {
      const playedPersonal = await playPreferredClip(personalClip, token);
      if (playedPersonal || token !== sequence) return playedPersonal;
    }

    const plan = naturalVoicePlan(text, lang);
    if (plan.length && plan.every(isPersonalVoiceClipUrl)) {
      const played = await speakNaturalPlan(plan, token);
      if (played || token !== sequence) return played;
    }

    // No native speech fallback exists.
    // No native or legacy narrator fallback exists; missing personal recordings stay silent.
    return false;
  } finally {
    // An older cancelled request must not raise music over its replacement.
    if (token === sequence) setSpeechActive(false);
  }
}
export async function cloudTTS(text, lang, provider) {
  stopSpeech();
  const token = sequence;
  cloudAbort = new AbortController();
  const blob = await provider({ text, lang, signal: cloudAbort.signal });
  if (token !== sequence) return false;
  const url = URL.createObjectURL(blob);
  const player = naturalPlayer();
  if (!player) return false;
  player.src = url;
  cloudPlayer = player;
  try {
    await player.play();
    return await new Promise((resolve) => {
      player.onended = () => resolve(true);
      player.onerror = () => resolve(false);
      settle = resolve;
    });
  } finally {
    cloudPlayer = null;
    URL.revokeObjectURL(url);
  }
}
