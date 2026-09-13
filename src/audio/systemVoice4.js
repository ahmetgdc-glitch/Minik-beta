const VOICE4_RE = /(?:^|\b)(?:stimme\s*4|voice\s*4)(?:\b|$)/iu;
const TURKISH_VOICE4_RE = /(?:^|\b)ses\s*4(?:\b|$)/iu;
const SIRI_RE = /(?:^|\b)siri\s*(?:stimme|voice|ses)?\s*4(?:\b|$)/iu;
const FIRST_VOICE_WAIT_MS = 1600;
const RETRY_VOICE_WAIT_MS = 700;
const PLAYBACK_RETRY_MS = 90;
const PLAYBACK_WATCHDOG_MIN_MS = 5000;
const PLAYBACK_WATCHDOG_MAX_MS = 18000;
const IOS_ABSENCE_GRACE_MS = 5000;
const IOS_RECORDED_FALLBACK_ALLOWED = false;

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

function sameVoice(a, b) {
  return Boolean(a && b && voiceIdentity(a) === voiceIdentity(b));
}

function savedVoicePreference(lang, settings = {}) {
  return String(settings?.voices?.[lang] || "").trim().toLowerCase();
}

function matchesSavedVoice(voice, saved) {
  if (!saved) return true;
  return [voice?.name, voice?.voiceURI].some(
    (value) => String(value || "").trim().toLowerCase() === saved,
  );
}

function voiceLookupKey(lang, settings = {}) {
  return `${lang}:${savedVoicePreference(lang, settings)}`;
}

export function isVoice4Candidate(voice) {
  const id = voiceIdentity(voice);
  return VOICE4_RE.test(id) || TURKISH_VOICE4_RE.test(id) || SIRI_RE.test(id);
}

function isIOSSpeechEnvironment() {
  if (typeof navigator === "undefined") return false;
  const ua = String(navigator.userAgent || "");
  const platform = String(navigator.platform || "");
  const touchPoints = Number(navigator.maxTouchPoints || 0);
  return /iPad|iPhone|iPod/iu.test(ua) || (platform === "MacIntel" && touchPoints > 1);
}

function voiceIsEligibleForLanguage(voice, lang) {
  return Boolean(
    isVoice4Candidate(voice) &&
    (!isIOSSpeechEnvironment() || matchesLanguage(voice, lang)),
  );
}

function voiceIsSafeForPlayback(voice, lang) {
  const voices = exposedSystemVoices();
  if (!voices.length) return !isIOSSpeechEnvironment();
  return voices.some(
    (candidate) => voiceIsEligibleForLanguage(candidate, lang) && sameVoice(candidate, voice),
  );
}

const selectedVoiceCache = new Map();
const pendingVoiceLookup = new Map();
let observedSynth = null;
let cacheSynth = null;
let voicesObserved = false;
const iosVoice4MissingSince = new Map();

function syncVoiceEngine() {
  const synth = engine();
  if (cacheSynth !== synth) {
    selectedVoiceCache.clear();
    pendingVoiceLookup.clear();
    voicesObserved = false;
    iosVoice4MissingSince.clear();
  }
  cacheSynth = synth;
  return synth;
}

