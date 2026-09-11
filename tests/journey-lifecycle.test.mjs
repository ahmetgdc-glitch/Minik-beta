import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function hasLifecycleGuard(source) {
  const direct = /if \(paused \|\| interactionBlocked\(\)\) return/.test(source);
  const helper = /function blocked\(\) \{[\s\S]*?return paused \|\| interactionBlocked\(\);[\s\S]*?\}/.test(source)
    && /if \(blocked\(\)\) return/.test(source);
  const rendered = /const controlsDisabled = paused \|\| interactionBlocked\(\);/.test(source)
    && /if \(controlsDisabled\) return/.test(source);
  return direct || helper || rendered;
}

for (const name of ["DailyOrderGame.jsx", "SocialStepsGame.jsx"]) {
  const source = readFileSync(new URL(`../src/games/${name}`, import.meta.url), "utf8");
  test(`${name} blocks paused and stale lifecycle input`, () => {
    assert.match(source, /interactionBlocked = \(\) => false/);
    assert.ok(hasLifecycleGuard(source), `${name} must synchronously guard paused and stale input`);
    assert.match(source, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
    assert.match(source, /disabled=\{controlsDisabled\}/);
  });
}
