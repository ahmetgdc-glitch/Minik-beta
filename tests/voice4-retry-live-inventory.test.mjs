import test from "node:test";
import assert from "node:assert/strict";

test("Voice 4 retry revalidates Safari inventory before speaking again", async () => {
  const speechDescriptor = Object.getOwnPropertyDescriptor(globalThis, "speechSynthesis");
  const utteranceDescriptor = Object.getOwnPropertyDescriptor(globalThis, "SpeechSynthesisUtterance");
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");

  const voice4 = { name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" };
  const anna = { name: "Anna", voiceURI: "com.apple.anna", lang: "de-DE" };
  let voices = [voice4];
  let speakCalls = 0;
  const spokenVoices = [];

  const synth = {
    getVoices: () => voices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak(utterance) {
      speakCalls += 1;
      spokenVoices.push(utterance.voice);
      if (speakCalls === 1) {
        voices = [anna];
        queueMicrotask(() => utterance.onerror?.({ error: "interrupted" }));
      } else {
        queueMicrotask(() => utterance.onend?.());
      }
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
    const mod = await import(`../src/audio/systemVoice4.js?retry-live-inventory=${Date.now()}`);
    assert.equal(await mod.speakWithVoice4("Hallo", "de"), false);
    assert.equal(speakCalls, 1, "retry must be suppressed after Voice 4 disappears from a populated Safari inventory");
    assert.deepEqual(spokenVoices, [voice4]);
  } finally {
    if (speechDescriptor) Object.defineProperty(globalThis, "speechSynthesis", speechDescriptor);
    else delete globalThis.speechSynthesis;
    if (utteranceDescriptor) Object.defineProperty(globalThis, "SpeechSynthesisUtterance", utteranceDescriptor);
    else delete globalThis.SpeechSynthesisUtterance;
    if (navigatorDescriptor) Object.defineProperty(globalThis, "navigator", navigatorDescriptor);
    else delete globalThis.navigator;
  }
});
