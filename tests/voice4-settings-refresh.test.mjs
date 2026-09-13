import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("voiceschanged preserves an explicitly selected Voice 4 variant while it is live", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const previousNavigator = globalThis.navigator;
  const voiceA = { name: "Stimme 4", voiceURI: "com.apple.voice4.a", lang: "de-DE" };
  const voiceB = { name: "Siri Stimme 4", voiceURI: "com.apple.voice4.b", lang: "de-DE" };
  let voicesChanged = null;
  let spokenVoice = null;

  globalThis.speechSynthesis = {
    getVoices: () => [voiceA, voiceB],
    addEventListener(type, handler) {
      if (type === "voiceschanged") voicesChanged = handler;
    },
    removeEventListener() {},
    cancel() {},
    speak(utterance) {
      spokenVoice = utterance.voice;
      queueMicrotask(() => utterance.onend?.());
    },
  };
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
  });

  try {
    const mod = await import(`../src/audio/systemVoice4.js?saved-refresh=${Math.random()}`);
    const settings = { voices: { de: voiceB.voiceURI } };
    assert.equal(mod.hasVoice4Selection("de", settings), true);
    const playback = mod.speakWithVoice4("Hallo", "de", settings);
    voicesChanged?.();
    assert.equal(await playback, true);
    assert.equal(spokenVoice?.voiceURI, voiceB.voiceURI, "inventory refresh must not replace a saved Voice 4 variant that is still live");
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
    if (previousNavigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis, "navigator", { configurable: true, value: previousNavigator });
  }
});

test("stale saved iOS Voice 4 preference falls back to another live same-language Voice 4", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const previousNavigator = globalThis.navigator;
  const voiceA = { name: "Stimme 4", voiceURI: "com.apple.voice4.a", lang: "de-DE" };
  const voiceB = { name: "Siri Stimme 4", voiceURI: "com.apple.voice4.b", lang: "de-DE" };
  const turkishVoice4 = { name: "Ses 4", voiceURI: "com.apple.voice4.tr", lang: "tr-TR" };
  let voices = [voiceA, voiceB];

  globalThis.speechSynthesis = {
    getVoices: () => voices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() {},
  };
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
  });

  try {
    const mod = await import(`../src/audio/systemVoice4.js?saved-partial=${Math.random()}`);
    const settings = { voices: { de: voiceB.voiceURI } };
    assert.equal(mod.selectVoice4(voices, "de", settings), voiceB, "the saved Voice 4 remains first choice while available");
    assert.equal(mod.hasVoice4Selection("de", settings), true);

    voices = [voiceA];
    assert.equal(mod.selectVoice4(voices, "de", settings), voiceA, "a live German Voice 4 must beat silence when the saved variant is stale");
    assert.equal(mod.hasVoice4Selection("de", settings), true, "the same-language Voice 4 fallback must remain selectable");
    assert.equal(mod.voice4InventoryReady("de", settings), false, "readiness may still track the exact saved identity without blocking playback");

    voices = [turkishVoice4];
    assert.equal(mod.selectVoice4(voices, "de", settings), null, "German narration must never cross over to Turkish Voice 4");

    voices = [];
    assert.equal(mod.selectVoice4(voices, "de", settings), null, "an empty inventory must not invent a system voice");

    voices = [voiceA, voiceB];
    assert.equal(mod.selectVoice4(voices, "de", settings), voiceB, "the saved narrator must resume as soon as Safari exposes it again");
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
    if (previousNavigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis, "navigator", { configurable: true, value: previousNavigator });
  }
});

test("voice fallback bookkeeping passes the saved Voice 4 settings through", () => {
  const source = readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
  assert.match(source, /voice4InventoryReady\(lang, settings\)/);
});
