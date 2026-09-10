import test from "node:test";
import assert from "node:assert/strict";
import { freshState, difficultyFor } from "../src/progress/model.js";
import { recommendedActivities } from "../src/learning/recommendations.js";
import { createBackupPayload, parseBackupPayload } from "../src/progress/backup.js";

const EARLY = new Set([
  "explore", "listen", "draw", "different", "match", "count", "sounds",
  "shadow", "missing", "memory", "opposites", "dailyorder", "socialsteps", "review", "story", "rhythm", "speak",
]);

test("young profiles are capped at two answer choices", () => {
  const p = freshState();
  p.activeProfile = { ageGroup: "2-3" };
  p.settings.adaptive = false;
  p.settings.options = 6;
  assert.equal(difficultyFor(p, "animals", "de"), 2);

  p.activeProfile.ageGroup = "4-5";
  assert.equal(difficultyFor(p, "animals", "de"), 4);

  p.activeProfile.ageGroup = "6+";
  assert.equal(difficultyFor(p, "animals", "de"), 6);
});

test("Mino learning path avoids advanced games for ages 2-3", () => {
  const p = freshState();
  p.activeProfile = { id: "kid", ageGroup: "2-3" };
  const picks = recommendedActivities(p, "de", 12);
  assert.ok(picks.length >= 3);
  assert.ok(picks.every(({ game }) => EARLY.has(game.id)));
});

test("family backup preserves age groups and defaults old backups safely", () => {
  const progress = freshState();
  const payload = createBackupPayload([
    { id: "a", name: "Ada", avatar: "🐠", ageGroup: "2-3", createdAt: 1, progress },
    { id: "b", name: "Efe", avatar: "🦁", ageGroup: "6+", createdAt: 2, progress },
  ], "a");
  const restored = parseBackupPayload(payload);
  assert.equal(restored.profiles[0].ageGroup, "2-3");
  assert.equal(restored.profiles[1].ageGroup, "6+");

  const old = parseBackupPayload({
    format: payload.format,
    version: payload.version,
    activeId: "x",
    profiles: [{ id: "x", name: "Alt", avatar: "🐰", progress }],
  });
  assert.equal(old.profiles[0].ageGroup, "4-5");
});
