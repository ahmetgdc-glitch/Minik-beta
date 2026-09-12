const VOICE4_RE = /(?:^|\b)(?:stimme\s*4|voice\s*4)(?:\b|$)/iu;
const SIRI_RE = /(?:^|\b)siri(?:\b|$)/iu;
const FIRST_VOICE_WAIT_MS = 1600;
const RETRY_VOICE_WAIT_MS = 700;
const PLAYBACK_RETRY_MS = 90;

function engine() {
  return typeof globalThis !== "undefined" ? globalThis.speechSynthesis || null : null;
}

function UtteranceClass() {
  return typeof globalThis !== "undefined" ? globalThis.SpeechSynthesisUtterance || null : null;
}

export function systemVoice4Available() {
  return Boolean(engine() && UtteranceClass());
}

export function exposedSystemVoices() {
  try {
    return engine()?.getVoices?.() || [];
  } catch {
    return [];
  }
}

function matchesLanguage(voice, lang) {
  const prefix = lang === "tr" ? "tr" : "de";
  return String(voice?.lang || "").toLowerCase().startsWith(prefix);
}

function voiceIdentity(voice) {
  return `${voice?.name || ""} ${voice?.voiceURI || ""}`.trim();
}

export function isVoice4Candidate(voice) {
  const id = voiceIdentity(voice);
  return VOICE4_RE.test(id) || SIRI_RE.test(id);
}

const selectedVoiceCache = new Map();
const pendingVoiceLookup = new Map();
let observedSynth = null;
let voicesObserved = false;

function refreshVoiceCache() {
  const voices = exposedSystemVoices();
  for (const lang of ["de", "tr"]) {
    const selected = selectVoice4(voices, lang);
    if (selected) selectedVoiceCache.set(lang, selected);
  }
  return voices;
}

function observeVoiceChanges() {
  const synth = engine();
  if (!synth || observedSynth === synth || typeof synth.addEventListener !== "function") return;
  observedSynth = synth;
  synth.addEventListener("voiceschanged", () => {
    voicesObserved = true;
    refreshVoiceCache();
  });
}

export function voice4InventoryReady() {
  if (!systemVoice4Available()) return true;
  return voicesObserved || exposedSystemVoices().length > 0;
}

export function selectVoice4(voices, lang, settings = {}) {
  const available = (voices || []).filter(isVoice4Candidate);
  if (!available.length) return null;
  const sameLanguage = available.filter((voice) => matchesLanguage(voice, lang));

  const saved = String(settings?.voices?.[lang] || "").trim().toLowerCase();
  if (saved) {
    const exact = available.find((voice) =>
      [voice?.name, voice?.voiceURI].some(
        (value) => String(value || "").trim().toLowerCase() === saved,
      ),
    );
    if (exact) return exact;
  }

  return (
    sameLanguage.find((voice) => VOICE4_RE.test(voiceIdentity(voice))) ||
    sameLanguage.find((voice) => SIRI_RE.test(voiceIdentity(voice))) ||
    available.find((voice) => VOICE4_RE.test(voiceIdentity(voice))) ||
    available.find((voice) => SIRI_RE.test(voiceIdentity(voice))) ||
    null
  );
}

export function hasVoice4Selection(lang = "de", settings = {}) {
  const cached = selectedVoiceCache.get(lang);
  if (cached && isVoice4Candidate(cached)) return true;
  const selected = selectVoice4(exposedSystemVoices(), lang, settings);
  if (selected) {
    selectedVoiceCache.set(lang, selected);
    return true;
  }
  return false;
}

async function waitForVoice4(lang, settings, timeoutMs) {
  observeVoiceChanges();
  const cached = selectedVoiceCache.get(lang);
  if (cached && isVoice4Candidate(cached)) return cached;

  let selected = selectVoice4(refreshVoiceCache(), lang, settings);
  if (selected || !systemVoice4Available()) {
    if (selected) selectedVoiceCache.set(lang, selected);
    return selected;
  }

  if (pendingVoiceLookup.has(lang)) return pendingVoiceLookup.get(lang);
  const synth = engine();
  if (!synth || typeof synth.addEventListener !== "function") return null;

  const waitMs = Number.isFinite(timeoutMs)
    ? timeoutMs
    : (voicesObserved ? RETRY_VOICE_WAIT_MS : FIRST_VOICE_WAIT_MS);

  const pending = new Promise((resolve) => {
    let finished = false;
    const finish = (voice) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      synth.removeEventListener?.("voiceschanged", onVoicesChanged);
      if (voice) selectedVoiceCache.set(lang, voice);
      resolve(voice || null);
    };
    const onVoicesChanged = () => {
      voicesObserved = true;
      const voice = selectVoice4(refreshVoiceCache(), lang, settings);
      if (voice) finish(voice);
    };
    const timer = setTimeout(() => {
      const finalVoice = selectVoice4(refreshVoiceCache(), lang, settings);
      finish(finalVoice);
    }, waitMs);
    synth.addEventListener("voiceschanged", onVoicesChanged);
    onVoicesChanged();
  }).finally(() => pendingVoiceLookup.delete(lang));

  pendingVoiceLookup.set(lang, pending);
  return pending;
}

function minoRate(settings = {}) {
  const requested = Number(settings.rate);
  return Math.min(1, Math.max(0.9, Number.isFinite(requested) ? requested : 0.96));
}

function minoPitch(settings = {}) {
  const requested = Number(settings.pitch);
  return Math.min(1.05, Math.max(0.98, Number.isFinite(requested) ? requested : 1.01));
}

let activeUtterance = null;

export function stopSystemVoice4() {
  try { engine()?.cancel?.(); } catch {}
  activeUtterance = null;
}

function playVoice4Attempt(text, lang, settings, voice, isCurrent) {
  const synth = engine();
  const Utterance = UtteranceClass();
  if (!synth || !Utterance || !voice || !isCurrent()) return Promise.resolve(false);

  return new Promise((resolve) => {
    let done = false;
    let utterance;
    const finish = (ok) => {
      if (done) return;
      done = true;
      if (utterance) {
        utterance.onend = null;
        utterance.onerror = null;
      }
      if (activeUtterance === utterance) activeUtterance = null;
      resolve(Boolean(ok && isCurrent()));
    };

    try {
      utterance = new Utterance(text);
      utterance.lang = lang === "tr" ? "tr-TR" : "de-DE";
      utterance.voice = voice;
      utterance.rate = minoRate(settings);
      utterance.pitch = minoPitch(settings);
      utterance.volume = 1;
      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);
      activeUtterance = utterance;
      synth.cancel();
      synth.speak(utterance);
    } catch {
      finish(false);
    }
  });
}

function retryDelay(isCurrent) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(isCurrent()), PLAYBACK_RETRY_MS);
  });
}

export async function speakWithVoice4(text, lang = "de", settings = {}, isCurrent = () => true) {
  if (!text || !systemVoice4Available() || !isCurrent()) return false;
  const voice = await waitForVoice4(lang, settings);
  if (!voice || !isCurrent()) return false;

  const firstAttempt = await playVoice4Attempt(text, lang, settings, voice, isCurrent);
  if (firstAttempt || !isCurrent()) return firstAttempt;

  // Safari can transiently reject/interupt one speechSynthesis call while the
  // selected voice itself is still valid. Retry Voice 4 once instead of
  // immediately changing narrator to a recorded fallback.
  const mayRetry = await retryDelay(isCurrent);
  if (!mayRetry) return false;
  return playVoice4Attempt(text, lang, settings, voice, isCurrent);
}
