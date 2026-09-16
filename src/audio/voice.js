import {
  fixedNaturalVoicePlan,
  isFixedNaturalVoiceClipUrl,
} from "./fixedNaturalVoicePlans.js";
import { setSpeechActive } from "./sounds.js";
import {
  hasVoice4Selection,
  speakWithVoice4,
  stopSystemVoice4,
  systemVoice4Available,
  voice4InventoryReady,
} from "./systemVoice4.js";

let settle = null,
  cloudPlayer = null,
  voicePlayer = null,
  cloudAbort = null,
  unlockPending = null,
  cancelUnlock = null,
  voiceContext = null,
  voiceSource = null,
  sequence = 0;
const voiceBufferCache = new Map();
const pendingVoiceLoads = new Set();
const VOICE_START_TIMEOUT_MS = 4000;
// Decoding is an optional fast path, not a reason to keep a child waiting.
// The media player can stream the same recording without decoding it in JS.
const VOICE_DECODE_BUDGET_MS = 500;
const VOICE_PLAYBACK_LIMIT_MS = 45000;
const VOICE_BUFFER_LIMIT_BYTES = 16 * 1024 * 1024;
const VOICE_BUFFER_LIMIT_COUNT = 32;
const establishedVoice4Languages = new Set();
const voice4EngineMissingSince = new Map();
const SILENT_WAV =
  "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAA";

function naturalPlayer() {
  if (typeof Audio === "undefined") return null;
  if (!voicePlayer) {
    voicePlayer = new Audio();
    voicePlayer.preload = "none";
    voicePlayer.setAttribute?.("playsinline", "");
  }
  return voicePlayer;
}

function ensureVoiceContext() {
  if (typeof window === "undefined") return null;
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    if (!voiceContext || voiceContext.state === "closed") voiceContext = new Context();
    return voiceContext;
  } catch {
    return null;
  }
}

function speechForegroundAllowed() {
  if (typeof document === "undefined") return true;
  return !document.hidden && document.visibilityState !== "hidden";
}

export function holdVoice4DuringEngineGap() {
  // A transient iOS speech-engine gap must never block the authorized bundled
  // MINIK narrator. Voice 4 is only consulted after fixed narration cannot play.
  return false;
}

function markVoice4Established(lang) {
  establishedVoice4Languages.add(lang);
  voice4EngineMissingSince.delete(lang);
}

function clearVoice4Continuity(lang) {
  establishedVoice4Languages.delete(lang);
  voice4EngineMissingSince.delete(lang);
}

export async function unlockVoiceAudio() {
  if (!speechForegroundAllowed()) return false;
  if (settle) return true;
  if (unlockPending) return unlockPending;
  const context = ensureVoiceContext();
  const player = naturalPlayer();
  if (!player && !context) return systemVoice4Available();
  const token = sequence;
  let done = false;
  let timer;
  let cancel;
  const pending = new Promise((resolve) => {
    const finish = (ok) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (cancelUnlock === cancel) cancelUnlock = null;
      resolve(Boolean(ok && token === sequence && speechForegroundAllowed()));
    };
    cancel = () => finish(false);
    cancelUnlock = cancel;
    timer = setTimeout(cancel, VOICE_START_TIMEOUT_MS);
    const current = () => !done && token === sequence && speechForegroundAllowed();
    void (async () => {
      let contextReady = false;
      if (context) {
        try {
          if (context.state !== "running") await context.resume();
          contextReady = context.state === "running";
        } catch {}
      }
      // A delayed Safari resume belongs to the gesture that started it. It
      // must never replace a newer word with the silent unlock clip.
      if (!current()) return finish(false);
      if (!player) return finish(contextReady || systemVoice4Available());
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
        if (!current()) return finish(false);
        player.pause();
        player.currentTime = 0;
        finish(true);
      } catch {
        finish(contextReady);
      }
    })();
  });
  unlockPending = pending;
  try {
    return await pending;
  } finally {
    if (unlockPending === pending) unlockPending = null;
  }
}

export function stopSpeech() {
  sequence++;
  cancelUnlock?.();
  unlockPending = null;
  for (const cancel of pendingVoiceLoads) cancel();
  cloudAbort?.abort();
  cloudPlayer?.pause();
  stopSystemVoice4();
  try {
    voiceSource?.stop();
  } catch {}
  voiceSource = null;
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

function bindSpeechLifecycle() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const stopOnPageHide = () => stopSpeech();
  const stopWhenHidden = () => {
    if (document.hidden) stopSpeech();
  };
  window.addEventListener("pagehide", stopOnPageHide);
  document.addEventListener("visibilitychange", stopWhenHidden);
}

bindSpeechLifecycle();

