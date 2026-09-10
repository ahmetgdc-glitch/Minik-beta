let voices = [],
  settle = null,
  current = null,
  cloudPlayer = null,
  cloudAbort = null,
  sequence = 0;
const subs = new Set();
const synth = () =>
  typeof window !== "undefined" ? window.speechSynthesis : null;
export function refreshVoices() {
  voices = synth()?.getVoices?.() || [];
  subs.forEach((fn) => fn());
  return voices;
}
export function getVoices(lang) {
  return voices
    .filter((v) => v.lang?.toLowerCase().startsWith(lang))
    .sort((a, b) => voiceScore(b) - voiceScore(a));
}
function voiceScore(v) {
  const name = v.name || "";
  return (
    (v.localService ? 120 : 0) +
    (/premium|enhanced|natural|neural|siri/i.test(name) ? 60 : 0) +
    (/anna|petra|markus|viktor|yelda|cem|emel/i.test(name) ? 18 : 0) +
    (/compact/i.test(name) ? -20 : 0)
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
  cloudPlayer = null;
  current = null;
  settle?.(false);
  settle = null;
}
export function speak(text, lang = "de", settings = {}) {
  stopSpeech();
  const engine = synth();
  if (!text || settings.audio === false || !engine)
    return Promise.resolve(false);
  refreshVoices();
  const token = sequence;
  return new Promise((resolve) => {
    let finished = false;
    const u = new SpeechSynthesisUtterance(text);
    current = u;
    u.lang = lang === "tr" ? "tr-TR" : "de-DE";
    u.rate = settings.rate ?? (lang === "tr" ? 0.86 : 0.9);
    u.pitch = settings.pitch ?? 1;
    u.volume = 1;
    const voice = chooseVoice(lang, settings.voices?.[lang]);
    if (voice) u.voice = voice;
    // iOS/Safari can occasionally omit onend/onerror. Never leave game logic
    // waiting forever: use a generous watchdog based on utterance length.
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
      // A stale paused synth state is common after app/background transitions.
      engine.resume?.();
      engine.speak(u);
    } catch {
      finish(false);
    }
  });
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
