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

test("discovery completion locks immediately and still rechecks the live session guard", () => {
  assert.match(explore, /const completionLock = useRef\(false\);/);
  assert.match(explore, /const sessionDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(explore, /const controlsDisabled = sessionDisabled \|\| completionLock\.current;/);
  assert.match(explore, /const sceneInteractionBlocked = \(\) => completionLock\.current \|\| interactionBlocked\(\);/);
  assert.match(explore, /if \(paused \|\| interactionBlocked\(\) \|\| completionLock\.current\) return;/);
  assert.match(explore, /if \(targetCount > 0 && next\.length >= targetCount\) completionLock\.current = true;/);
  assert.match(explore, /if \(sessionDisabled \|\| targetCount === 0 \|\| found\.length < targetCount\) return;/);
  assert.match(explore, /if \(!interactionBlocked\(\)\) onSolve\(found\)/);
  assert.match(explore, /interactionBlocked=\{sceneInteractionBlocked\}/);
  assert.match(explore, /if \(controlsDisabled\) return;/);
});
