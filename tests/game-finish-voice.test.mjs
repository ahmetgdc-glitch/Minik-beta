import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { personalVoiceClip } from "../src/audio/personalVoiceClips.js";
import { fixedNaturalVoicePlan } from "../src/audio/fixedNaturalVoicePlans.js";

const session = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("game completion speaks exactly one recorded Mino phrase after the done transition", () => {
  assert.match(session, /phase !== "done" \|\| paused \|\| settings\.audio === false/);
  assert.match(session, /const celebration = completionCelebration\(lang, lastPraiseRef\.current\);/);
  assert.match(session, /speak\(celebration, lang, settings\);/);
  assert.match(session, /phaseRef\.current !== "done" \|\| document\.hidden/);
  assert.equal(session.split("speak(celebration, lang, settings)").length - 1, 1);
});

test("finish phrases resolve to personal recordings as well as fixed clips", () => {
  assert.ok(personalVoiceClip("Super gemacht!", "de"));
  assert.ok(personalVoiceClip("Harika!", "tr"));
  assert.ok(personalVoiceClip("Das hast du toll gemacht!", "de"));
  assert.ok(personalVoiceClip("Çok güzel yaptın!", "tr"));
  assert.ok(fixedNaturalVoicePlan("Das hast du toll gemacht!", "de").length >= 1);
  assert.ok(fixedNaturalVoicePlan("Çok güzel yaptın!", "tr").length >= 1);
});