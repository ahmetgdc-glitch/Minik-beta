import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("active game checkpoints its state on a real Safari page exit", () => {
  assert.match(source, /addEventListener\("pagehide",\s*onPageHide\)/);
  assert.match(source, /const onPageHide[\s\S]*persistCheckpoint\(\)/);
  assert.match(source, /if \(!event\.persisted\) saveSession\(false\)/);
  assert.match(source, /removeEventListener\("pagehide",\s*onPageHide\)/);
  assert.match(source, /\[persistCheckpoint, saveSession\]/);
});

test("Safari BFCache does not falsely finalize a live game", () => {
  assert.match(source, /addEventListener\("pageshow",\s*onPageShow\)/);
  assert.match(source, /if \(!event\.persisted \|\| manualPauseRef\.current \|\| !lifecyclePauseRef\.current\) return/);
  assert.match(source, /setPaused\(false\)/);
  assert.match(source, /unlockAudio\(\)/);
  assert.match(source, /removeEventListener\("pageshow",\s*onPageShow\)/);
});

test("backgrounding stops speech and WebAudio immediately", () => {
  assert.match(source, /document\.hidden[\s\S]*stopSpeech\(\)[\s\S]*stopSounds\(\)/);
});
