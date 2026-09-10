import test from "node:test";
import assert from "node:assert/strict";
import { checkpointForGame } from "../src/games/sessionCheckpoint.js";

test("corrupt resume counters are bounded by the current game's real round count", () => {
  const bounded = checkpointForGame({
    round: 999,
    phase: "success",
    earned: 999,
    attempts: 9999,
    played: 9999,
    mistakes: 99,
  }, 5);

  assert.equal(bounded.round, 4);
  assert.equal(bounded.earned, 5);
  assert.equal(bounded.attempts, 15);
  assert.equal(bounded.played, 15);
  assert.equal(bounded.mistakes, 3);
});

test("active or demo checkpoints cannot claim the current round as already earned", () => {
  const active = checkpointForGame({ round: 2, phase: "active", earned: 9 }, 6);
  const demo = checkpointForGame({ round: 2, phase: "demo", earned: 9 }, 6);
  const success = checkpointForGame({ round: 2, phase: "success", earned: 9 }, 6);

  assert.equal(active.earned, 2);
  assert.equal(demo.earned, 2);
  assert.equal(success.earned, 3);
});
