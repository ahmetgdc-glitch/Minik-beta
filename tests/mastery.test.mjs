import test from "node:test";
import assert from "node:assert/strict";
import { itemMastery, worldMastery } from "../src/learning/mastery.js";

const base = { settings: { lang: "de" }, mastery: {} };

test("item mastery distinguishes new, learning, practice and mastered", () => {
  assert.equal(itemMastery(base, "cat").level, "new");
  assert.equal(itemMastery({ ...base, mastery: { "de:cat": { correct: 1, wrong: 0, independent: 1 } } }, "cat").level, "learning");
  assert.equal(itemMastery({ ...base, mastery: { "de:cat": { correct: 1, wrong: 3, independent: 0 } } }, "cat").level, "practice");
  assert.equal(itemMastery({ ...base, mastery: { "de:cat": { correct: 4, wrong: 1, independent: 3 } } }, "cat").level, "mastered");
});

test("mastery is language specific", () => {
  const progress = { ...base, mastery: { "de:cat": { correct: 3, wrong: 0, independent: 3 } } };
  assert.equal(itemMastery(progress, "cat", "de").level, "mastered");
  assert.equal(itemMastery(progress, "cat", "tr").level, "new");
});

test("world mastery returns stable percentages", () => {
  const world = { items: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }] };
  const progress = {
    ...base,
    mastery: {
      "de:a": { correct: 3, wrong: 0, independent: 3 },
      "de:b": { correct: 3, wrong: 0, independent: 3 },
      "de:c": { correct: 0, wrong: 2, independent: 0 },
    },
  };
  const result = worldMastery(progress, world, "de");
  assert.equal(result.mastered, 2);
  assert.equal(result.practice, 1);
  assert.equal(result.seen, 3);
  assert.equal(result.percent, 50);
});
