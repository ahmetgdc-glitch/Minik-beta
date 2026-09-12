import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const session = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");
const personal = fs.readFileSync(new URL("../src/audio/personalVoiceClips.js", import.meta.url), "utf8");

test("game completion speaks a recorded Mino phrase after the done transition", () => {
  assert.match(session, /phase !== "done" \|\| !settings\.audio/);
  assert.match(session, /lang === "tr" \? "Harika!" : "Super gemacht!"/);
  assert.match(session, /speak\(finishText, lang, settings\)/);
  assert.match(session, /phaseRef\.current !== "done" \|\| document\.hidden/);
});

test("finish phrases exist in the personal recording catalog", () => {
  assert.match(personal, /Super gemacht!/);
  assert.match(personal, /Harika!/);
});
