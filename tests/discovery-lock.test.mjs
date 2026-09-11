import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const scene = readFileSync(new URL("../src/worlds/SceneExplorer.jsx", import.meta.url), "utf8");
const explore = readFileSync(new URL("../src/games/ExploreGame.jsx", import.meta.url), "utf8");

test("discovery scene disables every child control while the session is locked", () => {
  assert.match(scene, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(scene, /aria-disabled=\{controlsDisabled \|\| undefined\}/);
  assert.match(scene, /tabIndex=\{index === pager\.index && !controlsDisabled \? 0 : -1\}/);
  assert.match(scene, /disabled=\{controlsDisabled\}/);
  assert.match(scene, /disabled=\{pager\.index === 0 \|\| controlsDisabled\}/);
  assert.match(scene, /disabled=\{pager\.index === items\.length - 1 \|\| controlsDisabled\}/);
  assert.match(scene, /if \(!controlsDisabled\) pager\.onKeyDown\(event\)/);
});

test("discovery completion rechecks the live guard before solving", () => {
  assert.match(explore, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(explore, /if \(controlsDisabled \|\| found\.length < targetCount\) return/);
  assert.match(explore, /if \(!interactionBlocked\(\)\) onSolve\(found\)/);
  assert.match(explore, /if \(!controlsDisabled\) speak\(help, lang, settings\)/);
});
