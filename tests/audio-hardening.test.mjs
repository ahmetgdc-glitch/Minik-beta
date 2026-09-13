import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
const systemVoice4 = fs.readFileSync(new URL("../src/audio/systemVoice4.js", import.meta.url), "utf8");

test("MINIK prefers iOS Voice 4 before recorded fallback", () => {
  const systemIndex = voice.indexOf("speakWithVoice4(");
  const personalIndex = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(systemIndex > 0);
  assert.ok(personalIndex > systemIndex);
});

test("Voice 4 selector never falls back to arbitrary robotic system voices", () => {
  assert.match(systemVoice4, /VOICE4_RE/);
  assert.match(systemVoice4, /SIRI_RE/);
  assert.match(systemVoice4, /const available = \(voices \|\| \[\]\)\.filter\(isVoice4Candidate\)/);
  assert.match(systemVoice4, /eligible\.find\(\(voice\) => VOICE4_RE/);
  assert.match(systemVoice4, /eligible\.find\(\(voice\) => SIRI_RE/);
  assert.doesNotMatch(systemVoice4, /voice\?\.default/);
  assert.doesNotMatch(systemVoice4, /voice\?\.localService/);
  assert.doesNotMatch(systemVoice4, /sameLanguage\[0\]|voices\[0\]|available\[0\]|eligible\[0\]/);
});

test("iOS Voice 4 remains language-scoped while non-iOS can retain legacy candidate fallback", () => {
  assert.match(systemVoice4, /const sameLanguage = available\.filter\(\(voice\) => matchesLanguage\(voice, lang\)\)/);
  assert.match(systemVoice4, /const eligible = isIOSSpeechEnvironment\(\) \? sameLanguage : available/);
  assert.match(systemVoice4, /sameLanguage\.find\(\(voice\) => VOICE4_RE/);
  assert.match(systemVoice4, /sameLanguage\.find\(\(voice\) => SIRI_RE/);
  assert.match(systemVoice4, /eligible\.find\(\(voice\) => VOICE4_RE/);
  assert.match(systemVoice4, /eligible\.find\(\(voice\) => SIRI_RE/);
});

test("Voice 4 waits long enough for Safari and caches the selected narrator", () => {
  assert.match(systemVoice4, /FIRST_VOICE_WAIT_MS = 1600/);
  assert.match(systemVoice4, /RETRY_VOICE_WAIT_MS = 700/);
  assert.match(systemVoice4, /voiceschanged/);
  assert.match(systemVoice4, /selectedVoiceCache/);
  assert.match(systemVoice4, /pendingVoiceLookup/);
  assert.match(systemVoice4, /const finalVoice = selectVoice4\(refreshVoiceCache\(\), lang, settings\)/);
});

test("an unresolved Safari voice inventory cannot permanently silence MINIK", () => {
  const inventoryCheck = voice.indexOf("if (voice4InventoryReady(lang, settings)) {");
  const personalIndex = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(inventoryCheck > 0);
  assert.ok(personalIndex > inventoryCheck);
  assert.doesNotMatch(voice, /if \(!voice4InventoryReady\(lang, settings\)\) return false;/);
  assert.match(systemVoice4, /export function voice4InventoryReady\(lang = "de", settings = \{\}\)/);
  assert.match(systemVoice4, /if \(!voices\.length\) \{/);
  assert.match(systemVoice4, /IOS_ABSENCE_GRACE_MS = 5000/);
});

test("Voice 4 retries a transient Safari playback failure once", () => {
  assert.match(systemVoice4, /PLAYBACK_RETRY_MS = 90/);
  assert.match(systemVoice4, /const firstAttempt = await playVoice4Attempt/);
  assert.match(systemVoice4, /const mayRetry = await retryDelay\(stillCurrent\)/);
  assert.match(systemVoice4, /const retryVoice = currentVoice4ForRetry\(lang, settings\)/);
  assert.match(systemVoice4, /if \(!retryVoice \|\| !stillCurrent\(\)\) return false/);
  assert.match(systemVoice4, /return playVoice4Attempt\(text, lang, settings, retryVoice, stillCurrent\)/);
});

test("a known Voice 4 falls back to bundled audio after runtime playback failure", () => {
  const stickyIndex = voice.indexOf("if (hasVoice4Selection(lang, settings)) {");
  const personalIndex = voice.indexOf("const personalClip = personalVoiceClip(text, lang)");
  assert.ok(stickyIndex > 0);
  assert.ok(personalIndex > stickyIndex);
  assert.match(voice, /if \(hasVoice4Selection\(lang, settings\)\) \{\s*markVoice4Established\(lang\);\s*\}/s);
  assert.doesNotMatch(voice, /if \(hasVoice4Selection\(lang, settings\)\) \{\s*markVoice4Established\(lang\);\s*return false;/s);
  assert.match(systemVoice4, /export function hasVoice4Selection/);
});

test("Voice 4 cache survives unknown Safari inventory but invalidates against a populated changed inventory", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  let voices = [{ name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" }];
  globalThis.speechSynthesis = {
    getVoices: () => voices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() {},
  };
  globalThis.SpeechSynthesisUtterance = class {};

  try {
    const mod = await import(`../src/audio/systemVoice4.js?cache-lifecycle=${Date.now()}`);
    assert.equal(mod.hasVoice4Selection("de"), true);

    voices = [];
    assert.equal(mod.hasVoice4Selection("de"), true, "empty Safari inventory must preserve the known narrator");

    voices = [{ name: "Anna", voiceURI: "com.apple.anna", lang: "de-DE" }];
    assert.equal(mod.hasVoice4Selection("de"), false, "populated inventory without Voice 4 must invalidate stale cache");
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
  }
});

test("Voice 4 cache resets when Safari speech synthesis disappears and returns", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const oldVoice4 = { name: "Stimme 4", voiceURI: "com.apple.voice4.old", lang: "de-DE" };
  const replacementVoice4 = { name: "Stimme 4", voiceURI: "com.apple.voice4.new", lang: "de-DE" };
  let synth = {
    getVoices: () => [oldVoice4],
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() {},
  };
  Object.defineProperty(globalThis, "speechSynthesis", { configurable: true, get: () => synth });
  globalThis.SpeechSynthesisUtterance = class {};

  try {
    const mod = await import(`../src/audio/systemVoice4.js?engine-gap=${Date.now()}`);
    assert.equal(mod.hasVoice4Selection("de"), true);

    synth = null;
    assert.equal(mod.systemVoice4Available(), false);
    assert.equal(mod.hasVoice4Selection("de"), false, "missing engine must clear the old Voice 4 cache");

    synth = {
      getVoices: () => [replacementVoice4],
      addEventListener() {},
      removeEventListener() {},
      cancel() {},
      speak() {},
    };
    assert.equal(mod.hasVoice4Selection("de"), true, "returning Safari engine must select its own Voice 4");
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else Object.defineProperty(globalThis, "speechSynthesis", { configurable: true, writable: true, value: previousSynth });
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
  }
});

test("Voice 4 playback has a bounded Safari watchdog", async () => {
  const mod = await import(`../src/audio/systemVoice4.js?watchdog=${Date.now()}`);
  assert.equal(mod.voice4PlaybackWatchdogMs("Hi"), 5000);
  assert.equal(mod.voice4PlaybackWatchdogMs("x".repeat(1000)), 18000);
  assert.match(systemVoice4, /watchdog = setTimeout\(\(\) => finish\(false\), voice4PlaybackWatchdogMs\(text\)\)/);
});

test("stopping Voice 4 resolves a Safari utterance that never emits end or error", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const voice4 = { name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" };
  let markStarted;
  const started = new Promise((resolve) => { markStarted = resolve; });
  globalThis.speechSynthesis = {
    getVoices: () => [voice4],
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() { markStarted(); },
  };
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };

  try {
    const mod = await import(`../src/audio/systemVoice4.js?stalled-stop=${Date.now()}`);
    const pending = mod.speakWithVoice4("Hallo Mino", "de");
    await Promise.race([
      started,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Voice 4 attempt did not start")), 250)),
    ]);
    mod.stopSystemVoice4();
    const result = await Promise.race([
      pending,
      new Promise((_, reject) => setTimeout(() => reject(new Error("stalled Voice 4 did not resolve on stop")), 250)),
    ]);
    assert.equal(result, false);
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
  }
});

test("speech keeps stale-playback and cancellation guards", () => {
  assert.match(voice, /token === sequence/);
  assert.match(voice, /stopSystemVoice4\(\)/);
  assert.match(systemVoice4, /synth\.cancel\(\)/);
  assert.match(systemVoice4, /activeAttemptFinish/);
  assert.match(systemVoice4, /voice4Sequence \+= 1/);
  assert.match(systemVoice4, /runSequence === voice4Sequence && isCurrent\(\)/);
});

test("recorded fallback still uses one lazy media player", () => {
  assert.match(voice, /voicePlayer = new Audio\(\)/);
  assert.match(voice, /voicePlayer\.preload = "none"/);
});
