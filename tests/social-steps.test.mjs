import test from "node:test";
import assert from "node:assert/strict";
import { worlds } from "../src/data/content.js";
import { socialSafetySequences, buildSocialSafetyRounds } from "../src/games/socialSteps.js";
import { gameById } from "../src/games/registry.js";
import { gameFitsAge } from "../src/learning/age.js";

const safety = worlds.find((world) => world.id === "safety");

test("social safety sequences use three unique, real safety items", () => {
  const rounds = buildSocialSafetyRounds(safety.items);
  assert.equal(rounds.length, socialSafetySequences.length);
  for (const round of rounds) {
    assert.equal(round.items.length, 3);
    assert.equal(new Set(round.items.map((item) => item.id)).size, 3);
    assert.ok(round.title.de && round.title.tr);
  }
});

test("social safety game is restricted to the safety world and remains toddler-friendly", () => {
  const game = gameById.socialsteps;
  assert.deepEqual(game.worlds, ["safety"]);
  assert.equal(gameFitsAge(game, "2-3"), true);
  assert.equal(gameFitsAge(game, "4-5"), true);
  assert.equal(gameFitsAge(game, "6+"), true);
});
