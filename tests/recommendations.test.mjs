import test from "node:test";
import assert from "node:assert/strict";
import { freshState, reduceProgress } from "../src/progress/model.js";
import { recommendedActivities } from "../src/learning/recommendations.js";
import { worlds } from "../src/data/content.js";

test("learning path always returns playable, varied activities", () => {
  const p = freshState();
  const recs = recommendedActivities(p, "de", 3);
  assert.equal(recs.length, 3);
  assert.equal(new Set(recs.map((r) => r.world.id)).size, 3);
  assert.equal(new Set(recs.map((r) => r.game.id)).size, 3);
  assert(recs.every((r) => r.game.allWorlds || r.game.worlds.includes(r.world.id)));
});

test("a struggling practiced world is promoted into the learning path", () => {
  let p = freshState();
  for (let i = 0; i < 8; i++) {
    p = reduceProgress(p, {
      type: "answer",
      eventId: `weak-${i}`,
      worldId: "food",
      gameId: "listen",
      lang: "de",
      itemIds: ["food.apple"],
      correct: i < 2,
      at: i + 1,
      day: "2026-09-10",
    });
  }
  const recs = recommendedActivities(p, "de", 3);
  assert(recs.some((r) => r.world.id === "food" && r.reason === "practice"));
});

test("recommendations are language-specific", () => {
  let p = freshState();
  for (let i = 0; i < 8; i++) {
    p = reduceProgress(p, {
      type: "answer",
      eventId: `tr-${i}`,
      worldId: "animals",
      gameId: "listen",
      lang: "tr",
      itemIds: ["animals.lion"],
      correct: false,
      at: i + 1,
      day: "2026-09-10",
    });
  }
  assert.equal(recommendedActivities(p, "tr", 1)[0].world.id, "animals");
  assert.notEqual(recommendedActivities(p, "de", 1)[0].reason, "practice");
});


test("due spaced-repetition material is promoted and uses review", () => {
  const p = freshState();
  const now = Date.now();
  const world = worlds[4];
  const item = world.items[0];
  p.mastery[`de:${item.id}`] = { correct: 3, wrong: 0, independent: 3, lastSeen: now - 4 * 86400000 };
  const first = recommendedActivities(p, "de", 1)[0];
  assert.equal(first.world.id, world.id);
  assert.equal(first.game.id, "review");
  assert.equal(first.reason, "due");
});
