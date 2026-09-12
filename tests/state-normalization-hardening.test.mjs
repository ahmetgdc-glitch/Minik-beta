import test from "node:test";
import assert from "node:assert/strict";
import {
  MAX_EVENT_IDS,
  MAX_MASTERY_ENTRIES,
  MAX_REWARD_IDS,
  MAX_WORLD_PROGRESS_ENTRIES,
  normalizeState,
} from "../src/progress/model.js";

test("corrupt persisted settings cannot turn string booleans into enabled features", () => {
  const state = normalizeState({
    version: 3,
    settings: {
      lang: "tr",
      audio: "false",
      sfx: 0,
      autoHelp: "yes",
      photos: null,
      adaptive: {},
      reducedMotion: "true",
      voices: { de: 42, tr: "voice-tr" },
    },
  });
  assert.equal(state.settings.lang, "tr");
  assert.equal(state.settings.audio, true);
  assert.equal(state.settings.systemVoiceFallback, false);
  assert.equal(state.settings.sfx, true);
  assert.equal(state.settings.autoHelp, true);
  assert.equal(state.settings.photos, true);
  assert.equal(state.settings.adaptive, true);
  assert.equal(state.settings.reducedMotion, false);
  assert.equal(state.settings.voices.de, "");
  assert.equal(state.settings.voices.tr, "voice-tr");
});

test("device voice fallback stays off unless a parent explicitly enables it", () => {
  assert.equal(normalizeState({ version: 3 }).settings.systemVoiceFallback, false);
  assert.equal(
    normalizeState({ version: 3, settings: { systemVoiceFallback: "true" } }).settings
      .systemVoiceFallback,
    false,
  );
  assert.equal(
    normalizeState({ version: 3, settings: { systemVoiceFallback: true } }).settings
      .systemVoiceFallback,
    true,
  );
});

test("corrupt world and mastery counters are normalized before future arithmetic", () => {
  const state = normalizeState({
    version: 3,
    worlds: {
      "de:animals": { answers: "7", correct: -3, sessions: "2", recent: [1, 0, "x"] },
      bad: null,
    },
    mastery: {
      "de:cat": { correct: "4", wrong: -8, independent: "3", lastSeen: "not-a-date" },
    },
    events: ["evt-1", null, 42, ""],
    inventory: ["hat", "hat", null],
    equipped: ["hat", "hat", 12],
    history: [{ at: 1 }, null, "bad"],
    sessions: [{ id: "s1" }, false, "bad"],
  });
  assert.deepEqual(state.worlds["de:animals"], {
    answers: 7,
    correct: 0,
    sessions: 2,
    recent: [true, false],
  });
  assert.equal(state.mastery["de:cat"].correct, 4);
  assert.equal(state.mastery["de:cat"].wrong, 0);
  assert.equal(state.mastery["de:cat"].independent, 3);
  assert.equal("lastSeen" in state.mastery["de:cat"], false);
  assert.deepEqual(state.events, ["evt-1"]);
  assert.deepEqual(state.inventory, ["hat"]);
  assert.deepEqual(state.equipped, ["hat"]);
  assert.equal(state.history.length, 0);
  assert.equal(state.sessions.length, 0);
});

test("history and session records are normalized before parent analytics renders them", () => {
  const now = Date.now();
  const state = normalizeState({
    version: 3,
    answers: 2,
    correct: 99,
    streak: 7,
    bestStreak: 2,
    history: [
      {
        at: now - 1000,
        worldId: "animals",
        gameId: "listen",
        lang: "de",
        correct: true,
        clean: true,
        itemIds: ["animals.cat", "animals.cat", 12],
      },
      { at: now + 3 * 24 * 60 * 60 * 1000, worldId: "animals", gameId: "listen", lang: "de" },
    ],
    sessions: [
      {
        id: "same",
        worldId: "animals",
        gameId: "listen",
        lang: "de",
        started: now - 60_000,
        ended: now - 10_000,
        seconds: 999999,
        rounds: 5000,
        attempts: 50000,
        completed: 1,
      },
      {
        id: "same",
        worldId: "animals",
        gameId: "memory",
        lang: "de",
        started: now - 50_000,
        ended: now,
        seconds: 50,
        rounds: 4,
        attempts: 6,
        completed: false,
      },
      { id: "broken", worldId: "animals" },
    ],
  });

  assert.equal(state.correct, 2);
  assert.equal(state.bestStreak, 7);
  assert.deepEqual(state.history[0].itemIds, ["animals.cat"]);
  assert.equal(state.history.length, 1);
  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].gameId, "memory");
  assert.equal(state.sessions[0].completed, false);
  assert.equal(state.sessions[0].seconds, 50);
});

