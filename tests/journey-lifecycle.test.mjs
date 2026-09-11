import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

for (const name of ["DailyOrderGame.jsx", "SocialStepsGame.jsx"]) {
  const source = readFileSync(new URL(`../src/games/${name}`, import.meta.url), "utf8");
  test(`${name} blocks paused and stale lifecycle input`, () => {
    assert.match(source, /interactionBlocked = \(\) => false/);
    assert.match(source, /if \(paused \|\| interactionBlocked\(\)\) return/);
    assert.match(source, /disabled=\{paused\}/);
  });
}
