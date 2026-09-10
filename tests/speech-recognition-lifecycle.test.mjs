import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/games/SpeakGame.jsx", import.meta.url), "utf8");

test("speech recognition detaches WebKit callbacks before app-driven aborts", () => {
  assert.match(source, /const rec = recognitionRef\.current;[\s\S]*recognitionRef\.current = null;/);
  for (const handler of ["onstart", "onend", "onerror", "onresult"]) {
    assert.match(source, new RegExp(`rec\\.${handler} = null`));
  }
  assert.match(source, /rec\.abort\?\.\(\)/);
});

test("stale recognition events cannot mutate a later round", () => {
  assert.match(source, /rec\.onstart = \(\) => \{[\s\S]*recognitionRef\.current === rec/);
  assert.match(source, /rec\.onend = \(\) => \{[\s\S]*recognitionRef\.current !== rec/);
  assert.match(source, /rec\.onerror = \(event\) => \{[\s\S]*recognitionRef\.current !== rec/);
  assert.match(source, /rec\.onresult = \(event\) => \{[\s\S]*recognitionRef\.current !== rec/);
});

test("one final recognition result closes the recognizer before scoring", () => {
  assert.match(source, /rec\.onresult = \(event\) => \{[\s\S]*stopRecognition\(\);[\s\S]*onSolve/);
  assert.match(source, /String\(event\?\.error \|\| ""\)\.toLowerCase\(\) === "aborted"/);
});
