import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("Voice 4 absence grace is isolated per language on iOS", async () => {
  const previousSynth = globalThis.speechSynthesis;
  const previousUtterance = globalThis.SpeechSynthesisUtterance;
  const previousNavigator = globalThis.navigator;
  const previousDateNow = Date.now;
  let now = 1000;

  globalThis.speechSynthesis = {
    getVoices: () => [{ name: "Anna", voiceURI: "com.apple.anna", lang: "de-DE" }],
    addEventListener() {},
    removeEventListener() {},
    cancel() {},
    speak() {},
  };
  globalThis.SpeechSynthesisUtterance = class {};
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "iPhone", platform: "iPhone", maxTouchPoints: 5 },
  });
  Date.now = () => now;

  try {
    const mod = await import(`../src/audio/systemVoice4.js?per-language-grace=${Date.now()}`);
    assert.equal(mod.voice4InventoryReady("de"), false, "German grace should start on its first missing inventory");

    now = 7000;
    assert.equal(mod.voice4InventoryReady("tr"), false, "Turkish grace must start independently instead of inheriting German time");
    assert.equal(mod.voice4InventoryReady("de"), true, "German grace can expire without expiring Turkish grace");
    assert.match(voice, /voice4InventoryReady\(lang\)/, "caller must pass the active language into the inventory guard");
  } finally {
    Date.now = previousDateNow;
    if (previousSynth === undefined) delete globalThis.speechSynthesis;
    else globalThis.speechSynthesis = previousSynth;
    if (previousUtterance === undefined) delete globalThis.SpeechSynthesisUtterance;
    else globalThis.SpeechSynthesisUtterance = previousUtterance;
    if (previousNavigator === undefined) delete globalThis.navigator;
    else Object.defineProperty(globalThis, "navigator", { configurable: true, value: previousNavigator });
  }
});
