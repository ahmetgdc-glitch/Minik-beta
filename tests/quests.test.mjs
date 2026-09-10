import test from "node:test";
import assert from "node:assert/strict";
import { dailyJourney } from "../src/learning/quests.js";

const at = (iso) => new Date(iso).getTime();

test("daily journey only counts activity from the selected local day", () => {
  const progress = {
    settings: { lang: "de" },
    history: [
      { at: at("2026-09-10T10:00:00"), worldId: "animals", correct: true, clean: true },
      { at: at("2026-09-09T10:00:00"), worldId: "food", correct: true, clean: true },
    ],
    sessions: [
      { ended: at("2026-09-10T10:05:00"), worldId: "animals", completed: true },
      { ended: at("2026-09-09T10:05:00"), worldId: "food", completed: true },
    ],
  };
  const journey = dailyJourney(progress, "de", "2026-09-10");
  assert.equal(journey.missions[0].current, 1);
  assert.equal(journey.missions[1].current, 1);
  assert.equal(journey.missions[2].current, 1);
  assert.equal(journey.completed, false);
});

test("daily journey completes only after all three child-friendly goals", () => {
  const history = Array.from({ length: 5 }, (_, i) => ({
    at: at(`2026-09-10T10:0${i}:00`),
    worldId: i < 3 ? "animals" : "food",
    correct: true,
    clean: true,
  }));
  const journey = dailyJourney({
    settings: { lang: "tr" },
    history,
    sessions: [{ ended: at("2026-09-10T10:10:00"), worldId: "animals", completed: true }],
  }, "tr", "2026-09-10");
  assert.equal(journey.completedCount, 3);
  assert.equal(journey.completed, true);
  assert.match(journey.title, /Mino/);
});

test("assisted or error-corrected answers do not satisfy the independent quest", () => {
  const journey = dailyJourney({
    settings: { lang: "de" },
    history: [
      { at: at("2026-09-10T10:00:00"), worldId: "animals", correct: true, clean: false },
      { at: at("2026-09-10T10:01:00"), worldId: "food", correct: false, clean: false },
    ],
    sessions: [],
  }, "de", "2026-09-10");
  assert.equal(journey.missions.find((m) => m.id === "clean").current, 0);
});
