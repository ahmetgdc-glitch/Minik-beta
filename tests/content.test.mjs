import test from "node:test";
import assert from "node:assert/strict";
import { worlds, allItems, uniqueVisuals } from "../src/data/content.js";
import { gameCatalog, gamesForWorld } from "../src/games/registry.js";
import { choicesFor } from "../src/utils/random.js";
import fs from "node:fs";
test("content is genuinely bilingual, unique, and large enough", () => {
  assert(worlds.length >= 25);
  assert(allItems.length >= 500);
  assert.equal(new Set(allItems.map((x) => x.id)).size, allItems.length);
  for (const item of allItems) {
    assert(item.labels.de.trim());
    assert(item.labels.tr.trim());
    assert.equal(item.id.split(".")[0], item.category);
  }
});
test("world and game artwork never points at a missing local asset", () => {
  for (const world of worlds)
    assert(fs.existsSync(`public/assets/illustrations/${world.asset}.svg`), `missing world art ${world.asset}`);
  for (const game of gameCatalog)
    assert(fs.existsSync(`public/assets/illustrations/${game.asset}.svg`), `missing game art ${game.asset}`);
});
test("all real illustrations and photo variants exist locally", () => {
  for (const item of allItems) {
    assert(fs.existsSync(`public/assets/illustrations/${item.asset}.svg`));
    if (item.variants.photo) {
      assert(fs.existsSync(`public/${item.variants.photo}`));
      assert.equal(item.photo.realPerson, false);
      assert.equal(item.photo.kind, "generated-photo");
    }
  }
});
test("every world has its own playable content and supported games", () => {
  assert(gameCatalog.length >= 18);
  assert(gameCatalog.some((g) => g.id === "draw"));
  assert(gameCatalog.some((g) => g.id === "story"));
  for (const world of worlds) {
    assert(uniqueVisuals(world.items).length >= 6);
    assert(gamesForWorld(world.id).length >= 3);
    assert(world.items.every((x) => x.category === world.id));
  }
});
test("every 2/4/6 answer set includes one unambiguous target", () => {
  for (const world of worlds) {
    const pool = uniqueVisuals(world.items);
    for (const n of [2, 4, 6]) {
      for (const target of pool) {
        const options = choicesFor(target, pool, n);
        assert.equal(options.length, n);
        assert.equal(options.filter((x) => x.id === target.id).length, 1);
        assert.equal(new Set(options.map((x) => x.id)).size, n);
      }
    }
  }
});
test("numbers have real numerical identity through 20", () => {
  const numbers = worlds.find((w) => w.id === "numbers").items;
  assert.deepEqual(
    numbers.map((x) => x.number),
    Array.from({ length: 20 }, (_, i) => i + 1),
  );
});
test("sound game has twelve actual sound keys, not word speech", () => {
  const sounds = worlds.find((w) => w.id === "sounds").items;
  assert.equal(new Set(sounds.map((x) => x.sound)).size, 12);
  assert(sounds.every((x) => x.sound));
});

test("release target has 25 worlds, 500+ bilingual items, letter tracing and early literacy", () => {
  assert.equal(worlds.length, 25);
  assert(allItems.length >= 500);
  const letters = worlds.find((w) => w.id === "letters");
  assert(letters && letters.items.length >= 25);
  assert(gameCatalog.some((g) => g.id === "lettertrace" && g.worlds?.includes("letters")));
});
