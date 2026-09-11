import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("cold boot never re-enters a crashed active game route", () => {
  const router = read("src/app/router.js");
  assert.match(router, /let firstRouteRead = true/);
  assert.match(router, /path\.startsWith\("\/play\/"\)/);
  assert.match(router, /history\.replaceState/);
  assert.match(router, /return "\/"/);
});

test("SoundsGame waits for an actually running audio context", () => {
  const sounds = read("src/games/SoundsGame.jsx");
  assert.match(sounds, /ensureAudioReady/);
  assert.match(sounds, /const context = await ensureAudioReady\(\)/);
  assert.match(sounds, /if \(!context \|\| paused \|\| interactionBlocked\(\)\)/);
  assert.match(sounds, /playSound\(target\.sound, settings\)/);
});

test("service worker keeps boot cache small and recovery outside SPA interception", () => {
  const sw = read("scripts/build-sw.mjs");
  assert.match(sw, /firstScenes/);
  assert.doesNotMatch(sw, /p\.startsWith\("assets\/voice\/"\)/);
  assert.doesNotMatch(sw, /p\.startsWith\("assets\/illustrations\/"\)/);
  assert.match(sw, /url\.pathname\.endsWith\('\/reset\.html'\)/);
  assert.match(sw, /self\.skipWaiting\(\)/);
});
