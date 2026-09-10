import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/app/CrashBoundary.jsx", import.meta.url), "utf8");

test("crash recovery is bilingual and announces an urgent recovery state", () => {
  assert.match(source, /MINIK braucht kurz Hilfe/);
  assert.match(source, /MINIK'in kısa bir yardıma ihtiyacı var/);
  assert.match(source, /aria-live="assertive"/);
  assert.match(source, /document\.documentElement.*lang/);
});

test("crash recovery immediately stops speech and WebAudio", () => {
  assert.match(source, /stopSpeech\(\)/);
  assert.match(source, /stopSounds\(\)/);
  assert.match(source, /componentDidCatch/);
});
