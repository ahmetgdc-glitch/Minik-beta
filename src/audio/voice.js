import { naturalVoicePlan } from "./naturalVoicePlans.js";

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
  voicePlayer?.pause();
  if (voicePlayer) {
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
if (synth()) {
  refreshVoices();
  synth().addEventListener("voiceschanged", refreshVoices);
}
