import test from "node:test";
import assert from "node:assert/strict";

test("Voice 4 stop cancels the original Safari speech engine after replacement", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const voice4 = { name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" };
  let synth = null;
  let oldCancelCount = 0;
  let newCancelCount = 0;
  let markStarted;
  const started = new Promise((resolve) => { markStarted = resolve; });

  const oldSynth = {
    getVoices: () => [voice4],
    addEventListener() {},
    removeEventListener() {},
    cancel() { oldCancelCount += 1; },
    speak() { markStarted(); },
  };
  const newSynth = {
    getVoices: () => [voice4],
    addEventListener() {},
    removeEventListener() {},
    cancel() { newCancelCount += 1; },
    speak() {},
  };
  synth = oldSynth;
  Object.defineProperty(globalThis, "speechSynthesis", { configurable: true, get: () => synth });
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; }
  };

  try {
    const mod = await import(`../src/audio/systemVoice4.js?engine-cancel=${Date.now()}`);
    const pending = mod.speakWithVoice4("Hallo Mino", "de");
    await Promise.race([
      started,
      new Promise((_, reject) => setTimeout(() => reject(new Error("old Safari engine did not start Voice 4")), 250)),
    ]);

    synth = newSynth;
    mod.stopSystemVoice4();

    const result = await Promise.race([
      pending,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Voice 4 did not resolve after engine replacement stop")), 250)),
    ]);
    assert.equal(result, false);
    assert.ok(oldCancelCount >= 2, "the original engine must be cancelled after replacement");
    assert.ok(newCancelCount >= 1, "the current engine should also be cleared to prevent queued speech");
  } finally {
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else Object.defineProperty(globalThis, "speechSynthesis", { configurable: true, writable: true, value: previousSynth });
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
  }
});