function localizedGameClip(url) {
  if (!url || typeof document === "undefined") return "";
  try {
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

function cacheVoiceBuffer(url, buffer) {
  const bytes = (value) => (value.length || 0) * (value.numberOfChannels || 1) * 4;
  if (bytes(buffer) > VOICE_BUFFER_LIMIT_BYTES) return;
  voiceBufferCache.set(url, buffer);
  let total = [...voiceBufferCache.values()].reduce((sum, value) => sum + bytes(value), 0);
  while (voiceBufferCache.size > VOICE_BUFFER_LIMIT_COUNT || total > VOICE_BUFFER_LIMIT_BYTES) {
    const oldest = voiceBufferCache.keys().next().value;
    total -= bytes(voiceBufferCache.get(oldest));
    voiceBufferCache.delete(oldest);
  }
}

function playbackTimeout(duration) {
  if (!Number.isFinite(duration) || duration <= 0) return 20000;
  return Math.min(VOICE_PLAYBACK_LIMIT_MS, Math.max(5000, duration * 1000 + 2000));
}

function setMediaClipSource(player, url) {
  // Cached byte-range responses need a CORS media request even on our own
  // origin. External emergency sources keep their existing no-CORS behavior.
  const base = typeof document !== "undefined" ? document.baseURI : null;
  player.crossOrigin = base && new URL(url, base).origin === new URL(base).origin
    ? "anonymous"
    : null;
  player.src = url;
}

function prepareMediaClip(url) {
  if (!url || !speechForegroundAllowed()) return;
  const player = naturalPlayer();
  if (!player) return;
  try {
    player.pause();
    player.onended = null;
    player.onerror = null;
    player.onplaying = null;
    player.preload = "auto";
    if (player.src !== url) {
      setMediaClipSource(player, url);
      player.currentTime = 0;
      player.load?.();
    } else if (player.readyState === 0) {
      player.load?.();
    }
  } catch {}
}

async function decodeVoiceBuffer(url, context, token) {
  if (!url || !context || typeof fetch === "undefined") return null;
  if (voiceBufferCache.has(url)) {
    const buffer = voiceBufferCache.get(url);
    voiceBufferCache.delete(url);
    voiceBufferCache.set(url, buffer);
    return buffer;
  }
  return new Promise((resolve) => {
    const controller = new AbortController();
    let done = false;
    const finish = (buffer) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      pendingVoiceLoads.delete(cancel);
      if (buffer) cacheVoiceBuffer(url, buffer);
      resolve(buffer);
    };
    const cancel = () => { controller.abort(); finish(null); };
    const timer = setTimeout(cancel, VOICE_DECODE_BUDGET_MS);
    pendingVoiceLoads.add(cancel);
    void (async () => {
      const response = await fetch(url, { cache: "force-cache", signal: controller.signal });
      if (!response.ok) throw new Error(`voice HTTP ${response.status}`);
      const bytes = await response.arrayBuffer();
      if (done || token !== sequence) return finish(null);
      const buffer = await context.decodeAudioData(bytes.slice(0));
      if (done || token !== sequence) return finish(null);
      finish(buffer);
    })().catch(() => finish(null));
  });
}

async function speakWebAudioClip(url, token) {
  const context = voiceContext;
  if (!context || context.state !== "running" || !speechForegroundAllowed()) return false;
  const buffer = await decodeVoiceBuffer(url, context, token);
  if (!buffer || token !== sequence || context.state !== "running" || !speechForegroundAllowed()) return false;
  return new Promise((resolve) => {
    let done = false;
    let timer;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    voiceSource = source;
    const finish = (ok) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      source.onended = null;
      if (!ok) { try { source.stop(); } catch {} }
      try {
        source.disconnect();
      } catch {}
      if (voiceSource === source) voiceSource = null;
      if (settle === cancel) settle = null;
      resolve(Boolean(ok && token === sequence));
    };
    const cancel = () => finish(false);
    settle = cancel;
    source.onended = () => finish(true);
    timer = setTimeout(cancel, playbackTimeout(buffer.duration));
    try {
      source.start(0);
    } catch {
      finish(false);
    }
  });
}

