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
// Session preload has no per-clip decode budget: it runs behind the progress
// bar and must prove a clip is truly playback-ready before the game starts.
const VOICE_PRELOAD_TIMEOUT_MS = 9000;
// A game must never start while its speech is still downloading. These track
// the same clips the shared narrator uses later, so preload and playback share
// one cache and no duplicate download or decode ever runs.
const preloadJobs = new Map();
const primedVoiceClips = new Set();
const mediaPrimedClips = new Set();
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

function isIOSVoiceEnvironment() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator || {};
  const ua = String(nav.userAgent || "");
  const platform = String(nav.platform || "");
  const touchPoints = Number(nav.maxTouchPoints || 0);
  return /iPad|iPhone|iPod/iu.test(ua) || (platform === "MacIntel" && touchPoints > 1);
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
      let mediaStart = null;
      let silentSource = "";

      // On iOS the media element must consume the real gesture synchronously.
      // Waiting for AudioContext.resume() first can move play() outside Safari's
      // activation window and leave later automatic narration silent.
      if (player) {
        try {
          player.pause();
          player.onended = null;
          player.onerror = null;
          player.preload = "none";
          player.src = SILENT_WAV;
          silentSource = player.src;
          player.currentTime = 0;
          player.volume = 1;
          mediaStart = player.play();
        } catch {}
      }

      let contextReady = context?.state === "running";
      let contextStart = null;
      if (context && !contextReady) {
        try {
          contextStart = Promise.resolve(context.resume()).then(
            () => context.state === "running",
            () => false,
          );
        } catch {
          contextStart = Promise.resolve(false);
        }
      }

      if (mediaStart !== null) {
        try {
          if (mediaStart?.then) await mediaStart;
          if (!current()) return finish(false);
          // A newer word may already own the shared player. Never let a late
          // unlock pause or rewind that narration.
          if (player?.src === silentSource) {
            player.pause();
            player.currentTime = 0;
          }
          finish(true);
          return;
        } catch {}
      }

      if (contextStart) contextReady = await contextStart;
      if (!current()) return finish(false);
      // If a media element existed but Safari rejected its gesture play, do
      // not claim success merely because Voice 4 exists. The next real gesture
      // must be allowed to retry the recorded narrator unlock.
      finish(Boolean(contextReady || (!player && systemVoice4Available())));
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
    const filename = new URL(url, document.baseURI).pathname.split("/").pop();
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

async function decodePreloadedClip(url) {
  if (voiceBufferCache.has(url)) return true;
  const context = ensureVoiceContext();
  if (!context || typeof fetch === "undefined") return false;
  try {
    if (context.state === "suspended") {
      try {
        await Promise.resolve(context.resume());
      } catch {}
    }
    const response = await fetch(url, {
      cache: "force-cache",
      credentials: "same-origin",
    });
    if (!response.ok) return false;
    const bytes = await response.arrayBuffer();
    if (!bytes || bytes.byteLength < 64) return false;
    const buffer = await context.decodeAudioData(bytes.slice(0));
    if (!buffer || !Number.isFinite(buffer.duration) || buffer.duration <= 0) return false;
    cacheVoiceBuffer(url, buffer);
    return true;
  } catch {
    return false;
  }
}

function primeMediaClip(url) {
  const player = naturalPlayer();
  if (!player) return false;
  return new Promise((resolve) => {
    let done = false;
    let timer;
    const stillOurs = () => player.src === url;
    const finish = (ok) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      player.removeEventListener("loadeddata", onData);
      player.removeEventListener("canplay", onData);
      player.removeEventListener("error", onError);
      if (ok) mediaPrimedClips.add(url);
      resolve(Boolean(ok && stillOurs()));
    };
    const onData = () => {
      if (stillOurs() && player.readyState >= 2) finish(true);
    };
    const onError = () => finish(false);
    timer = setTimeout(() => finish(stillOurs() && player.readyState >= 2), VOICE_PRELOAD_TIMEOUT_MS);
    player.addEventListener("loadeddata", onData);
    player.addEventListener("canplay", onData);
    player.addEventListener("error", onError);
    try {
      prepareMediaClip(url);
      if (player.readyState >= 2 && stillOurs()) finish(true);
    } catch {
      finish(false);
    }
  });
}

/**
 * Prove a bundled MINIK clip is playback-ready before a game session starts.
 *
 * The decoded AudioBuffer lands in the same `voiceBufferCache` that the later
 * `speakGameClip` fast path consumes, so the first real spoken word needs no
 * network round trip and no second decode. On platforms or page states where
 * WebAudio decoding is unavailable, the shared HTMLAudio player warms the same
 * clip instead. In-flight duplicates share one job (no double downloads) and a
 * failed clip is left outside `primedVoiceClips` so a retry can run again.
 */
export async function preloadVoiceClip(input) {
  const url = localizedGameClip(input ? String(input) : "");
  if (!url) return Promise.resolve(false);
  if (primedVoiceClips.has(url) || voiceBufferCache.has(url) || mediaPrimedClips.has(url)) {
    // The shared media player buffers only the clip it currently holds. When
    // another clip was primed in the meantime, this re-warm binds the player
    // back to the requested clip so an already-primed session text is what a
    // freshly started session will play first on iOS too.
    void primeMediaClip(url).catch(() => false);
    return Promise.resolve(true);
  }
  const existing = preloadJobs.get(url);
  if (existing) return existing;
  const job = (async () => {
    const decoded = await decodePreloadedClip(url);
    const mediaReady = await primeMediaClip(url);
    const ready = decoded || mediaReady;
    if (ready) primedVoiceClips.add(url);
    return ready;
  })();
  preloadJobs.set(url, job);
  try {
    return await job;
  } finally {
    if (preloadJobs.get(url) === job) preloadJobs.delete(url);
  }
}

export function preloadedVoiceReady(input) {
  const url = localizedGameClip(input ? String(input) : "");
  if (!url) return false;
  return primedVoiceClips.has(url) || voiceBufferCache.has(url) || mediaPrimedClips.has(url);
}

async function speakGameClip(url, token) {
  if (!url || !speechForegroundAllowed()) return false;
  prepareMediaClip(url);
  const iosMediaPath = isIOSVoiceEnvironment();

  // iOS Safari can keep an AudioContext in the nominal "running" state after
  // an interruption while buffer sources produce no audible output. Waiting
  // for that source's timeout made repeated MINIK words arrive seconds late.
  // Keep iPhone/iPad narration on the already gesture-primed HTMLAudio player;
  // it is the exact same bundled recording and supports the service-worker
  // byte-range path. Other platforms retain the decoded replay optimization.
  if (!iosMediaPath && voiceContext?.state === "running" && voiceBufferCache.has(url)) {
    const playedWebAudio = await speakWebAudioClip(url, token).catch(() => false);
    if (playedWebAudio || token !== sequence) return playedWebAudio;
  }
  // First playback must never wait for optional JS decoding. Start the same
  // bundled clip through HTML Audio immediately and warm the decoded cache in
  // parallel so a later replay can use WebAudio with effectively no startup.
  if (!iosMediaPath && voiceContext?.state === "running" && !voiceBufferCache.has(url)) {
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
