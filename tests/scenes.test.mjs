import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { worlds } from "../src/data/content.js";
import { atlasPages, sceneChapters, sceneIndex, sceneForWorld, explorationSize, addDiscovery } from "../src/worlds/scenes.js";

test("the atlas reaches every existing world exactly once without changing IDs", () => {
  const pages = atlasPages(worlds);
  const ids = pages.flatMap(page => page.ids);
  assert.equal(ids.length, worlds.length);
  assert.deepEqual([...new Set(ids)].sort(), worlds.map(w => w.id).sort());
  assert.ok(pages.every(page => page.ids.length >= 1 && page.ids.length <= 2));
  assert.ok(sceneChapters.every(chapter => chapter.de && chapter.tr));
});

test("filtered atlases never offer unavailable worlds or empty islands", () => {
  for (const world of worlds) assert.deepEqual(atlasPages([world]).flatMap(p => p.ids), [world.id]);
  assert.deepEqual(atlasPages([]), []);
  const subset = worlds.filter((_, index) => index % 3 === 0);
  assert.deepEqual(atlasPages(subset).flatMap(p => p.ids).sort(), subset.map(w => w.id).sort());
});

test("scene paging rounds native scroll positions and clamps Safari overscroll", () => {
  assert.equal(sceneIndex(-70, 393, 5), 0);
  assert.equal(sceneIndex(196, 393, 5), 0);
  assert.equal(sceneIndex(197, 393, 5), 1);
  assert.equal(sceneIndex(1800, 393, 5), 4);
  assert.equal(sceneIndex(3 * 768, 768, 5), 3);
  for (const width of [0, -1, NaN, Infinity]) assert.equal(sceneIndex(400, width, 5), 0);
  assert.equal(sceneIndex(NaN, 393, 5), 0);
  assert.equal(sceneIndex(400, 393, 0), 0);
});

test("discovery advances once per real item despite rapid duplicate taps", () => {
  const ids = ["animals.lion", "animals.dog"];
  let found = [];
  for (const id of [ids[0], ids[0], "unknown", ids[1], ids[1]]) found = addDiscovery(found, id, ids);
  assert.deepEqual(found, ids);
  assert.equal(addDiscovery(found, ids[0], ids), found);
  assert.equal(addDiscovery(found, "unknown", ids), found);
});

test("young children discover two objects per round and older children four or six", () => {
  assert.equal(explorationSize(2), 2);
  assert.equal(explorationSize(4), 4);
  assert.equal(explorationSize(6), 6);
});

test("all scene backgrounds exist locally within a compact offline budget", () => {
  let bytes = 0;
  for (const name of new Set(["archipelago", ...worlds.map(w => sceneForWorld(w.id))])) {
    const file = new URL(`../public/assets/scenes/${name}.webp`, import.meta.url);
    const image = fs.readFileSync(file);
    assert.equal(image.subarray(8, 12).toString(), "WEBP");
    bytes += image.length;
  }
  assert.ok(bytes < 450_000, `Scene assets use ${bytes} bytes`);
});
