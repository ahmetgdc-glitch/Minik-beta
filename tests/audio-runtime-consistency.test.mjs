import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

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

test("idle Voice 4 stop preserves the iOS gesture-prime before fallback narration", async () => {
  const voice4 = { name: "Ses 4", voiceURI: "com.apple.voice4.tr", lang: "tr-TR" };
  let cancels = 0;
  let speaks = 0;
  const synth = {
    speaking: false,
    getVoices: () => [voice4],
    addEventListener() {},
    removeEventListener() {},
    cancel() { cancels += 1; },
    speak(utterance) {
      speaks += 1;
      queueMicrotask(() => {
        synth.speaking = true;
        utterance.onstart?.();
        synth.speaking = false;
        utterance.onend?.();
      });
    },
  };
  class Utterance {
    constructor(text) { this.text = text; }
  }

  const restoreNavigator = defineGlobal("navigator", {
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X)",
    platform: "iPhone",
    maxTouchPoints: 5,
  });
  const restoreSynth = defineGlobal("speechSynthesis", synth);
  const restoreUtterance = defineGlobal("SpeechSynthesisUtterance", Utterance);

  try {
    const mod = await import(`../src/audio/systemVoice4.js?idle-prime=${Math.random()}`);
    mod.stopSystemVoice4();
    assert.equal(cancels, 0, "an idle stop must not erase Safari's gesture-prime queue");

    const played = await mod.speakWithVoice4("Oyuncak ayı nerede?", "tr");
    assert.equal(played, true);
    assert.equal(cancels, 0, "a fresh Voice 4 attempt must not cancel the preserved prime first");
    assert.equal(speaks, 1);
  } finally {
    restoreUtterance();
    restoreSynth();
    restoreNavigator();
  }
});

test("iOS speech gesture priming can re-arm after a long-lived Safari engine", async () => {
  const spoken = [];
  let now = 1_000;
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
  const previousNow = Date.now;
  Date.now = () => now;

  try {
    const mod = await import(`../src/audio/iosSpeechPrime.js?reprime=${Math.random()}`);
    assert.equal(mod.primeSystemSpeechForIOS(), true);
    assert.equal(mod.primeSystemSpeechForIOS(), true);
    assert.equal(spoken.length, 1, "rapid taps should not enqueue repeated silent utterances");

    now += 15_001;
    assert.equal(mod.primeSystemSpeechForIOS(), true);
    assert.equal(spoken.length, 2, "a later real gesture should re-arm iOS speech after idle/sleep");
  } finally {
    Date.now = previousNow;
    restoreUtterance();
    restoreSynth();
    restoreNavigator();
  }
});

test("main narration audio primes WebAudio for learning sounds even when optional SFX are off", async () => {
  const source = (await fs.readFile("src/app/useAudioPrime.js", "utf8"))
    .replace(/^import .*;\n/gm, "")
    .replace("export function", "function");
  const listeners = new Map();
  const target = {
    navigator: {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X)",
      platform: "iPhone",
      maxTouchPoints: 5,
    },
    addEventListener: (event, fn) => listeners.set(event, fn),
    removeEventListener: (event) => listeners.delete(event),
  };
  const document = {
    visibilityState: "visible",
    addEventListener: (event, fn) => listeners.set(event, fn),
    removeEventListener: (event) => listeners.delete(event),
  };
  let unlocks = 0;
  let cleanup;
  const hook = new Function(
    "useEffect",
    "useRef",
    "unlockAudio",
    "startMusic",
    "stopMusic",
    "getMusicStyle",
    "unlockVoiceAudio",
    "primeSystemSpeechForIOS",
    "window",
    "document",
    `${source}; return useAudioPrime;`,
  )(
    (effect) => { cleanup = effect(); },
    (value) => ({ current: value }),
    () => { unlocks += 1; return { state: "running" }; },
    () => {},
    () => {},
    () => "off",
    () => Promise.resolve(true),
    () => true,
    target,
    document,
  );

  hook(true, false);
  listeners.get("pointerdown")();
  assert.equal(unlocks, 1, "voice-on must also unlock WebAudio used by Geräusche/Rhythmus learning content");
  cleanup?.();
});
