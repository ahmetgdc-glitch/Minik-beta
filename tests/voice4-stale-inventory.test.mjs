import test from "node:test";
import assert from "node:assert/strict";

test("iOS never submits a stale Voice 4 object when Safari exposes a populated inventory without it", async () => {
  const speechDescriptor = Object.getOwnPropertyDescriptor(globalThis, "speechSynthesis");
  const utteranceDescriptor = Object.getOwnPropertyDescriptor(globalThis, "SpeechSynthesisUtterance");
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");

  const voice4 = { name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" };
  const anna = { name: "Anna", voiceURI: "com.apple.anna", lang: "de-DE" };
  let voices = [voice4];
  let voicesChanged = null;
  const spokenVoices = [];

  const synth = {
    getVoices: () => voices,
    addEventListener(type, listener) {
      if (type === "voiceschanged") voicesChanged = listener;
    },
    removeEventListener() {},
    cancel() {},
    speak(utterance) {
      spokenVoices.push(utterance.voice);
      queueMicrotask(() => utterance.onend?.());
    },
  };

  Object.defineProperty(globalThis, "speechSynthesis", {
    configurable: true,
    writable: true,
    value: synth,
  });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    configurable: true,
    writable: true,
    value: class {
      constructor(text) {
        this.text = text;
      }
    },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      platform: "iPhone",
      maxTouchPoints: 5,
    },
  });

  try {
    const mod = await import(`../src/audio/systemVoice4.js?stale-ios-inventory=${Date.now()}`);

    assert.equal(await mod.speakWithVoice4("Hallo", "de"), true);
    assert.deepEqual(spokenVoices, [voice4]);

    voices = [anna];
    voicesChanged?.();

    assert.equal(mod.hasVoice4Selection("de"), false);
    assert.equal(await mod.speakWithVoice4("Noch einmal", "de"), false);
    assert.deepEqual(
      spokenVoices,
      [voice4],
      "Safari must not receive the stale Voice 4 object because it may replace it with the default voice",
    );
  } finally {
    if (speechDescriptor) Object.defineProperty(globalThis, "speechSynthesis", speechDescriptor);
    else delete globalThis.speechSynthesis;
    if (utteranceDescriptor) Object.defineProperty(globalThis, "SpeechSynthesisUtterance", utteranceDescriptor);
    else delete globalThis.SpeechSynthesisUtterance;
    if (navigatorDescriptor) Object.defineProperty(globalThis, "navigator", navigatorDescriptor);
    else delete globalThis.navigator;
  }
});
