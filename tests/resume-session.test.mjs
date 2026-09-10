import test from "node:test";
import assert from "node:assert/strict";
import { checkpointKey, peekCheckpoint, saveCheckpoint, SESSION_CHECKPOINT_TTL_MS } from "../src/games/sessionCheckpoint.js";

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test("home-resume lookup returns the active child's fresh checkpoint", () => {
  const storage = memoryStorage();
  const now = 2_000_000;
  saveCheckpoint(storage, "child-a", { gameId:"listen", worldId:"animals", sessionId:"s1", round:2, earned:1, attempts:3, mistakes:1, played:3, activeSeconds:45, started:now-50_000 }, now);
  saveCheckpoint(storage, "child-b", { gameId:"memory", worldId:"food", sessionId:"s2", round:1, earned:0, attempts:1, mistakes:0, played:1, activeSeconds:10, started:now-15_000 }, now);
  assert.equal(peekCheckpoint(storage, "child-a", now)?.gameId, "listen");
  assert.equal(peekCheckpoint(storage, "child-b", now)?.worldId, "food");
});

test("home-resume lookup hides stale or corrupt checkpoints", () => {
  const storage = memoryStorage();
  const now = 5_000_000;
  storage.setItem(checkpointKey("child-a"), JSON.stringify({ version:1, gameId:"listen", worldId:"animals", updatedAt: now - SESSION_CHECKPOINT_TTL_MS - 1 }));
  assert.equal(peekCheckpoint(storage, "child-a", now), null);
  storage.setItem(checkpointKey("child-a"), "not-json");
  assert.equal(peekCheckpoint(storage, "child-a", now), null);
});
