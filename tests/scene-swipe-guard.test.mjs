import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const scene = fs.readFileSync(new URL("../src/worlds/SceneExplorer.jsx", import.meta.url), "utf8");

test("scene exploration marks a moving finger as a drag before Safari can synthesize a click", () => {
  assert.match(scene, /const DRAG_THRESHOLD_PX = 14/);
  assert.match(scene, /onPointerMove=\{\(event\) => \{/);
  assert.match(scene, /start\.pointerId !== event\.pointerId/);
  assert.match(scene, /start\.dragged = true/);
});

test("a drag cannot accidentally discover an item even if iOS later emits click", () => {
  assert.match(scene, /start\.dragged \|\|/);
  assert.match(scene, /> DRAG_THRESHOLD_PX/);
  const guard = scene.indexOf("start.dragged ||");
  const discover = scene.indexOf("onDiscover(item)");
  assert.ok(guard >= 0 && discover > guard);
});

test("pointer cancellation clears stale child gestures", () => {
  assert.match(scene, /onPointerCancel=\{\(\) => \{[\s\S]*?pointer\.current = null/);
});
