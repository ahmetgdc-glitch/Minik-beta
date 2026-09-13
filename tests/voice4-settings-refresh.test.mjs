import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("voiceschanged preserves an explicitly selected Voice 4 variant", async () => {
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
    assert.equal(spokenVoice?.voiceURI, voiceB.voiceURI, "inventory refresh must not replace the saved Voice 4 variant");
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
    if (previousNavigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis, "navigator", { configurable: true, value: previousNavigator });
  }
});

test("partial iOS inventory cannot replace an explicitly saved Voice 4 variant", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const previousNavigator = globalThis.navigator;
  const voiceA = { name: "Stimme 4", voiceURI: "com.apple.voice4.a", lang: "de-DE" };
  const voiceB = { name: "Siri Stimme 4", voiceURI: "com.apple.voice4.b", lang: "de-DE" };
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
    assert.equal(mod.selectVoice4(voices, "de", settings), voiceB);
    assert.equal(mod.hasVoice4Selection("de", settings), true);

    voices = [voiceA];
    assert.equal(mod.selectVoice4(voices, "de", settings), null, "another Voice 4 must not replace the saved narrator");
    assert.equal(mod.hasVoice4Selection("de", settings), false, "a partial inventory must not report the saved narrator as selectable");
    assert.equal(mod.voice4InventoryReady("de", settings), false, "partial inventory must keep personal fallback closed");

    voices = [];
    assert.equal(mod.hasVoice4Selection("de", settings), true, "the remembered saved narrator identity must survive the partial inventory");

    voices = [voiceA, voiceB];
    assert.equal(mod.selectVoice4(voices, "de", settings), voiceB, "the saved narrator must resume when Safari exposes it again");
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
    if (previousNavigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis, "navigator", { configurable: true, value: previousNavigator });
  }
});

test("voice fallback gating passes the saved Voice 4 settings through", () => {
  const source = readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
  assert.match(source, /voice4InventoryReady\(lang, settings\)/);
});