function cachedVoiceFor(lang, voices = exposedSystemVoices(), settings = {}) {
  syncVoiceEngine();
  const cached = selectedVoiceCache.get(lang);
  if (!cached || !voiceIsEligibleForLanguage(cached, lang)) {
    selectedVoiceCache.delete(lang);
    return null;
  }

  // A changed explicit Voice 4 preference must take effect immediately. A
  // stale per-language cache would otherwise keep speaking the previous
  // narrator, especially when rapid requests share Safari's delayed inventory.
  const saved = savedVoicePreference(lang, settings);
  if (saved && !matchesSavedVoice(cached, saved)) {
    selectedVoiceCache.delete(lang);
    return null;
  }

  // An empty list on Safari means "inventory not ready", not "voice removed".
  // Preserve the last known narrator until iOS exposes a real inventory.
  if (!voices.length) return cached;

  const live = voices.find(
    (voice) => voiceIsEligibleForLanguage(voice, lang) && sameVoice(voice, cached),
  );
  if (live) {
    iosVoice4MissingSince.delete(lang);
    selectedVoiceCache.set(lang, live);
    return live;
  }

  const replacementVoice4 = voices.some((voice) => voiceIsEligibleForLanguage(voice, lang));
  if (replacementVoice4) {
    iosVoice4MissingSince.delete(lang);
  } else if (isIOSSpeechEnvironment()) {
    // Keep the remembered narrator identity across Safari's partial inventory,
    // but never hand a stale Voice 4 object to speechSynthesis. Safari may
    // ignore a voice object that is absent from the current non-empty
    // inventory and silently speak with its default robotic voice. Returning
    // null here makes this request wait/fail silently while preserving the
    // cache for the next inventory refresh.
    if (!iosVoice4MissingSince.has(lang)) iosVoice4MissingSince.set(lang, Date.now());
    return null;
  }

  // Outside iOS, or when iOS exposes another explicit same-language Voice 4
  // candidate, invalidate the stale identity so selection can move to the
  // live voice without ever crossing German/Turkish narrator identities.
  selectedVoiceCache.delete(lang);
  iosVoice4MissingSince.delete(lang);
  return null;
}

function refreshVoiceCache() {
  syncVoiceEngine();
  const voices = exposedSystemVoices();
  for (const lang of ["de", "tr"]) {
    if (voices.some((voice) => voiceIsEligibleForLanguage(voice, lang))) {
      iosVoice4MissingSince.delete(lang);
    }
  }

  // voiceschanged is an inventory refresh, not a user preference change.
  // Preserve an existing per-language Voice 4 identity when it is still live,
  // but do not populate an empty cache without the settings object that may
  // contain the user's explicitly selected Voice 4 variant. Callers that have
  // settings (waitForVoice4/hasVoice4Selection) perform the actual selection.
  if (voices.length) {
    for (const lang of ["de", "tr"]) {
      if (selectedVoiceCache.has(lang)) cachedVoiceFor(lang, voices);
    }
  }
  return voices;
}

function observeVoiceChanges() {
  const synth = syncVoiceEngine();
  if (!synth || observedSynth === synth || typeof synth.addEventListener !== "function") return;
  observedSynth = synth;
  synth.addEventListener("voiceschanged", () => {
    if (engine() !== synth) return;
    voicesObserved = true;
    refreshVoiceCache();
  });
}

export function voice4InventoryReady(lang = "de", settings = {}) {
  if (!systemVoice4Available()) return true;
  syncVoiceEngine();
  const voices = exposedSystemVoices();
  // Safari may emit voiceschanged before getVoices() is actually populated.
  // A real non-empty inventory is the only safe evidence that Voice 4 was
  // checked. Until then, never switch narrator.
  if (!voices.length) {
    iosVoice4MissingSince.delete(lang);
    return false;
  }

  const eligible = voices.filter((voice) => voiceIsEligibleForLanguage(voice, lang));
  const saved = savedVoicePreference(lang, settings);
  const exactSavedVoice = saved && eligible.some((voice) => matchesSavedVoice(voice, saved));
  if (eligible.length && (!isIOSSpeechEnvironment() || !saved || exactSavedVoice)) {
    iosVoice4MissingSince.delete(lang);
    return true;
  }
  if (!isIOSSpeechEnvironment()) return true;

  // iOS narrator identity is strict: an opposite-language Voice 4 or a
  // different same-language Voice 4 variant is not evidence that the requested
  // narrator is available. Treat that partial inventory like a missing Voice 4
  // rather than switching voices or falling through to a personal recording.
  const now = Date.now();
  const missingSince = iosVoice4MissingSince.get(lang);
  if (!missingSince) {
    iosVoice4MissingSince.set(lang, now);
    return false;
  }
  return now - missingSince >= IOS_ABSENCE_GRACE_MS && IOS_RECORDED_FALLBACK_ALLOWED;
}

