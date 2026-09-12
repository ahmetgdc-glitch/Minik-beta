const VOICE4_RE = /(?:^|\b)(?:stimme\s*4|voice\s*4)(?:\b|$)/iu;
const SIRI_RE = /(?:^|\b)siri(?:\b|$)/iu;

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

export function selectVoice4(voices, lang, settings = {}) {
  const sameLanguage = (voices || []).filter((voice) => matchesLanguage(voice, lang));
  if (!sameLanguage.length) return null;

  const saved = String(settings?.voices?.[lang] || "").trim().toLowerCase();
  if (saved) {
    const exact = sameLanguage.find((voice) =>
      [voice?.name, voice?.voiceURI].some(
        (value) => String(value || "").trim().toLowerCase() === saved,
      ),
    );
    if (exact && isVoice4Candidate(exact)) return exact;
  }

  // Prefer the exact Voice 4 label. Siri-labelled voices are accepted only as
  // the secondary high-quality Apple candidate. Never choose default/local/first.
  return (
    sameLanguage.find((voice) => VOICE4_RE.test(voiceIdentity(voice))) ||
    sameLanguage.find((voice) => SIRI_RE.test(voiceIdentity(voice))) ||
    null
  );
}

async function waitForVoice4(lang, settings, timeoutMs = 350) {
  let selected = selectVoice4(exposedSystemVoices(), lang, settings);
  if (selected || !systemVoice4Available()) return selected;

  const synth = engine();
  if (!synth || typeof synth.addEventListener !== "function") return null;

  selected = await new Promise((resolve) => {
    let finished = false;
    const finish = (voice) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      synth.removeEventListener?.("voiceschanged", onVoicesChanged);
      resolve(voice || null);
    };
    const onVoicesChanged = () => {
      const voice = selectVoice4(exposedSystemVoices(), lang, settings);
      if (voice) finish(voice);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    synth.addEventListener("voiceschanged", onVoicesChanged);
    onVoicesChanged();
  });

  return selected;
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

export async function speakWithVoice4(text, lang = "de", settings = {}, isCurrent = () => true) {
  if (!text || !systemVoice4Available() || !isCurrent()) return false;
  const synth = engine();
  const Utterance = UtteranceClass();
  const voice = await waitForVoice4(lang, settings);
  if (!voice || !isCurrent()) return false;

  try {
    const utterance = new Utterance(text);
    utterance.lang = lang === "tr" ? "tr-TR" : "de-DE";
    utterance.voice = voice;
    utterance.rate = minoRate(settings);
    utterance.pitch = minoPitch(settings);
    utterance.volume = 1;
    activeUtterance = utterance;

    return await new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        utterance.onend = null;
        utterance.onerror = null;
        if (activeUtterance === utterance) activeUtterance = null;
        resolve(Boolean(ok && isCurrent()));
      };
      utterance.onend = () => finish(true);
      utterance.onerror = () => finish(false);
      try {
        synth.cancel();
        synth.speak(utterance);
      } catch {
        finish(false);
      }
    });
  } catch {
    return false;
  }
}
