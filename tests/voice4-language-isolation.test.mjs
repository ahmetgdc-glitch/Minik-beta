import test from "node:test";
import assert from "node:assert/strict";

test("iOS Voice 4 selection never crosses German and Turkish narrator languages", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const turkishVoice4 = { name: "Ses 4", voiceURI: "com.apple.voice4.tr", lang: "tr-TR" };

  globalThis.speechSynthesis = {
    getVoices: () => [turkishVoice4],
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() {},
  };
  globalThis.SpeechSynthesisUtterance = class {};
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)",
      platform: "iPhone",
      maxTouchPoints: 5,
    },
  });

  try {
    const mod = await import(`../src/audio/systemVoice4.js?language-isolation=${Date.now()}`);

    assert.equal(mod.selectVoice4([turkishVoice4], "de"), null);
    assert.equal(mod.selectVoice4([turkishVoice4], "tr"), turkishVoice4);
    assert.equal(
      mod.selectVoice4([turkishVoice4], "de", { voices: { de: turkishVoice4.voiceURI } }),
      null,
      "a stale/misconfigured saved voice must not force Turkish Voice 4 into German speech",
    );
    assert.equal(mod.hasVoice4Selection("de"), false);
    assert.equal(mod.hasVoice4Selection("tr"), true);
    assert.equal(
      mod.voice4InventoryReady("de"),
      false,
      "an opposite-language Voice 4 must be treated as a partial iOS inventory",
    );
    assert.equal(mod.voice4InventoryReady("tr"), true);
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
    if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
    else delete globalThis.navigator;
  }
});