async function speakMediaClip(url, token) {
  if (!url || !speechForegroundAllowed()) return false;
  if (token !== sequence) return false;
  const player = naturalPlayer();
  if (!player) return false;
  try {
    player.pause();
    player.onended = null;
    player.onerror = null;
    // These recordings are short, bundled assets. Ask Safari to buffer the
    // clip itself so the child hears the first syllable without waiting for a
    // metadata-only round trip after the optional decoder budget expires.
    player.preload = "auto";
    if (player.src !== url) {
      setMediaClipSource(player, url);
      player.currentTime = 0;
      player.load?.();
    } else {
      player.currentTime = 0;
    }
    return await new Promise((resolve) => {
      let done = false;
      let startTimer;
      let endTimer;
      const finish = (ok) => {
        if (done) return;
        done = true;
        clearTimeout(startTimer);
        clearTimeout(endTimer);
        player.onended = null;
        player.onerror = null;
        player.onplaying = null;
        if (!ok) { try { player.pause(); } catch {} }
        if (settle === cancel) settle = null;
        resolve(Boolean(ok && token === sequence));
      };
      const cancel = () => finish(false);
      const startedPlaying = () => {
        if (done) return;
        if (token !== sequence || !speechForegroundAllowed()) return finish(false);
        clearTimeout(startTimer);
        if (endTimer) return;
        endTimer = setTimeout(cancel, playbackTimeout(player.duration));
      };
      settle = cancel;
      player.onended = () => finish(true);
      player.onerror = () => finish(false);
      player.onplaying = startedPlaying;
      startTimer = setTimeout(cancel, VOICE_START_TIMEOUT_MS);
      try {
        if (!speechForegroundAllowed()) {
          finish(false);
          return;
        }
        const started = player.play();
        Promise.resolve(started).then(startedPlaying, () => finish(false));
      } catch {
        finish(false);
      }
    });
  } catch {
    return false;
  }
}

async function speakGameClip(url, token) {
  if (!url || !speechForegroundAllowed()) return false;
  prepareMediaClip(url);
  if (voiceContext?.state === "running" && voiceBufferCache.has(url)) {
    const playedWebAudio = await speakWebAudioClip(url, token).catch(() => false);
    if (playedWebAudio || token !== sequence) return playedWebAudio;
  }
  // First playback must never wait for optional JS decoding. Start the same
  // bundled clip through HTML Audio immediately and warm the decoded cache in
  // parallel so a later replay can use WebAudio with effectively no startup.
  if (voiceContext?.state === "running" && !voiceBufferCache.has(url)) {
    void decodeVoiceBuffer(url, voiceContext, token).catch(() => null);
  }
  return speakMediaClip(url, token);
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
  if (!plan?.length || !plan.every(isFixedNaturalVoiceClipUrl)) return false;
  for (const clip of plan) {
    if (token !== sequence || !speechForegroundAllowed()) return false;
    const played = await playPreferredClip(clip, token);
    if (!played) return false;
  }
  return token === sequence && speechForegroundAllowed();
}

export async function speak(text, lang = "de", settings = {}) {
  stopSpeech();
  if (!text || settings.audio === false || !speechForegroundAllowed()) return false;
  const token = sequence;
  setSpeechActive(true);
  try {
    // The bundled fixed DE/TR MINIK library is the primary narrator on every
    // platform. It is deterministic, localizable for offline use, and avoids
    // Safari voice-inventory differences.
    const plan = fixedNaturalVoicePlan(text, lang);
    if (plan.length) {
      const playedNatural = await speakNaturalPlan(plan, token);
      if (playedNatural || token !== sequence) return playedNatural;
    }

    if (!speechForegroundAllowed()) return false;

    // Apple Voice 4 is an emergency fallback only. A missing or failed Voice 4
    // must never switch MINIK to an arbitrary/default system voice.
    const voice4Available = systemVoice4Available();
    if (!voice4Available && holdVoice4DuringEngineGap(lang)) return false;

    if (voice4Available) {
      voice4EngineMissingSince.delete(lang);
      const playedSystem = await speakWithVoice4(
        text,
        lang,
        settings,
        () => token === sequence && speechForegroundAllowed(),
      );
      if (playedSystem) {
        markVoice4Established(lang);
        return true;
      }
      if (token !== sequence) return false;

      const selectedVoice4 = hasVoice4Selection(lang, settings);
      if (selectedVoice4) markVoice4Established(lang);
      else if (voice4InventoryReady(lang, settings)) clearVoice4Continuity(lang);
    } else {
      clearVoice4Continuity(lang);
    }

    return false;
  } finally {
    if (token === sequence) setSpeechActive(false);
  }
}

export async function cloudTTS(text, lang, provider) {
  stopSpeech();
  if (!speechForegroundAllowed()) return false;
  const token = sequence;
  cloudAbort = new AbortController();
  const blob = await provider({ text, lang, signal: cloudAbort.signal });
  if (token !== sequence || !speechForegroundAllowed()) return false;
  const url = URL.createObjectURL(blob);
  const player = naturalPlayer();
  if (!player) return false;
  player.src = url;
  cloudPlayer = player;
  try {
    if (!speechForegroundAllowed()) return false;
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
