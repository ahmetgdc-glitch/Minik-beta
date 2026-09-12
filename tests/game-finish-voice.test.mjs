import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { personalVoiceClip } from "../src/audio/personalVoiceClips.js";

const session = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("game completion speaks a recorded Mino phrase after the done transition", () => {
  assert.match(session, /phase !== "done" \|\| !settings\.audio/);
  assert.match(session, /lang === "tr" \? "Harika!" : "Super gemacht!"/);
  assert.match(session, /speak\(finishText, lang, settings\)/);
  assert.match(session, /phaseRef\.current !== "done" \|\| document\.hidden/);
});

test("finish phrases resolve to personal recordings", () => {
  assert.ok(personalVoiceClip("Super gemacht!", "de"));
  assert.ok(personalVoiceClip("Harika!", "tr"));
});
