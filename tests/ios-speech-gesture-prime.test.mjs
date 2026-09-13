import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

function defineGlobal(name, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, {
    configurable: true,
    writable: true,
    value,
  });
  return () => {
    if (previous) Object.defineProperty(globalThis, name, previous);
    else delete globalThis[name];
  };
}

test("iOS primes speech synthesis synchronously with one silent utterance", async () => {
  const spoken = [];
  class Utterance {
    constructor(text) {
      this.text = text;
      this.volume = 1;
      this.rate = 1;
    }
  }
  const synth = { speak: (utterance) => spoken.push(utterance) };
  const restoreNavigator = defineGlobal("navigator", {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X)",
    platform: "iPhone",
    maxTouchPoints: 5,
  });
  const restoreSynth = defineGlobal("speechSynthesis", synth);
  const restoreUtterance = defineGlobal("SpeechSynthesisUtterance", Utterance);

  try {
    const mod = await import(`../src/audio/iosSpeechPrime.js?prime=${Math.random()}`);
    assert.equal(mod.systemSpeechGesturePrimed(), false);
    assert.equal(mod.primeSystemSpeechForIOS(), true);
    assert.equal(mod.systemSpeechGesturePrimed(), true);
    assert.equal(spoken.length, 1);
    assert.equal(spoken[0].text, " ");
    assert.equal(spoken[0].volume, 0);
    assert.equal(spoken[0].rate, 10);

    assert.equal(mod.primeSystemSpeechForIOS(), true);
    assert.equal(spoken.length, 1, "the same Safari speech engine is primed only once");
  } finally {
    restoreUtterance();
    restoreSynth();
    restoreNavigator();
  }
});

test("audio prime invokes iOS speech priming before async audio unlock work", () => {
  const source = read("src/app/useAudioPrime.js");
  const speechPrime = source.indexOf("primeSystemSpeechForIOS();");
  const webAudioPrime = source.indexOf("const context = unlockAudio();");
  const recordedPrime = source.indexOf("unlockVoiceAudio().then");
  assert.ok(speechPrime >= 0);
  assert.ok(webAudioPrime > speechPrime);
  assert.ok(recordedPrime > speechPrime);
});
