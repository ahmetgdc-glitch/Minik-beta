import test from "node:test";
import assert from "node:assert/strict";

test("iOS never submits a cached Voice 4 while Safari exposes an empty live inventory", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const voice4 = { name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" };
  let voices = [voice4];
  let speakCalls = 0;

  globalThis.speechSynthesis = {
    getVoices: () => voices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() { speakCalls += 1; },
  };
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
  });

  try {
    const mod = await import(`../src/audio/systemVoice4.js?empty-live-inventory=${Date.now()}`);
    assert.equal(mod.hasVoice4Selection("de"), true, "Voice 4 should be cached while Safari exposes it");

    voices = [];
    const played = await mod.speakWithVoice4("Hallo Mino", "de");

    assert.equal(played, false);
    assert.equal(speakCalls, 0, "Safari must not receive a stale Voice 4 object that it could replace with its default voice");
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
    else delete globalThis.navigator;
  }
});
