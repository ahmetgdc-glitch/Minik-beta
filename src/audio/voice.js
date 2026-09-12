import { naturalVoicePlan } from "./naturalVoicePlans.js";
import { personalVoiceClip } from "./personalVoiceClips.js";
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
  voiceContext = null,
  voiceSource = null,
  sequence = 0;
const voiceBufferCache = new Map();
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
    voiceContext ||= new Context();
    if (voiceContext.state === "suspended") voiceContext.resume().catch(() => {});
    return voiceContext;
  } catch {
    return null;
  }
}

export async function unlockVoiceAudio() {
  if (settle) return true;
  if (unlockPending) return unlockPending;
  const context = ensureVoiceContext();
  const player = naturalPlayer();
  if (!player && !context) return systemVoice4Available();
  const token = sequence;
  unlockPending = (async () => {
    let contextReady = false;
    if (context) {
      try {
        if (context.state !== "running") await context.resume();
        contextReady = context.state === "running";
      } catch {}
    }
    if (!player) return contextReady || systemVoice4Available();
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
      if (token === sequence) {
        player.pause();
        player.currentTime = 0;
      }
      return true;
    } catch {
      return contextReady || systemVoice4Available();
    }
  })();
  try { return await unlockPending; }
  finally { unlockPending = null; }
}

export function stopSpeech() {
  sequence++;
  cloudAbort?.abort();
  cloudPlayer?.pause();
  stopSystemVoice4();
  try { voiceSource?.stop(); } catch {}
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

function isPersonalVoiceClipUrl(url) {
  return (
    /^assets\/personal-voice\/personal-(?:de|tr)-[a-f0-9]{20}\.mp3$/u.test(url || "") ||
    /^https:\/\/resource2\.heygen\.ai\/text_to_speech\/[^\s]+\/id=[a-f0-9-]+\.wav$/u.test(url || "")
  );
}

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

async function decodeVoiceBuffer(url, context) {
  if (!url || !context || typeof fetch === "undefined") return null;
  if (voiceBufferCache.has(url)) return voiceBufferCache.get(url);
  const pending = (async () => {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) throw new Error(`voice HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    return context.decodeAudioData(bytes.slice(0));
  })();
  voiceBufferCache.set(url, pending);
  try {
    return await pending;
  } catch {
    voiceBufferCache.delete(url);
    return null;
  }
}

async function speakWebAudioClip(url, token) {
  const context = voiceContext;
  if (!context || context.state !== "running") return false;
  const buffer = await decodeVoiceBuffer(url, context);
  if (!buffer || token !== sequence || context.state !== "running") return false;
  return new Promise((resolve) => {
    let done = false;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    voiceSource = source;
    const finish = (ok) => {
      if (done) return;
      done = true;
      try { source.disconnect(); } catch {}
      if (voiceSource === source) voiceSource = null;
      settle = null;
      resolve(Boolean(ok && token === sequence));
    };
    settle = () => {
      try { source.stop(); } catch {}
      finish(false);
    };
    source.onended = () => finish(true);
    try {
      source.start(0);
    } catch {
      finish(false);
    }
  });
}

async function speakMediaClip(url, token) {
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

async function speakGameClip(url, token) {
  if (!url) return false;
  if (voiceContext?.state === "running") {
    const playedWebAudio = await speakWebAudioClip(url, token);
    if (playedWebAudio || token !== sequence) return playedWebAudio;
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
    if (systemVoice4Available()) {
      const playedSystem = await speakWithVoice4(
        text,
        lang,
        settings,
        () => token === sequence,
      );
      if (playedSystem || token !== sequence) return playedSystem;

      // A selected Voice 4 must remain the narrator. Safari occasionally
      // rejects an individual speechSynthesis call even though the voice is
      // still available; changing to a recorded person for only that sentence
      // sounds like a different character. Only use recordings when Voice 4
      // is genuinely unavailable.
      if (hasVoice4Selection(lang, settings)) return false;

      // An empty Safari voice inventory is not proof that Voice 4 is absent.
      // Some iOS launches populate getVoices() late and never fire the event
      // within the first wait window. Staying silent for this one request is
      // preferable to switching Mino to a different recorded speaker; the next
      // request will retry Voice 4 once the inventory appears.
      if (!voice4InventoryReady()) return false;
    }

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
    return false;
  } finally {
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
