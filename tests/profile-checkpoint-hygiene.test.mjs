import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const store = await readFile(new URL("../src/progress/store.js", import.meta.url), "utf8");

test("resetting progress also clears the active child's interrupted-game checkpoint", () => {
  assert.match(store, /action\?\.type === "reset"\) clearCheckpoint\(storage, family\.activeId\)/);
});

test("deleting a profile clears its interrupted-game checkpoint", () => {
  assert.match(store, /clearCheckpoint\(storage, id\);\s*family\.profiles\.splice/);
});

test("restoring a family backup clears old and restored profile checkpoints", () => {
  assert.match(store, /clearCheckpoints\(storage, \[\.\.\.oldProfileIds, \.\.\.restoredProfiles\.map/);
});


test("changing the active learning context clears its incompatible interrupted game", () => {
  assert.match(store, /previousGameContext/);
  assert.match(store, /state\.settings\?\.lang !== previousGameContext\.lang/);
  assert.match(store, /state\.settings\?\.adaptive !== previousGameContext\.adaptive/);
  assert.match(store, /state\.settings\?\.options !== previousGameContext\.options/);
  assert.match(store, /if \(contextChanged\) clearCheckpoint\(storage, family\.activeId\)/);
});

test("changing a child's age band clears that profile's incompatible interrupted game", () => {
  assert.match(store, /nextAgeGroup !== p\.ageGroup\) clearCheckpoint\(storage, id\)/);
});
