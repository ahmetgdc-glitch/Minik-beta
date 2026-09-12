import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/games/MissingGame.jsx", import.meta.url), "utf8");

test("missing object game blocks reveal and answer input while paused or stale", () => {
  assert.match(source, /interactionBlocked = \(\) => false/);
  assert.match(source, /const controlsDisabled = paused \|\| interactionBlocked\(\)/);
  assert.match(source, /function revealQuestion\(\)/);
  assert.match(source, /function pick\(item\)/);
  assert.match(source, /if \(controlsDisabled\) return/);
  assert.match(source, /disabled=\{controlsDisabled\}/);
});
