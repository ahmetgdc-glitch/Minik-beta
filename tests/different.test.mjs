import test from "node:test";
import assert from "node:assert/strict";
import { buildDifferenceRound } from "../src/games/different.js";

const items = [
  { id: "cat", labels: { de: "Katze", tr: "Kedi" } },
  { id: "dog", labels: { de: "Hund", tr: "Köpek" } },
  { id: "lion", labels: { de: "Löwe", tr: "Aslan" } },
];

test("difference round contains exactly one odd tile and three identical base tiles", () => {
  for (let i = 0; i < 30; i++) {
    const round = buildDifferenceRound(items);
    assert.ok(round);
    assert.notEqual(round.base.id, round.odd.id);
    assert.equal(round.cells.length, 4);
    assert.equal(round.cells.filter((cell) => cell.odd).length, 1);
    assert.equal(round.cells.filter((cell) => !cell.odd && cell.item.id === round.base.id).length, 3);
  }
});

test("difference round safely rejects content with fewer than two unique items", () => {
  assert.equal(buildDifferenceRound([]), null);
  assert.equal(buildDifferenceRound([items[0], items[0]]), null);
});
