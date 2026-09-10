import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
test("speech synthesis has an iOS watchdog", () => {
  assert.match(voice, /timeoutMs/);
  assert.match(voice, /setTimeout\(\(\) => finish\(false\), timeoutMs\)/);
});
test("speech synthesis resumes after background transitions", () => {
  assert.match(voice, /engine\.resume\?\.\(\)/);
});
test("stale speech cannot resolve as a successful current utterance", () => {
  assert.match(voice, /token === sequence/);
  assert.match(voice, /finished/);
});
