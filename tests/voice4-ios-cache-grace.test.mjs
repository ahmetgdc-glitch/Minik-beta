import test from "node:test";
import assert from "node:assert/strict";

test("iOS keeps cached Voice 4 during a transient populated inventory gap", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const previousNavigator = globalThis.navigator;
  const previousNow = Date.now;
  let now = 1000;
  let voices = [{ name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" }];

  globalThis.speechSynthesis = {
    getVoices: () => voices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() {},
  };
  globalThis.SpeechSynthesisUtterance = class {};
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
  });
  Date.now = () => now;

  try {
    const mod = await import(`../src/audio/systemVoice4.js?ios-cache-grace=${Math.random()}`);
    assert.equal(mod.hasVoice4Selection("de"), true);

    voices = [{ name: "Anna", voiceURI: "com.apple.anna", lang: "de-DE" }];
    assert.equal(mod.hasVoice4Selection("de"), true, "cached Voice 4 must survive the first incomplete iOS inventory");

    now += 4999;
    assert.equal(mod.hasVoice4Selection("de"), true, "cached Voice 4 must remain sticky for the full grace window");

    now += 2;
    assert.equal(mod.hasVoice4Selection("de"), false, "confirmed long-term absence may invalidate the stale Voice 4 cache");
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
