import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { shouldBlockGameInteraction } from "../src/games/inputGuard.js";

test("game interaction guard blocks every paused or non-active lifecycle state", () => {
  assert.equal(shouldBlockGameInteraction(), false);
  for (const state of [
    { locked: true },
    { paused: true },
    { manualPaused: true },
    { lifecyclePaused: true },
    { hidden: true },
    { phase: "success" },
    { phase: "demo" },
    { phase: "done" },
  ]) {
    assert.equal(shouldBlockGameInteraction(state), true, JSON.stringify(state));
  }
});

test("GameSession applies the synchronous guard to answer, help and replay controls", () => {
  const source = fs.readFileSync("src/games/GameSession.jsx", "utf8");
  assert.match(source, /const interactionBlocked = useCallback/);
  assert.ok((source.match(/if \(interactionBlocked\(\)\) return;/g) || []).length >= 4);
  assert.match(source, /disabled=\{paused \|\| phase !== "active"\}/);
  assert.match(source, /inert=\{paused \|\| phase !== "active" \? true : undefined\}/);
});

test("manual pause stops audio and checkpoints synchronously before React commits", () => {
  const source = fs.readFileSync("src/games/GameSession.jsx", "utf8");
  assert.match(source, /const pauseManually = useCallback\(\(\) => \{[\s\S]*manualPauseRef\.current = true;[\s\S]*stopSpeech\(\);[\s\S]*stopSounds\(\);[\s\S]*persistCheckpoint\(\);/);
  assert.ok((source.match(/onClick=\{pauseManually\}/g) || []).length >= 2);
});
