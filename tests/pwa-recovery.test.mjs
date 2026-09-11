import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const recovery = fs.readFileSync("public/reset.html", "utf8");
const swBuilder = fs.readFileSync("scripts/build-sw.mjs", "utf8");

test("iPhone recovery page clears only MINIK service worker caches and preserves learning data", () => {
  assert.match(recovery, /getRegistrations\(\)/);
  assert.match(recovery, /registration\.scope\.includes\('\/Minik-beta\/'\)/);
  assert.match(recovery, /registration\.unregister\(\)/);
  assert.match(recovery, /caches\.keys\(\)/);
  assert.match(recovery, /key\.startsWith\('minik:'\)/);
  assert.doesNotMatch(recovery, /localStorage\.(?:clear|removeItem)/);
  assert.doesNotMatch(recovery, /sessionStorage\.(?:clear|removeItem)/);
});

test("recovery page reloads the fresh app with cache busting and stays outside precache core", () => {
  assert.match(recovery, /searchParams\.set\('fresh'/);
  assert.match(recovery, /window\.location\.replace\(target\.href\)/);
  assert.doesNotMatch(swBuilder, /p === "reset\.html"/);
});
