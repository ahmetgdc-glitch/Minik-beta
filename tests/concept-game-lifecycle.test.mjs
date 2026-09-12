import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

for (const name of ["OppositesGame.jsx", "PatternGame.jsx"]) {
  const source = readFileSync(new URL(`../src/games/${name}`, import.meta.url), "utf8");
  test(`${name} blocks paused and stale lifecycle input`, () => {
    assert.match(source, /interactionBlocked = \(\) => false/);
    assert.match(source, /const controlsDisabled = paused \|\| interactionBlocked\(\)/);
    assert.match(source, /if \(controlsDisabled\) return/);
    assert.match(source, /disabled=\{controlsDisabled\}/);
    assert.match(source, /aria-disabled=\{controlsDisabled \|\| undefined\}/);
  });
}
