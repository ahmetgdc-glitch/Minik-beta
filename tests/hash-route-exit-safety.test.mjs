import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("hash-route leaves finalize an active game without leaving a ghost resume", () => {
  assert.match(source, /const onRouteLeave = \(\) => \{/);
  assert.match(source, /onRouteLeave[\s\S]*saveSession\(false\)[\s\S]*removeCheckpoint\(\)/);
  assert.match(source, /addEventListener\("hashchange",\s*onRouteLeave\)/);
  assert.match(source, /removeEventListener\("hashchange",\s*onRouteLeave\)/);
});

test("a completed game is not re-finalized by a later hash navigation", () => {
  assert.match(source, /if \(phaseRef\.current === "done"\) return;\s*saveSession\(false\)/s);
});
