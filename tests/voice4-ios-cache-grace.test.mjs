import test from "node:test";
import assert from "node:assert/strict";

test("iOS preserves Voice 4 identity without submitting a stale voice object", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const previousNavigator = globalThis.navigator;
  const previousNow = Date.now;
  let now = 1000;
  const voice4 = { name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" };
  let voices = [voice4];

  const synth = {
    getVoices: () => voices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() {},
  };
  globalThis.speechSynthesis = synth;
  globalThis.SpeechSynthesisUtterance = class {};
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
  });
  Date.now = () => now;

  try {
    const mod = await import(`../src/audio/systemVoice4.js?ios-cache-sticky=${Math.random()}`);
    assert.equal(mod.hasVoice4Selection("de"), true);

    voices = [{ name: "Anna", voiceURI: "com.apple.anna", lang: "de-DE" }];
    assert.equal(
      mod.hasVoice4Selection("de"),
      false,
      "a populated iOS inventory without Voice 4 must not expose the stale cached object for playback",
    );

    now += 30000;
    assert.equal(
      mod.hasVoice4Selection("de"),
      false,
      "a long incomplete iOS inventory must remain silent instead of falling through to a default system voice",
    );

    voices = [voice4];
    assert.equal(
      mod.hasVoice4Selection("de"),
      true,
      "the remembered Voice 4 identity should become usable again when Safari republishes it",
    );

    voices = [{ name: "Anna", voiceURI: "com.apple.anna", lang: "de-DE" }];
    globalThis.speechSynthesis = {
      getVoices: () => voices,
      addEventListener() {},
      removeEventListener() {},
      cancel() {},
      speak() {},
    };
    assert.equal(mod.hasVoice4Selection("de"), false, "a real speechSynthesis engine replacement may reset the stale Voice 4 identity");
  } finally {
    Date.now = previousNow;
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
    if (previousNavigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis, "navigator", { configurable: true, value: previousNavigator });
  }
});
