import test from "node:test";
import assert from "node:assert/strict";
import { minoOutfits, unlockedOutfits, nextOutfit, normalizeOutfit } from "../src/rewards/outfits.js";
import { freshState, normalizeState, reduceProgress } from "../src/progress/model.js";

test("outfits have increasing unlock thresholds and a free classic option", () => {
  assert.equal(minoOutfits[0].id, "classic");
  assert.equal(minoOutfits[0].stars, 0);
  for (let i = 1; i < minoOutfits.length; i++) assert.ok(minoOutfits[i].stars > minoOutfits[i - 1].stars);
});

test("outfit unlock helpers respect stars", () => {
  const state = { stars: 150 };
  assert.deepEqual(unlockedOutfits(state).map((o) => o.id), ["classic", "party", "explorer", "diver"]);
  assert.equal(nextOutfit(state).id, "artist");
  assert.equal(normalizeOutfit("hero", 150), "classic");
  assert.equal(normalizeOutfit("diver", 150), "diver");
});

test("progress keeps selected outfit and reducer cannot unlock above current stars", () => {
  let state = freshState();
  state.stars = 100;
  state = reduceProgress(state, { type: "outfit", id: "explorer", stars: 80 });
  assert.equal(state.minoOutfit, "explorer");
  state = reduceProgress(state, { type: "outfit", id: "hero", stars: 260 });
  assert.equal(state.minoOutfit, "explorer");
  assert.equal(normalizeState(state).minoOutfit, "explorer");
});
