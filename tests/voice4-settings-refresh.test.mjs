import test from "node:test";
import assert from "node:assert/strict";

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

    // Register the observer without replacing the already selected voice.
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
