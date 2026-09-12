import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const profiles = fs.readFileSync(new URL("../src/parent/Profiles.jsx", import.meta.url), "utf8");

test("child profile changes stop narration, sounds and music first", () => {
  assert.match(profiles, /import \{ stopSpeech \} from "\.\.\/audio\/voice\.js";/);
  assert.match(profiles, /import \{ stopSounds, stopMusic \} from "\.\.\/audio\/sounds\.js";/);
  assert.match(profiles, /function stopProfileAudio\(\)\{stopSpeech\(\);stopSounds\(\);stopMusic\(\)\}/);

  const stopIndex = profiles.indexOf("stopProfileAudio()");
  const switchIndex = profiles.indexOf("switchProfile(id)");
  assert.ok(stopIndex >= 0 && switchIndex > stopIndex, "audio must stop before switching profiles");
});

test("creating or deleting a profile cannot inherit the previous child's audio", () => {
  assert.match(profiles, /function create\(\)\{ stopProfileAudio\(\); const id=addProfile/);
  assert.match(profiles, /onConfirm=\{\(\)=>\{ if\(deleteTarget\)\{ stopProfileAudio\(\); deleteProfile/);
});
