import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const FIXED_CLIP = "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/00000000-0000-0000-0000-000000000001.mp3";

class AutoEndingAudio {
  setAttribute() {}
  pause() {}
  load() {}
  play() {
    queueMicrotask(() => this.onended?.());
    return Promise.resolve();
  }
}

function buildVoiceHarness({
  Audio = AutoEndingAudio,
  fixedNaturalVoicePlan = () => [],
  isFixedNaturalVoiceClipUrl = () => true,
  systemVoice4Available = () => false,
  speakWithVoice4 = async () => false,
  hasVoice4Selection = () => true,
  voice4InventoryReady = () => false,
} = {}) {
  const source = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8")
    .replace(/^import .*;\n/gm, "")
    .replace(/import \{[\s\S]*?\} from "\.\/systemVoice4\.js";\n/u, "")
    .replace(/export /g, "");

  return new Function(
    "Audio",
    "fixedNaturalVoicePlan",
    "isFixedNaturalVoiceClipUrl",
    "setSpeechActive",
    "hasVoice4Selection",
    "speakWithVoice4",
    "stopSystemVoice4",
    "systemVoice4Available",
    "voice4InventoryReady",
    `${source}; return { speak };`,
  )(
    Audio,
    fixedNaturalVoicePlan,
    isFixedNaturalVoiceClipUrl,
    () => {},
    hasVoice4Selection,
    speakWithVoice4,
    () => {},
    systemVoice4Available,
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

test("fixed natural narrator wins before Voice 4 on iPhone", async () => {
  let fixedLookups = 0;
  let voice4Calls = 0;
  const api = buildVoiceHarness({
    fixedNaturalVoicePlan() {
      fixedLookups += 1;
      return [FIXED_CLIP];
    },
    systemVoice4Available: () => true,
    speakWithVoice4: async () => {
      voice4Calls += 1;
      return true;
    },
  });

  const result = await withNavigator(
    { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
    () => api.speak("Hallo", "de", { audio: true }),
  );

  assert.equal(result, true);
  assert.equal(fixedLookups, 1);
  assert.equal(voice4Calls, 0, "Voice 4 must not replace a playable fixed MINIK narrator clip");
});

test("missing iOS speech engine still plays fixed bundled narration", async () => {
  let engineChecks = 0;
  const api = buildVoiceHarness({
    fixedNaturalVoicePlan: () => [FIXED_CLIP],
    systemVoice4Available() {
      engineChecks += 1;
      return false;
    },
  });

  const result = await withNavigator(
    { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
    () => api.speak("Hallo", "de", { audio: true }),
  );

  assert.equal(result, true);
  assert.equal(engineChecks, 0, "a playable bundled narrator must finish before system speech is consulted");
});

test("unmapped text may try Voice 4 but never revives the removed personal narrator", async () => {
  let voice4Calls = 0;
  const api = buildVoiceHarness({
    fixedNaturalVoicePlan: () => [],
    systemVoice4Available: () => true,
    speakWithVoice4: async () => {
      voice4Calls += 1;
      return false;
    },
    hasVoice4Selection: () => true,
  });

  const result = await withNavigator(
    { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)", platform: "iPhone", maxTouchPoints: 5 },
    () => api.speak("Unbekannter Satz", "de", { audio: true }),
  );

  assert.equal(result, false);
  assert.equal(voice4Calls, 1);
});
