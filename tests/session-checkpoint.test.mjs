import test from "node:test";
import assert from "node:assert/strict";
import {
  SESSION_CHECKPOINT_TTL_MS,
  checkpointKey,
  loadCheckpoint,
  saveCheckpoint,
  clearCheckpoint,
  checkpointMatchesProfile,
} from "../src/games/sessionCheckpoint.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (k) => data.has(k) ? data.get(k) : null,
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    data,
  };
}

test("active game checkpoint round-trips per child profile", () => {
  const storage = memoryStorage();
  const now = 1_800_000_000_000;
  assert.equal(saveCheckpoint(storage, "child-a", {
    gameId: "listen", worldId: "animals", sessionId: "session-1",
    round: 3, earned: 2, attempts: 5, mistakes: 1, hint: 2, played: 5, phase: "success",
    activeSeconds: 42, started: now - 50_000,
  }, now), true);
  const restored = loadCheckpoint(storage, "child-a", "listen", "animals", now + 1000);
  assert.equal(restored.round, 3);
  assert.equal(restored.earned, 2);
  assert.equal(restored.attempts, 5);
  assert.equal(restored.hint, 2);
  assert.equal(restored.phase, "success");
  assert.equal(restored.sessionId, "session-1");
  assert.equal(loadCheckpoint(storage, "child-b", "listen", "animals", now + 1000), null);
});

test("stale and route-mismatched checkpoints are ignored", () => {
  const storage = memoryStorage();
  const now = 1_800_000_000_000;
  saveCheckpoint(storage, "child", { gameId: "memory", worldId: "food", updatedAt: now }, now);
  assert.equal(loadCheckpoint(storage, "child", "listen", "food", now), null);
  assert.equal(loadCheckpoint(storage, "child", "memory", "food", now + SESSION_CHECKPOINT_TTL_MS + 1), null);
});

test("checkpoint values are bounded and can be cleared", () => {
  const storage = memoryStorage();
  const now = 1_800_000_000_000;
  saveCheckpoint(storage, "child", {
    gameId: "count", worldId: "numbers", round: -8, earned: 99999,
    attempts: -3, mistakes: 999, hint: 99, played: 99999, activeSeconds: 999999,
  }, now);
  const restored = loadCheckpoint(storage, "child", "count", "numbers", now);
  assert.equal(restored.round, 0);
  assert.equal(restored.earned, 999);
  assert.equal(restored.attempts, 0);
  assert.equal(restored.mistakes, 99);
  assert.equal(restored.hint, 3);
  assert.equal(restored.activeSeconds, 86400);
  assert.equal(clearCheckpoint(storage, "child"), true);
  assert.equal(storage.getItem(checkpointKey("child")), null);
});


test("checkpoint phase prevents a solved round from reopening as active", () => {
  const storage = memoryStorage();
  const now = 1_800_000_000_000;
  saveCheckpoint(storage, "child", {
    gameId: "listen", worldId: "animals", round: 2, earned: 3,
    attempts: 4, played: 4, phase: "success",
  }, now);
  const restored = loadCheckpoint(storage, "child", "listen", "animals", now + 500);
  assert.equal(restored.phase, "success");
  assert.equal(restored.round, 2);
  assert.equal(restored.earned, 3);
});

test("legacy and invalid checkpoint phases safely resume as active", () => {
  const storage = memoryStorage();
  const now = 1_800_000_000_000;
  saveCheckpoint(storage, "child", {
    gameId: "count", worldId: "numbers", phase: "corrupt",
  }, now);
  const restored = loadCheckpoint(storage, "child", "count", "numbers", now);
  assert.equal(restored.phase, "active");
});

// Storage hygiene: deleted/reset/restored profiles must not leave resumable game ghosts.
test("multiple profile checkpoints can be cleared safely without duplicate work", async () => {
  const { clearCheckpoints } = await import("../src/games/sessionCheckpoint.js");
  const storage = memoryStorage();
  const now = Date.now();
  saveCheckpoint(storage, "child-a", { gameId:"listen", worldId:"animals" }, now);
  saveCheckpoint(storage, "child-b", { gameId:"memory", worldId:"colors" }, now);
  assert.equal(clearCheckpoints(storage, ["child-a", "child-a", "child-b", ""]), true);
  assert.equal(storage.getItem(checkpointKey("child-a")), null);
  assert.equal(storage.getItem(checkpointKey("child-b")), null);
});


test("new checkpoints keep language and age context without breaking legacy saves", () => {
  const storage = memoryStorage();
  const now = 1_800_000_000_000;
  saveCheckpoint(storage, "child", {
    gameId: "listen", worldId: "animals", lang: "tr", ageGroup: "2-3", played: 1,
  }, now);
  const saved = loadCheckpoint(storage, "child", "listen", "animals", now);
  assert.equal(saved.lang, "tr");
  assert.equal(saved.ageGroup, "2-3");
  assert.equal(checkpointMatchesProfile(saved, "tr", "2-3"), true);
  assert.equal(checkpointMatchesProfile(saved, "de", "2-3"), false);
  assert.equal(checkpointMatchesProfile(saved, "tr", "4-5"), false);
  assert.equal(checkpointMatchesProfile({ ...saved, lang: null, ageGroup: null }, "de", "6+"), true);
});


test("checkpoint timestamps cannot poison session analytics", () => {
  const storage = memoryStorage();
  const now = 1_800_000_000_000;
  saveCheckpoint(storage, "child", {
    gameId: "listen", worldId: "animals", started: now + 60 * 60 * 1000, played: 1,
  }, now);
  const future = loadCheckpoint(storage, "child", "listen", "animals", now);
  assert.equal(future.started, now);

  saveCheckpoint(storage, "child", {
    gameId: "listen", worldId: "animals", started: -12345, played: 1,
  }, now);
  const invalid = loadCheckpoint(storage, "child", "listen", "animals", now);
  assert.equal(invalid.started, now);
});

test("checkpoint storage helpers report unavailable storage honestly", () => {
  const now = 1_800_000_000_000;
  assert.equal(saveCheckpoint(null, "child", { gameId: "listen", worldId: "animals" }, now), false);
  assert.equal(clearCheckpoint(null, "child"), false);
});
