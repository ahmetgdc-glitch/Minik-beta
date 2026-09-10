import test from "node:test";
import assert from "node:assert/strict";
import { freshState } from "../src/progress/model.js";
import { reviewInterval, nextReviewAt, isReviewDue, dueItems } from "../src/learning/schedule.js";

const HOUR = 3600000;
const DAY = 24 * HOUR;

test("review intervals widen as independent mastery grows", () => {
  const p = freshState();
  p.mastery["de:cat"] = { correct: 3, wrong: 0, independent: 3, lastSeen: 1000 };
  assert.equal(reviewInterval(p, "cat", "de"), 3 * DAY);
  p.mastery["de:cat"].independent = 5;
  assert.equal(reviewInterval(p, "cat", "de"), 7 * DAY);
  p.mastery["de:cat"].independent = 8;
  assert.equal(reviewInterval(p, "cat", "de"), 14 * DAY);
});

test("weak terms return sooner than mastered terms", () => {
  const p = freshState();
  p.mastery["de:cat"] = { correct: 1, wrong: 3, independent: 0, lastSeen: 1000 };
  assert.equal(reviewInterval(p, "cat", "de"), 4 * HOUR);
  assert.equal(nextReviewAt(p, "cat", "de"), 1000 + 4 * HOUR);
});

test("due state is language specific", () => {
  const p = freshState();
  const now = 10 * DAY;
  p.mastery["de:cat"] = { correct: 3, wrong: 0, independent: 3, lastSeen: DAY };
  p.mastery["tr:cat"] = { correct: 3, wrong: 0, independent: 3, lastSeen: 9 * DAY };
  assert.equal(isReviewDue(p, "cat", "de", now), true);
  assert.equal(isReviewDue(p, "cat", "tr", now), false);
});

test("dueItems returns only practiced terms that are actually due", () => {
  const p = freshState();
  const now = 10 * DAY;
  p.mastery["de:cat"] = { correct: 1, wrong: 2, independent: 0, lastSeen: DAY };
  p.mastery["de:dog"] = { correct: 2, wrong: 0, independent: 1, lastSeen: 9.8 * DAY };
  const items = [{id:"cat"},{id:"dog"},{id:"bird"}];
  assert.deepEqual(dueItems(p, items, "de", now).map(x=>x.id), ["cat"]);
});
