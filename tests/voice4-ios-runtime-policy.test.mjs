import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function buildVoiceHarness({
  personalVoiceClip,
  systemVoice4Available,
  speakWithVoice4 = async () => false,
  hasVoice4Selection = () => true,
  voice4InventoryReady = () => false,
} = {}) {
  const source = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8")
    .replace(/^import .*;\n/gm, "")
    .replace(/import \{[\s\S]*?\} from "\.\/systemVoice4\.js";\n/u, "")
    .replace(/export /g, "");

  return new Function(
    "naturalVoicePlan",
    "personalVoiceClip",
    "setSpeechActive",
    "hasVoice4Selection",
    "speakWithVoice4",
    "stopSystemVoice4",
    "systemVoice4Available",
    "voice4InventoryReady",
    `${source}; return { speak };`,
  )(
    () => [],
    personalVoiceClip || (() => ""),
    () => {},
    hasVoice4Selection,
    speakWithVoice4,
    () => {},
    systemVoice4Available || (() => false),
    voice4InventoryReady,
  );
}

async function withNavigator(value, run) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value,
  });
  try {
    return await run();
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "navigator", descriptor);
    else delete globalThis.navigator;
  }
}

test("failed Voice 4 playback on iPhone reaches bundled narrator lookup", async () => {
  let personalLookups = 0;
  const api = buildVoiceHarness({
    personalVoiceClip() {
      personalLookups += 1;
      return "personal.mp3";
    },
    systemVoice4Available: () => true,
    speakWithVoice4: async () => false,
    hasVoice4Selection: () => true,
  });

  const result = await withNavigator(
    { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
    () => api.speak("Hallo", "de", { audio: true }),
  );

  assert.equal(result, false);
  assert.equal(personalLookups, 1, "iOS must keep an audible bundled fallback reachable after Voice 4 fails");
});

test("missing iOS speech engine still reaches bundled narrator lookup", async () => {
  let personalLookups = 0;
  const api = buildVoiceHarness({
    personalVoiceClip() {
      personalLookups += 1;
      return "";
    },
    systemVoice4Available: () => false,
    hasVoice4Selection: () => false,
  });

  const result = await withNavigator(
    { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
    () => api.speak("Hallo", "de", { audio: true }),
  );

  assert.equal(result, false);
  assert.equal(personalLookups, 1, "complete speech engine loss must keep the bundled emergency path reachable");
});
