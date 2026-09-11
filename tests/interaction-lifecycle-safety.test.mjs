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

test("GameSession applies and forwards the synchronous lifecycle guard", () => {
  const source = fs.readFileSync("src/games/GameSession.jsx", "utf8");
  assert.match(source, /const interactionBlocked = useCallback/);
  assert.ok((source.match(/if \(interactionBlocked\(\)\) return;/g) || []).length >= 4);
  assert.match(source, /interactionBlocked=\{interactionBlocked\}/);
  assert.match(source, /disabled=\{paused \|\| phase !== "active"\}/);
  assert.match(source, /inert=\{paused \|\| phase !== "active" \? true : undefined\}/);
});

test("game header separates real back navigation from pause", () => {
  const source = fs.readFileSync("src/games/GameSession.jsx", "utf8");
  assert.match(source, /className="icon-button game-back-button"[\s\S]*onClick=\{exit\}[\s\S]*Zurück zur Lernwelt/);
  assert.match(source, /className="icon-button pause-button"[\s\S]*onClick=\{pauseManually\}/);
  assert.equal((source.match(/onClick=\{pauseManually\}/g) || []).length, 1);
});

test("manual pause stops audio and checkpoints synchronously before React commits", () => {
  const source = fs.readFileSync("src/games/GameSession.jsx", "utf8");
  assert.match(source, /const pauseManually = useCallback\(\(\) => \{[\s\S]*manualPauseRef\.current = true;[\s\S]*stopSpeech\(\);[\s\S]*stopSounds\(\);[\s\S]*persistCheckpoint\(\);/);
  assert.match(source, /onClick=\{pauseManually\}/);
});
