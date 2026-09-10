import test from "node:test";
import assert from "node:assert/strict";
import { weeklyActivity, strongestLearningWorld } from "../src/learning/analytics.js";

test("weekly activity ignores old data and aggregates recent sessions", () => {
  const now = new Date(2026, 8, 10, 12, 0, 0);
  const today = new Date(2026, 8, 10, 10, 0, 0).getTime();
  const yesterday = new Date(2026, 8, 9, 10, 0, 0).getTime();
  const old = new Date(2026, 7, 1, 10, 0, 0).getTime();
  const summary = weeklyActivity({
    history: [
      { at: today, correct: true },
      { at: today, correct: false },
      { at: yesterday, correct: true },
      { at: old, correct: true },
    ],
    sessions: [
      { ended: today, seconds: 125, completed: true },
      { ended: yesterday, seconds: 60, completed: false },
      { ended: old, seconds: 999, completed: true },
    ],
  }, now);
  assert.equal(summary.answers, 3);
  assert.equal(summary.correct, 2);
  assert.equal(summary.accuracy, 67);
  assert.equal(summary.seconds, 185);
  assert.equal(summary.minutes, 3);
  assert.equal(summary.completed, 1);
  assert.equal(summary.activeDays, 2);
  assert.equal(summary.days.length, 7);
});

test("strongest learning world needs practice and prefers accuracy", () => {
  const worlds = [{ id: "animals" }, { id: "food" }, { id: "colors" }];
  const result = strongestLearningWorld({ worlds: {
    "de:animals": { answers: 10, correct: 8 },
    "de:food": { answers: 5, correct: 5 },
    "de:colors": { answers: 2, correct: 2 },
  }}, worlds, "de");
  assert.equal(result.world.id, "food");
  assert.equal(result.accuracy, 100);
});
