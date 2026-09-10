import test from "node:test";
import assert from "node:assert/strict";
import { reviewItems } from "../src/learning/review.js";

const items = Array.from({ length: 8 }, (_, i) => ({ id: `x${i + 1}` }));
const base = { settings: { lang: "de" }, mastery: {} };

test("review prioritizes items that need practice", () => {
  const progress = {
    ...base,
    mastery: {
      "de:x1": { correct: 1, wrong: 4, independent: 0, lastSeen: 1000 },
      "de:x2": { correct: 4, wrong: 0, independent: 3, lastSeen: 1000 },
      "de:x3": { correct: 1, wrong: 2, independent: 0, lastSeen: 1000 },
    },
  };
  const result = reviewItems(progress, items, "de", 1000);
  assert.equal(result[0].id, "x1");
  assert(result.slice(0, 3).some((x) => x.id === "x3"));
});

test("review remains language specific", () => {
  const progress = {
    ...base,
    mastery: {
      "de:x1": { correct: 1, wrong: 5, independent: 0, lastSeen: 1000 },
      "tr:x2": { correct: 1, wrong: 5, independent: 0, lastSeen: 1000 },
    },
  };
  assert.equal(reviewItems(progress, items, "de", 1000)[0].id, "x1");
  assert.equal(reviewItems(progress, items, "tr", 1000)[0].id, "x2");
});

test("review still returns enough material when everything is mastered", () => {
  const mastery = Object.fromEntries(items.map((x) => [`de:${x.id}`, { correct: 4, wrong: 0, independent: 3, lastSeen: 1000 }]));
  const result = reviewItems({ ...base, mastery }, items, "de", 1000);
  assert.equal(result.length, 8);
});