test("mastery and equipment cannot claim impossible persisted state", () => {
  const now = Date.now();
  const state = normalizeState({
    version: 3,
    stars: 500,
    mastery: {
      "de:animals.cat": { correct: 2, wrong: 1, independent: 99, lastSeen: now + 3 * 24 * 60 * 60 * 1000 },
    },
    inventory: ["shell"],
    equipped: ["shell", "castle"],
  });
  assert.equal(state.mastery["de:animals.cat"].independent, 2);
  assert.equal("lastSeen" in state.mastery["de:animals.cat"], false);
  assert.deepEqual(state.equipped, ["shell"]);
});


test("normalization bounds oversized persisted collections and strips unknown settings", () => {
  const now = Date.now();
  const worlds = Object.fromEntries(
    Array.from({ length: MAX_WORLD_PROGRESS_ENTRIES + 200 }, (_, i) => [
      `de:world-${i}`,
      { answers: 1, correct: 1, sessions: 0, recent: [true] },
    ]),
  );
  const mastery = Object.fromEntries(
    Array.from({ length: MAX_MASTERY_ENTRIES + 200 }, (_, i) => [
      `de:item-${i}`,
      { correct: 1, wrong: 0, independent: 1, lastSeen: now },
    ]),
  );
  const state = normalizeState({
    version: 3,
    settings: { lang: "tr", rogueSetting: "must-not-survive", voices: { tr: "voice" } },
    worlds,
    mastery,
    events: Array.from({ length: MAX_EVENT_IDS + 200 }, (_, i) => `event-${i}`),
    inventory: Array.from({ length: MAX_REWARD_IDS + 200 }, (_, i) => `reward-${i}`),
    equipped: Array.from({ length: MAX_REWARD_IDS + 200 }, (_, i) => `reward-${i}`),
    history: Array.from({ length: 900 }, (_, i) => ({
      at: now - (900 - i), worldId: "animals", gameId: "listen", lang: "de", correct: true, itemIds: ["animals.cat"],
    })),
  });

  assert.equal(Object.keys(state.worlds).length, MAX_WORLD_PROGRESS_ENTRIES);
  assert.equal(Object.keys(state.mastery).length, MAX_MASTERY_ENTRIES);
  assert.equal(state.events.length, MAX_EVENT_IDS);
  assert.equal(state.inventory.length, MAX_REWARD_IDS);
  assert.equal(state.equipped.length, MAX_REWARD_IDS);
  assert.equal(state.history.length, 500);
  assert.equal(state.history[0].at, now - 500);
  assert.equal(state.settings.lang, "tr");
  assert.equal(state.settings.voices.tr, "voice");
  assert.equal(Object.hasOwn(state.settings, "rogueSetting"), false);
});

test("normalization caps oversized identifiers before they return to localStorage", () => {
  const state = normalizeState({
    version: 3,
    events: ["x".repeat(500)],
    inventory: ["y".repeat(500)],
    equipped: ["y".repeat(500)],
  });
  assert.equal(state.events[0].length, 96);
  assert.equal(state.inventory[0].length, 96);
  assert.equal(state.equipped[0].length, 96);
});


test("corrupt partial parent PINs cannot weaken the four-digit adult gate", () => {
  for (const pin of ["1", "12", "123", "12ab", 7]) {
    const state = normalizeState({ version: 3, settings: { pin } });
    assert.equal(state.settings.pin, "");
  }
  assert.equal(normalizeState({ version: 3, settings: { pin: "1234" } }).settings.pin, "1234");
  assert.equal(normalizeState({ version: 3, settings: { pin: "12-34" } }).settings.pin, "1234");
});
