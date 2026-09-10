import fs from "node:fs";
import assert from "node:assert/strict";
import { worlds, allItems, uniqueVisuals } from "../src/data/content.js";
import { gameCatalog, gamesForWorld } from "../src/games/registry.js";
assert(worlds.length >= 12, "At least 12 worlds are required");
assert(allItems.length >= 250, "At least 250 learning objects are required");
assert.equal(
  new Set(allItems.map((x) => x.id)).size,
  allItems.length,
  "Duplicate item IDs",
);
assert(gameCatalog.length >= 13, "At least 13 game types are required");
for (const w of worlds) {
  assert(w.items.length >= 6, `${w.id}: not enough content`);
  assert(gamesForWorld(w.id).length >= 3);
  assert(uniqueVisuals(w.items).length >= 6);
}
for (const x of allItems) {
  for (const l of ["de", "tr"])
    assert(x.labels[l]?.trim(), `${x.id}: missing ${l}`);
  assert(
    fs.existsSync(`public/assets/illustrations/${x.asset}.svg`),
    `${x.id}: missing illustration`,
  );
  if (x.variants.photo) {
    assert(
      fs.existsSync(`public/${x.variants.photo}`),
      `${x.id}: missing photo`,
    );
    assert(x.photo.creator);
    assert(x.photo.kind === "generated-photo");
  }
}
for (const x of gameCatalog) {
  assert(x.de && x.tr);
  if (!x.allWorlds)
    for (const id of x.worlds) assert(worlds.some((w) => w.id === id));
}
console.log(
  `Content verified: ${worlds.length} worlds · ${allItems.length} DE/TR items · ${gameCatalog.length} game types · all local assets present`,
);
