import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function restoreGlobal(name, descriptor) {
  if (descriptor) Object.defineProperty(globalThis, name, descriptor);
  else delete globalThis[name];
}

test("iOS Voice 4 cache honors a changed explicit narrator preference", async () => {
  const synthDescriptor = Object.getOwnPropertyDescriptor(globalThis, "speechSynthesis");
  const utteranceDescriptor = Object.getOwnPropertyDescriptor(globalThis, "SpeechSynthesisUtterance");
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const voiceA = { name: "Stimme 4 A", voiceURI: "voice-a", lang: "de-DE" };
  const voiceB = { name: "Stimme 4 B", voiceURI: "voice-b", lang: "de-DE" };
  const spoken = [];

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "Mozilla/5.0 (iPhone)", platform: "iPhone", maxTouchPoints: 5 },
  });
  Object.defineProperty(globalThis, "speechSynthesis", {
    configurable: true,
    value: {
      getVoices: () => [voiceA, voiceB],
      addEventListener() {},
      removeEventListener() {},
      cancel() {},
      speak(utterance) {
        spoken.push(utterance.voice?.voiceURI);
        queueMicrotask(() => utterance.onend?.());
      },
    },
  });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    configurable: true,
    value: class {
      constructor(text) { this.text = text; }
    },
  });

  try {
    const mod = await import(`../src/audio/systemVoice4.js?preference-cache=${Date.now()}`);
    assert.equal(
      await mod.speakWithVoice4("Hallo", "de", { voices: { de: "voice-a" } }),
      true,
    );
    assert.equal(
      await mod.speakWithVoice4("Nochmal", "de", { voices: { de: "voice-b" } }),
      true,
    );
    assert.deepEqual(spoken, ["voice-a", "voice-b"]);
  } finally {
    restoreGlobal("speechSynthesis", synthDescriptor);
    restoreGlobal("SpeechSynthesisUtterance", utteranceDescriptor);
    restoreGlobal("navigator", navigatorDescriptor);
  }
});

test("pending Voice 4 lookups are isolated by explicit narrator preference", () => {
  const source = fs.readFileSync(new URL("../src/audio/systemVoice4.js", import.meta.url), "utf8");
  assert.match(source, /const lookupKey = voiceLookupKey\(lang, settings\)/);
  assert.match(source, /pendingVoiceLookup\.has\(lookupKey\)/);
  assert.match(source, /pendingVoiceLookup\.set\(lookupKey, pending\)/);
  assert.match(source, /pendingVoiceLookup\.delete\(lookupKey\)/);
});
