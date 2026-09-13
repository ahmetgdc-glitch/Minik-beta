import test from "node:test";
import assert from "node:assert/strict";

function restoreGlobal(name, descriptor) {
  if (descriptor) Object.defineProperty(globalThis, name, descriptor);
  else delete globalThis[name];
}

test("iOS never treats a populated inventory without Voice 4 as permission to change narrator", async () => {
  const synthDescriptor = Object.getOwnPropertyDescriptor(globalThis, "speechSynthesis");
  const utteranceDescriptor = Object.getOwnPropertyDescriptor(globalThis, "SpeechSynthesisUtterance");
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const originalNow = Date.now;
  let now = 100_000;
  let voices = [{ name: "Anna", voiceURI: "com.apple.anna", lang: "de-DE" }];

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15",
      platform: "iPhone",
      maxTouchPoints: 5,
    },
  });
  Object.defineProperty(globalThis, "speechSynthesis", {
    configurable: true,
    value: {
      getVoices: () => voices,
      addEventListener() {},
      removeEventListener() {},
      cancel() {},
      speak() {},
    },
  });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    configurable: true,
    value: class {},
  });
  Date.now = () => now;

  try {
    const mod = await import(`../src/audio/systemVoice4.js?ios-inventory-grace=${originalNow()}`);
    assert.equal(mod.voice4InventoryReady(), false, "first incomplete iOS inventory must keep Voice 4 sticky");

    now += 4_999;
    assert.equal(mod.voice4InventoryReady(), false, "personal fallback must stay blocked during the former grace window");

    now += 60_000;
    assert.equal(mod.voice4InventoryReady(), false, "even a long-lived iOS inventory gap must not change Mino's narrator");

    voices = [{ name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" }];
    assert.equal(mod.voice4InventoryReady(), true, "Voice 4 reappearing must immediately restore a ready inventory");

    voices = [{ name: "Anna", voiceURI: "com.apple.anna", lang: "de-DE" }];
    assert.equal(mod.voice4InventoryReady(), false, "a later transient gap must keep the same narrator policy");

    now += 120_000;
    assert.equal(mod.voice4InventoryReady(), false, "iOS must remain Voice 4-only after repeated long inventory gaps");
  } finally {
    Date.now = originalNow;
    restoreGlobal("speechSynthesis", synthDescriptor);
    restoreGlobal("SpeechSynthesisUtterance", utteranceDescriptor);
    restoreGlobal("navigator", navigatorDescriptor);
  }
});

test("non-iOS environments do not delay a genuinely missing Voice 4 fallback", async () => {
  const synthDescriptor = Object.getOwnPropertyDescriptor(globalThis, "speechSynthesis");
  const utteranceDescriptor = Object.getOwnPropertyDescriptor(globalThis, "SpeechSynthesisUtterance");
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent: "Mozilla/5.0 (X11; Linux x86_64)", platform: "Linux x86_64", maxTouchPoints: 0 },
  });
  Object.defineProperty(globalThis, "speechSynthesis", {
    configurable: true,
    value: {
      getVoices: () => [{ name: "Anna", voiceURI: "desktop.anna", lang: "de-DE" }],
      addEventListener() {},
      removeEventListener() {},
      cancel() {},
      speak() {},
    },
  });
  Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
    configurable: true,
    value: class {},
  });

  try {
    const mod = await import(`../src/audio/systemVoice4.js?desktop-inventory=${Date.now()}`);
    assert.equal(mod.voice4InventoryReady(), true);
  } finally {
    restoreGlobal("speechSynthesis", synthDescriptor);
    restoreGlobal("SpeechSynthesisUtterance", utteranceDescriptor);
    restoreGlobal("navigator", navigatorDescriptor);
  }
});
