import test from "node:test";
import assert from "node:assert/strict";

function makeSynth(getVoices) {
  return {
    getVoices,
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() {},
  };
}

test("Voice 4 never reuses a cached voice object from a replaced Safari speech engine", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const firstVoice = { name: "Stimme 4", voiceURI: "com.apple.voice4.old", lang: "de-DE" };
  const secondVoice = { name: "Stimme 4", voiceURI: "com.apple.voice4.new", lang: "de-DE" };
  let secondVoices = [];

  try {
    globalThis.SpeechSynthesisUtterance = class {};
    globalThis.speechSynthesis = makeSynth(() => [firstVoice]);

    const mod = await import(`../src/audio/systemVoice4.js?engine-replacement=${Date.now()}`);
    assert.equal(mod.hasVoice4Selection("de"), true);

    globalThis.speechSynthesis = makeSynth(() => secondVoices);
    assert.equal(
      mod.hasVoice4Selection("de"),
      false,
      "a new Safari engine with an unresolved inventory must not inherit the old engine's Voice 4 object",
    );
    assert.equal(
      mod.voice4InventoryReady(),
      false,
      "an empty replacement-engine inventory must remain unresolved rather than enabling recorded fallback",
    );

    secondVoices = [secondVoice];
    assert.equal(mod.hasVoice4Selection("de"), true, "Voice 4 should be selected again from the replacement engine");
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
  }
});
