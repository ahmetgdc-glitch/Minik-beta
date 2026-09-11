import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

for (const name of ["ReviewGame.jsx", "ShadowGame.jsx", "SoundsGame.jsx"]) {
  const source = readFileSync(new URL(`../src/games/${name}`, import.meta.url), "utf8");
  test(`${name} blocks paused and stale lifecycle input`, () => {
    assert.match(source, /interactionBlocked = \(\) => false/);
    assert.match(source, /if \(paused \|\| interactionBlocked\(\)\) return/);
  });
}

test("SoundsGame also blocks replay during pause", () => {
  const source = readFileSync(new URL("../src/games/SoundsGame.jsx", import.meta.url), "utf8");
  assert.match(source, /disabled=\{paused\}/);
  assert.match(source, /stopSounds\(\)/);
});