export function selectVoice4(voices, lang, settings = {}) {
  const available = (voices || []).filter(isVoice4Candidate);
  if (!available.length) return null;
  const sameLanguage = available.filter((voice) => matchesLanguage(voice, lang));
  const eligible = isIOSSpeechEnvironment() ? sameLanguage : available;
  if (!eligible.length) return null;

  const saved = savedVoicePreference(lang, settings);
  if (saved) {
    const exact = eligible.find((voice) => matchesSavedVoice(voice, saved));
    if (exact) return exact;
    // An explicitly selected iOS Voice 4 variant is part of Mino's narrator
    // identity. Safari often publishes partial inventories during launch and
    // resume; choosing another Voice 4 here would make the character change
    // voice mid-session. Stay silent until the requested variant returns.
    if (isIOSSpeechEnvironment()) return null;
  }

  return (
    sameLanguage.find((voice) => VOICE4_RE.test(voiceIdentity(voice))) ||
    sameLanguage.find((voice) => TURKISH_VOICE4_RE.test(voiceIdentity(voice))) ||
    sameLanguage.find((voice) => SIRI_RE.test(voiceIdentity(voice))) ||
    eligible.find((voice) => VOICE4_RE.test(voiceIdentity(voice))) ||
    eligible.find((voice) => TURKISH_VOICE4_RE.test(voiceIdentity(voice))) ||
    eligible.find((voice) => SIRI_RE.test(voiceIdentity(voice))) ||
    null
  );
}

export function hasVoice4Selection(lang = "de", settings = {}) {
  syncVoiceEngine();
  const voices = exposedSystemVoices();
  const cached = cachedVoiceFor(lang, voices, settings);
  if (cached) return true;
  const selected = selectVoice4(voices, lang, settings);
  if (selected) {
    selectedVoiceCache.set(lang, selected);
    return true;
  }
  return false;
}

async function waitForVoice4(lang, settings, timeoutMs) {
  observeVoiceChanges();
  const lookupSynth = syncVoiceEngine();
  const initialVoices = exposedSystemVoices();
  const cached = cachedVoiceFor(lang, initialVoices, settings);
  if (cached) return cached;

  let selected = selectVoice4(refreshVoiceCache(), lang, settings);
  if (selected || !systemVoice4Available()) {
    if (selected) selectedVoiceCache.set(lang, selected);
    return selected;
  }

  const lookupKey = voiceLookupKey(lang, settings);
  if (pendingVoiceLookup.has(lookupKey)) return pendingVoiceLookup.get(lookupKey);
  const synth = lookupSynth;
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
      const liveVoice = engine() === synth ? voice : null;
      if (liveVoice) selectedVoiceCache.set(lang, liveVoice);
      resolve(liveVoice || null);
    };
    const onVoicesChanged = () => {
      if (engine() !== synth) {
        finish(null);
        return;
      }
      voicesObserved = true;
      const voice = selectVoice4(refreshVoiceCache(), lang, settings);
      if (voice) finish(voice);
    };
    const timer = setTimeout(() => {
      if (engine() !== synth) {
        finish(null);
        return;
      }
      const finalVoice = selectVoice4(refreshVoiceCache(), lang, settings);
      finish(finalVoice);
    }, waitMs);
    synth.addEventListener("voiceschanged", onVoicesChanged);
    onVoicesChanged();
  }).finally(() => {
    if (pendingVoiceLookup.get(lookupKey) === pending) pendingVoiceLookup.delete(lookupKey);
  });

  pendingVoiceLookup.set(lookupKey, pending);
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

