import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  checkpointDifficulty,
  loadCheckpoint,
  saveCheckpoint,
} from "../src/games/sessionCheckpoint.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test("resumed sessions preserve the exact answer-count difficulty", () => {
  const storage = memoryStorage();
  const now = 1_900_000_000_000;
  saveCheckpoint(storage, "child", {
    gameId: "listen",
    worldId: "animals",
    played: 2,
    difficulty: 4,
  }, now);
  const restored = loadCheckpoint(storage, "child", "listen", "animals", now);
  assert.equal(restored.difficulty, 4);
  assert.equal(checkpointDifficulty(restored, 2, 6), 4);
});

test("resume difficulty never exceeds the active child's age cap", () => {
  assert.equal(checkpointDifficulty({ difficulty: 6 }, 4, 2), 2);
  assert.equal(checkpointDifficulty({ difficulty: 6 }, 2, 4), 4);
  assert.equal(checkpointDifficulty({ difficulty: 3 }, 4, 6), 4);
  assert.equal(checkpointDifficulty(null, 6, 6), 6);
});

test("home resume card rechecks difficulty-setting changes after checkpoint cleanup", () => {
  const home = fs.readFileSync(new URL("../src/app/Home.jsx", import.meta.url), "utf8");
  assert.match(home, /progress\.settings\.adaptive,/);
  assert.match(home, /progress\.settings\.options,/);
});
