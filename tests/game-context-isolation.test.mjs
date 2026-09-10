import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const store = fs.readFileSync(new URL("../src/progress/store.js", import.meta.url), "utf8");

test("game session remounts when age or difficulty context changes", () => {
  assert.match(app, /progress\.activeProfile\?\.ageGroup/);
  assert.match(app, /progress\.settings\.adaptive \? "adaptive" : `fixed-\$\{progress\.settings\.options\}`/);
});

test("changing language or difficulty settings clears stale resume checkpoints", () => {
  assert.match(store, /previousGameContext/);
  assert.match(store, /state\.settings\?\.lang !== previousGameContext\.lang/);
  assert.match(store, /state\.settings\?\.adaptive !== previousGameContext\.adaptive/);
  assert.match(store, /state\.settings\?\.options !== previousGameContext\.options/);
  assert.match(store, /if \(contextChanged\) clearCheckpoint\(storage, family\.activeId\)/);
});
