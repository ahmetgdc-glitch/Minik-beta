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
test("premium natural voices outrank generic local voices", () => {
  assert.match(voice, /NATURAL_QUALITY/);
  assert.match(voice, /\? 320 : 0/);
  assert.match(voice, /v\.localService \? 35 : 0/);
  assert.match(voice, /COMPACT_QUALITY\.test\(name\) \? -180 : 0/);
});
test("child-friendly speech prosody is bounded", () => {
  assert.match(voice, /naturalRate/);
  assert.match(voice, /0\.92 : 0\.94/);
  assert.match(voice, /return 1\.02/);
  assert.match(voice, /Math\.min\(1\.08, Math\.max\(0\.82, value\)\)/);
  assert.match(voice, /Math\.min\(1\.12, Math\.max\(0\.92, value\)\)/);
});