export function voice4PlaybackWatchdogMs(text) {
  const estimated = String(text || "").trim().length * 180;
  return Math.min(PLAYBACK_WATCHDOG_MAX_MS, Math.max(PLAYBACK_WATCHDOG_MIN_MS, estimated));
}

let activeUtterance = null;
let activeAttemptFinish = null;
let activeSynth = null;
let voice4Sequence = 0;

export function stopSystemVoice4() {
  voice4Sequence += 1;
  const synth = activeSynth;
  const finish = activeAttemptFinish;
  activeSynth = null;
  activeAttemptFinish = null;
  finish?.(false);
  try { synth?.cancel?.(); } catch {}
  const currentSynth = engine();
  if (currentSynth && currentSynth !== synth) {
    try { currentSynth.cancel?.(); } catch {}
  }
  activeUtterance = null;
}

function playVoice4Attempt(text, lang, settings, voice, isCurrent) {
  const synth = syncVoiceEngine();
  const Utterance = UtteranceClass();
  if (!synth || !Utterance || !voice || !isCurrent() || !voiceIsSafeForPlayback(voice, lang)) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    let done = false;
    let utterance;
    let watchdog = null;
    const finish = (ok) => {
      if (done) return;
      done = true;
      if (watchdog !== null) clearTimeout(watchdog);
      if (utterance) {
        utterance.onend = null;
        utterance.onerror = null;
      }
      if (activeUtterance === utterance) activeUtterance = null;
      if (activeSynth === synth) activeSynth = null;
      if (activeAttemptFinish === finish) activeAttemptFinish = null;
      resolve(Boolean(ok && isCurrent() && engine() === synth));
    };

    try {
      utterance = new Utterance(text);
      utterance.lang = lang === "tr" ? "tr-TR" : "de-DE";
      utterance.voice = voice;
      utterance.rate = minoRate(settings);
      utterance.pitch = minoPitch(settings);
      utterance.volume = 1;
      const previousSynth = activeSynth;
      activeAttemptFinish?.(false);
      try { previousSynth?.cancel?.(); } catch {}
      activeAttemptFinish = finish;
      activeUtterance = utterance;
      activeSynth = synth;
      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);
      synth.cancel();
      watchdog = setTimeout(() => finish(false), voice4PlaybackWatchdogMs(text));
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

function currentVoice4ForRetry(lang, settings) {
  const voices = exposedSystemVoices();
  const cached = cachedVoiceFor(lang, voices, settings);
  if (cached) return cached;

  const selected = selectVoice4(voices, lang, settings);
  if (selected) selectedVoiceCache.set(lang, selected);
  return selected;
}

export async function speakWithVoice4(text, lang = "de", settings = {}, isCurrent = () => true) {
  if (!text || !systemVoice4Available() || !isCurrent()) return false;
  syncVoiceEngine();
  const runSequence = voice4Sequence;
  const stillCurrent = () => runSequence === voice4Sequence && isCurrent();
  const voice = await waitForVoice4(lang, settings);
  if (!voice || !stillCurrent()) return false;

  const firstAttempt = await playVoice4Attempt(text, lang, settings, voice, stillCurrent);
  if (firstAttempt || !stillCurrent()) return firstAttempt;

  // Safari can transiently reject/interupt one speechSynthesis call while the
  // selected voice itself is still valid. Retry Voice 4 once instead of
  // immediately changing narrator to a recorded fallback. An explicit stop
  // invalidates this run sequence so the retry cannot resurrect old speech.
  // Re-resolve the narrator after the delay: Safari may have published a new
  // non-empty inventory in between, and submitting the old voice object can
  // make WebKit silently substitute its default robotic voice.
  const mayRetry = await retryDelay(stillCurrent);
  if (!mayRetry) return false;
  const retryVoice = currentVoice4ForRetry(lang, settings);
  if (!retryVoice || !stillCurrent()) return false;
  return playVoice4Attempt(text, lang, settings, retryVoice, stillCurrent);
}