import test from "node:test";
import assert from "node:assert/strict";
import { worlds } from "../src/data/content.js";
import { oppositePairs, pairsForWorld } from "../src/games/opposites.js";
import { routineSequence, orderPairs } from "../src/games/dailyOrder.js";
import { gameById, gamesForWorld } from "../src/games/registry.js";

const byWorld = Object.fromEntries(worlds.map((w) => [w.id, w]));

test("opposite pairs reference real items and never pair an item with itself", () => {
  for (const [worldId, pairs] of Object.entries(oppositePairs)) {
    const ids = new Set(byWorld[worldId].items.map((i) => i.id));
    assert.ok(pairs.length >= 2, `${worldId} needs enough opposite pairs`);
    for (const [a, b] of pairs) {
      assert.notEqual(a, b);
      assert.ok(ids.has(a), `${a} must exist`);
      assert.ok(ids.has(b), `${b} must exist`);
    }
    assert.equal(pairsForWorld(worldId, byWorld[worldId].items).length, pairs.length);
  }
});

test("daily routine sequence uses unique real routine items in chronological order", () => {
  const items = byWorld.routines.items;
  const ids = new Set(items.map((i) => i.id));
  assert.ok(routineSequence.length >= 10);
  assert.equal(new Set(routineSequence).size, routineSequence.length);
  routineSequence.forEach((id) => assert.ok(ids.has(id), `${id} must exist`));
  const pairs = orderPairs(items);
  assert.equal(pairs.length, routineSequence.length - 1);
  pairs.forEach(([a, b], i) => {
    assert.equal(a.id, routineSequence[i]);
    assert.equal(b.id, routineSequence[i + 1]);
  });
});

test("new concept games are only offered in worlds where their content is valid", () => {
  assert.deepEqual(gameById.dailyorder.worlds, ["routines"]);
  assert.ok(gamesForWorld("routines").some((g) => g.id === "dailyorder"));
  assert.ok(gamesForWorld("feelings").some((g) => g.id === "opposites"));
  assert.ok(gamesForWorld("weather").some((g) => g.id === "opposites"));
  assert.ok(!gamesForWorld("animals").some((g) => ["dailyorder", "opposites"].includes(g.id)));
});
