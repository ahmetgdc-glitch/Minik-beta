import { preloadGameVoiceClips } from "./gameVoiceClips.js";
import { naturalVoicePlan, preloadNaturalVoicePlans } from "./naturalVoicePlans.js";

let voices = [],
  settle = null,
  current = null,
  cloudPlayer = null,
  voicePlayer = null,
  cloudAbort = null,
  sequence = 0;
const subs = new Set();
const synth = () =>
  typeof window !== "undefined" ? window.speechSynthesis : null;

const NATURAL_QUALITY = /premium|enhanced|natural|neural|siri/i;
const COMPACT_QUALITY = /compact|espeak|festival/i;
const FRIENDLY_VOICES = /anna|petra|helena|katja|marie|yelda|emel|cem|seda/i;
const localeFor = (lang) => (lang === "tr" ? "tr-TR" : "de-DE");
// 8 silent mono PCM samples. A data URL keeps the unlock independent from
// network/service-worker state and is small enough to execute instantly.
const SILENT_WAV =
  "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAA";

function naturalPlayer() {
  if (typeof Audio === "undefined") return null;
  if (!voicePlayer) {
    voicePlayer = new Audio();
    voicePlayer.preload = "auto";
    voicePlayer.setAttribute?.("playsinline", "");
  }
  return voicePlayer;
}

/**
 * Unlock the persistent HTMLMediaElement used for recorded Mino speech.
 * iOS Safari does not consider an unlocked AudioContext sufficient for later
 * HTMLAudioElement.play() calls. Reusing this exact element after a gesture
 * makes delayed lesson narration reliable after navigation.
 */
export async function primeVoiceAudio() {
  const player = naturalPlayer();
  if (!player) return false;
  try {
    player.pause();
    player.onended = null;
    player.onerror = null;
    player.src = SILENT_WAV;
    player.volume = 0;
    player.currentTime = 0;
    const started = player.play();
    if (started?.then) await started;
    player.pause();
    player.currentTime = 0;
    player.volume = 1;
    return true;
  } catch {
    try { player.volume = 1; } catch {}
    return false;
  }
}

export function refreshVoices() {
  voices = synth()?.getVoices?.() || [];
  subs.forEach((fn) => fn());
  return voices;
}
export function getVoices(lang) {
  const exactLocale = localeFor(lang).toLowerCase();
  return voices
    .filter((v) => v.lang?.toLowerCase().startsWith(lang))
    .sort((a, b) => voiceScore(b, exactLocale) - voiceScore(a, exactLocale));
}
function voiceScore(v, exactLocale = "") {
  const name = v.name || "";
  const locale = String(v.lang || "").toLowerCase();
  return (
    (NATURAL_QUALITY.test(name) ? 320 : 0) +
    (FRIENDLY_VOICES.test(name) ? 70 : 0) +
    (locale === exactLocale ? 55 : 0) +
    (v.localService ? 35 : 0) +
    (COMPACT_QUALITY.test(name) ? -180 : 0)
  );
}
export function chooseVoice(lang, uri) {
  const list = getVoices(lang);
  return list.find((v) => v.voiceURI === uri) || list[0] || null;
}
export function subscribeVoices(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
export function stopSpeech() {
  sequence++;
  synth()?.cancel();
  cloudAbort?.abort();
  cloudPlayer?.pause();
  if (voicePlayer) {
    voicePlayer.pause();
    voicePlayer.onended = null;
    voicePlayer.onerror = null;
  }
  cloudPlayer = null;
  current = null;
  settle?.(false);
  settle = null;
}
function naturalRate(lang, configured) {
  const value = Number(configured);
  if (Number.isFinite(value)) return Math.min(1.08, Math.max(0.82, value));
  return lang === "tr" ? 0.92 : 0.94;
}
function naturalPitch(configured) {
  const value = Number(configured);
  if (Number.isFinite(value)) return Math.min(1.12, Math.max(0.92, value));
  return 1.02;
}
function speakSystem(text, lang, settings, token) {
  const engine = synth();
  if (!engine) return Promise.resolve(false);
  refreshVoices();
  return new Promise((resolve) => {
    let finished = false;
    const u = new SpeechSynthesisUtterance(text);
    current = u;
    u.lang = localeFor(lang);
    u.rate = naturalRate(lang, settings.rate);
    u.pitch = naturalPitch(settings.pitch);
    u.volume = 1;
    const voice = chooseVoice(lang, settings.voices?.[lang]);
    if (voice) u.voice = voice;
    const timeoutMs = Math.min(20000, Math.max(4500, text.length * 180));
    const timer = setTimeout(() => finish(false), timeoutMs);
    function finish(ok) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (current === u) {
        current = null;
        settle = null;
      }
      resolve(ok && token === sequence);
    }
    settle = () => finish(false);
    u.onend = () => finish(true);
    u.onerror = () => finish(false);
    try {
      engine.resume?.();
      engine.speak(u);
    } catch {
      finish(false);
    }
  });
}
function localizedGameClip(url) {
  if (!url || typeof document === "undefined") return "";
  try {
    const filename = new URL(url).pathname.split("/").pop();
    if (!filename?.endsWith(".mp3")) return "";
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
    player.volume = 1;
    player.src = url;
    player.currentTime = 0;
    player.load?.();
    cloudPlayer = player;
    return await new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        player.onended = null;
        player.onerror = null;
        if (cloudPlayer === player) cloudPlayer = null;
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
  if (!plan?.length) return false;
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
  const plan = naturalVoicePlan(text, lang);
  if (plan.length) {
    const played = await speakNaturalPlan(plan, token);
    if (played || token !== sequence) return played;
  }
  // Recorded voice remains the default. System speech is only an emergency
  // fallback when the parent/user explicitly enabled it.
  if (settings.systemVoiceFallback === true) {
    return speakSystem(text, lang, settings, token);
  }
  return false;
}
export async function cloudTTS(text, lang, provider) {
  stopSpeech();
  const token = sequence;
  cloudAbort = new AbortController();
  const blob = await provider({ text, lang, signal: cloudAbort.signal });
  if (token !== sequence) return false;
  const url = URL.createObjectURL(blob);
  cloudPlayer = new Audio(url);
  try {
    await cloudPlayer.play();
    return await new Promise((resolve) => {
      cloudPlayer.onended = () => resolve(true);
      cloudPlayer.onerror = () => resolve(false);
      settle = resolve;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
if (synth()) {
  refreshVoices();
  synth().addEventListener("voiceschanged", refreshVoices);
}
if (typeof Audio !== "undefined") {
  naturalPlayer();
  preloadGameVoiceClips();
  preloadNaturalVoicePlans();
}
