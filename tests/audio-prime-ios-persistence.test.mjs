import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const hook = fs.readFileSync(new URL("../src/app/useAudioPrime.js", import.meta.url), "utf8");

test("iOS keeps voice priming retryable after an apparently successful unlock", () => {
  assert.match(hook, /const ios = \/iPad\|iPhone\|iPod\/iu\.test\(ua\)/);
  assert.match(hook, /if \(!ios && webAudioReady && voiceReady\) cleanupGestureListeners\(\)/);
  assert.match(hook, /voiceReady = false;/);
  assert.match(hook, /window\.addEventListener\("pointerdown", prime, true\)/);
  assert.match(hook, /window\.addEventListener\("touchstart", prime, true\)/);
});
