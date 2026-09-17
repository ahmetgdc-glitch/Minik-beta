import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const hook = fs.readFileSync(new URL("../src/app/useAudioPrime.js", import.meta.url), "utf8");

test("iOS keeps voice priming retryable without reusing the recorded narrator player on every tap", () => {
  assert.match(hook, /let voiceReady = false/);
  assert.match(hook, /let lastPrimeAt = 0/);
  assert.match(hook, /const PRIME_DEDUP_MS = 120/);
  assert.match(hook, /if \(lastPrimeAt && now - lastPrimeAt < PRIME_DEDUP_MS\) return/);
  assert.match(hook, /if \(wantsVoice && !voiceReady\)/);
  assert.doesNotMatch(hook, /!voiceReady \|\| ios/);
  assert.match(hook, /voiceReady \|\|= ok/);
  assert.match(hook, /document\.visibilityState === "visible"\)[\s\S]*voiceReady = false[\s\S]*lastPrimeAt = 0/);
  assert.match(hook, /window\.addEventListener\("pointerdown", prime, true\)/);
  assert.match(hook, /window\.addEventListener\("touchstart", prime, true\)/);
  // Both event families stay available for Safari compatibility, but the same
  // physical tap is deduplicated before it can touch the shared narrator player.
  assert.doesNotMatch(hook, /cleanupGestureListeners/);
});
