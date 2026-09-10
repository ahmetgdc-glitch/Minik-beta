import test from "node:test";
import assert from "node:assert/strict";
import {
  freshState,
  migrate,
  normalizeState,
  reduceProgress,
  difficultyFor,
} from "../src/progress/model.js";
const answer = (eventId, extra = {}) => ({
  type: "answer",
  eventId,
  worldId: "animals",
  gameId: "listen",
  lang: "de",
  itemIds: ["animals.lion"],
  correct: true,
  at: 100,
  day: "2026-09-09",
  ...extra,
});
test("a repeated click cannot award a second star", () => {
  let s = reduceProgress(freshState(), answer("one"));
  s = reduceProgress(s, answer("one"));
  assert.equal(s.stars, 1);
  assert.equal(s.answers, 1);
});
test("wrong attempts never remove existing stars or give new stars", () => {
  let s = reduceProgress(freshState(), answer("a"));
  s = reduceProgress(s, answer("b", { correct: false }));
  assert.equal(s.stars, 1);
  assert.equal(s.xp, 10);
  assert.equal(s.streak, 0);
  assert.equal(s.mastery["de:animals.lion"].wrong, 1);
});
test("helped answers do not count as independent mastery", () => {
  let s = reduceProgress(freshState(), answer("a", { assisted: true }));
  assert.equal(s.stars, 1);
  assert.equal(s.mastery["de:animals.lion"].independent, 0);
  assert.deepEqual(s.worlds["de:animals"].recent, [false]);
});
test("mastery and adaptive difficulty are separate by language", () => {
  let s = freshState();
  for (let i = 0; i < 12; i++) s = reduceProgress(s, answer(String(i)));
  assert.equal(difficultyFor(s, "animals", "de"), 6);
  assert.equal(difficultyFor(s, "animals", "tr"), 2);
  s = reduceProgress(s, answer("tr", { lang: "tr" }));
  assert.equal(s.mastery["tr:animals.lion"].correct, 1);
  assert.equal(s.mastery["de:animals.lion"].correct, 12);
});
test("recent errors reduce difficulty again", () => {
  let s = freshState();
  for (let i = 0; i < 12; i++) s = reduceProgress(s, answer(String(i)));
  for (let i = 12; i < 18; i++)
    s = reduceProgress(s, answer(String(i), { hadErrors: true }));
  assert.equal(difficultyFor(s, "animals", "de"), 2);
});
test("fixed 2/4/6 choice settings override adaptive mode", () => {
  let s = freshState();
  s.settings = { ...s.settings, adaptive: false, options: 4 };
  assert.equal(difficultyFor(s, "animals"), 4);
});
test("repeated mistakes lower difficulty even when no answer is solved", () => {
  let s = freshState();
  for (let i = 0; i < 12; i++) s = reduceProgress(s, answer(`ok-${i}`));
  for (let i = 0; i < 6; i++)
    s = reduceProgress(s, answer(`wrong-${i}`, { correct: false }));
  assert.equal(difficultyFor(s, "animals"), 2);
  assert.equal(s.stars, 12);
});
test("new calendar day resets the daily mission", () => {
  let s = reduceProgress(freshState(), answer("a"));
  s = reduceProgress(s, answer("b", { day: "2026-09-10" }));
  assert.equal(s.daily.correct, 1);
  assert.equal(s.stars, 2);
});
test("treasures require enough stars and can be claimed once", () => {
  const r = { id: "shell", stars: 5 };
  let s = reduceProgress(freshState(), { type: "claim", reward: r });
  assert.deepEqual(s.inventory, []);
  s.stars = 5;
  s = reduceProgress(s, { type: "claim", reward: r });
  s = reduceProgress(s, { type: "claim", reward: r });
  assert.deepEqual(s.inventory, ["shell"]);
  assert.equal(s.stars, 5);
  assert.deepEqual(s.equipped, ["shell"]);
});
test("unknown rewards cannot be equipped", () => {
  const s = reduceProgress(freshState(), { type: "equip", id: "castle" });
  assert.deepEqual(s.equipped, []);
});
test("session summaries survive reload and cannot duplicate", () => {
  let s = freshState();
  const now = Date.now();
  const action = {
    type: "session",
    session: {
      id: "abc",
      worldId: "animals",
      gameId: "listen",
      lang: "de",
      started: now - 30_000,
      ended: now,
      seconds: 30,
      rounds: 3,
      attempts: 4,
      completed: true,
    },
  };
  s = reduceProgress(s, action);
  s = reduceProgress(s, action);
  const loaded = normalizeState(JSON.parse(JSON.stringify(s)));
  assert.equal(loaded.sessions.length, 1);
  assert.equal(loaded.worlds["de:animals"].sessions, 1);
});
test("old starter stars and language migrate without loss", () => {
  const values = { minik_stars: "27", minik_lang: "tr", minik_streak: "4" };
  const s = migrate({ getItem: (k) => values[k] ?? null });
  assert.equal(s.stars, 27);
  assert.equal(s.settings.lang, "tr");
  assert.equal(s.streak, 4);
});
test("old legacy project data migrates", () => {
  const old = {
    stars: 15,
    settings: { lang: "tr", difficulty: 6, voiceRate: 0.8 },
  };
  const s = migrate({
    getItem: (k) => (k === "minik_state_v2" ? JSON.stringify(old) : null),
  });
  assert.equal(s.stars, 15);
  assert.equal(s.settings.options, 6);
  assert.equal(s.settings.rate, 0.8);
});
test("corrupt or disabled storage cannot crash app initialization", () => {
  assert.equal(migrate({ getItem: () => "{broken" }).stars, 0);
  assert.equal(
    migrate({
      getItem: () => {
        throw Error("blocked");
      },
    }).stars,
    0,
  );
  assert.equal(
    normalizeState({
      version: 3,
      stars: -99,
      settings: { lang: "xx", options: 99 },
    }).settings.lang,
    "de",
  );
});
test("progress reset retains preferences", () => {
  let s = freshState();
  s.settings.lang = "tr";
  s.stars = 20;
  s.inventory = ["shell"];
  s = reduceProgress(s, { type: "reset" });
  assert.equal(s.settings.lang, "tr");
  assert.equal(s.stars, 0);
  assert.deepEqual(s.inventory, []);
});
