import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/games/SpeakGame.jsx", import.meta.url), "utf8");

test("SpeakGame stops Mino narration before starting speech recognition", () => {
  const stopIndex = source.indexOf("stopSpeech();");
  const startIndex = source.indexOf("rec.start()");
  assert.ok(stopIndex > 0, "SpeakGame must stop active narration before listening");
  assert.ok(startIndex > stopIndex, "speech recognition must start only after narration is stopped");
});

test("SpeakGame cannot replay Voice 4 while the microphone is listening", () => {
  assert.match(source, /if \(paused \|\| blocked \|\| listening\) return;/);
  assert.match(source, /className="speak-repeat"[^>]*disabled=\{listening \|\| paused \|\| blocked\}/s);
});
