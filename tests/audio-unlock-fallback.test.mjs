import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

function voiceHarness(Audio, systemVoice4Available) {
  const source = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8")
    .replace(/^import .*;\n/gm, "")
    .replace(/import \{[\s\S]*?\} from "\.\/systemVoice4\.js";\n/u, "")
    .replace(/export /g, "");

  return new Function(
    "Audio",
    "naturalVoicePlan",
    "personalVoiceClip",
    "setSpeechActive",
    "hasVoice4Selection",
    "speakWithVoice4",
    "stopSystemVoice4",
    "systemVoice4Available",
    "voice4InventoryReady",
    `${source}; return { unlockVoiceAudio };`,
  )(
    Audio,
    () => [],
    () => "",
    () => {},
    () => false,
    async () => false,
    () => {},
    systemVoice4Available,
    () => true,
  );
}

test("failed media unlock is not reported ready just because Voice 4 exists", async () => {
  class Audio {
    setAttribute() {}
    pause() {}
    play() { return Promise.reject(new Error("NotAllowedError")); }
  }

  const api = voiceHarness(Audio, () => true);
  assert.equal(await api.unlockVoiceAudio(), false);
});

test("successful media unlock is still accepted", async () => {
  class Audio {
    setAttribute() {}
    pause() {}
    play() { return Promise.resolve(); }
  }

  const api = voiceHarness(Audio, () => true);
  assert.equal(await api.unlockVoiceAudio(), true);
});

test("background resume rearms both WebAudio and voice media unlock", () => {
  const source = fs.readFileSync(new URL("../src/app/useAudioPrime.js", import.meta.url), "utf8");
  assert.match(
    source,
    /const resumeAfterBackground = \(\) => \{[\s\S]*webAudioReady = false;\s*voiceReady = false;[\s\S]*addEventListener\("pointerdown", prime, true\)/,
  );
});
