import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fixedNaturalVoicePlan } from "../src/audio/fixedNaturalVoicePlans.js";

const session = fs.readFileSync("src/games/GameSession.jsx", "utf8");

test("the finish screen celebrates Mino's session completion aloud", () => {
  assert.match(session, /<section className="session-finish">/);
  assert.match(session, /const celebration = completionCelebration\(lang, lastPraiseRef\.current\);/);
  assert.match(session, /speak\(celebration, lang, settings\);/);
  assert.match(session, /if \(phase !== "done" \|\| paused \|\| settings\.audio === false\) return;/);
  assert.match(session, /if \(finishSpokeRef\.current\) return;/);
  assert.match(session, /finishSpokeRef\.current = true;/);
  // The celebration must run only after the done transition has stopped the
  // final round's praise, otherwise it would double up.
  const doneStart = session.indexOf("if (round + 1 >= totalRounds)");
  const transitionStop = session.indexOf("stopSpeech();", doneStart);
  const celebration = session.indexOf("speak(celebration, lang, settings);");
  assert.ok(
    transitionStop >= 0 && transitionStop < celebration,
    "the done transition must stop the last round's speech before the celebration",
  );
});

test("the celebration skips the praise that just concluded the last round", () => {
  assert.match(session, /lastPraiseRef\.current = text;/);
  assert.match(session, /lines\.find\(\(text\) => text !== lastPraise\) \|\| lines\[0\];/);
  // The per-round rotation uses the praise list, the finish celebration offers
  // a distinct alternate in each language.
  assert.match(session, /de: \["Super gemacht!", "Wunderbar!", "Das hast du toll gemacht!"\]/);
  assert.match(session, /tr: \["Harika!", "Çok güzel yaptın!"\]/);
  assert.match(session, /\? \["Çok güzel yaptın!", "Harika!"\]\s*:\s*\["Das hast du toll gemacht!"/);
});

test("every celebration line is a recorded fixed clip in its language", () => {
  const deLines = ["Das hast du toll gemacht!", "Super gemacht!", "Wunderbar!"];
  const trLines = ["Çok güzel yaptın!", "Harika!"];
  for (const line of deLines) {
    assert.ok(fixedNaturalVoicePlan(line, "de").length >= 1, `${line} must be a fixed DE clip`);
  }
  for (const line of trLines) {
    assert.ok(fixedNaturalVoicePlan(line, "tr").length >= 1, `${line} must be a fixed TR clip`);
  }
});