import test from "node:test";
import assert from "node:assert/strict";
import { MAX_PARENT_ATTEMPTS, PARENT_LOCK_MS, nextParentGate, parentGateRemaining } from "../src/parent/gateGuard.js";

test("parent gate temporarily locks after repeated wrong attempts", () => {
  let gate = {};
  const now = 100_000;
  for (let i = 0; i < MAX_PARENT_ATTEMPTS; i++) gate = nextParentGate(gate, false, now + i);
  assert.equal(gate.locked, true);
  assert.equal(gate.lockedUntil, now + MAX_PARENT_ATTEMPTS - 1 + PARENT_LOCK_MS);
  assert.ok(parentGateRemaining(gate, now + 10) > 0);
});

test("correct adult code resets the retry guard", () => {
  let gate = nextParentGate({}, false, 1_000);
  gate = nextParentGate(gate, false, 1_100);
  gate = nextParentGate(gate, true, 1_200);
  assert.deepEqual(gate, { attempts: 0, lockedUntil: 0, locked: false });
});

test("parent gate becomes usable again when cooldown expires", () => {
  const gate = { attempts: 0, lockedUntil: 5_000, locked: true };
  assert.equal(parentGateRemaining(gate, 5_000), 0);
  const next = nextParentGate(gate, false, 5_001);
  assert.equal(next.locked, false);
  assert.equal(next.attempts, 1);
});

test("parent gate lock survives a page reload and cannot be bypassed by refresh", async () => {
  const { readParentGate, persistParentGate, PARENT_GATE_STORAGE_KEY } = await import("../src/parent/gateGuard.js");
  const data = new Map();
  const storage = {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, value),
  };
  const now = 20_000;
  let gate = {};
  for (let i = 0; i < MAX_PARENT_ATTEMPTS; i++) gate = nextParentGate(gate, false, now + i);
  assert.equal(persistParentGate(storage, gate, now + MAX_PARENT_ATTEMPTS), true);
  assert.ok(data.has(PARENT_GATE_STORAGE_KEY));
  const reloaded = readParentGate(storage, now + 10_000);
  assert.equal(reloaded.locked, true);
  assert.ok(parentGateRemaining(reloaded, now + 10_000) > 0);
});

test("corrupt persisted parent gate cannot create an excessive device lock", async () => {
  const { readParentGate, PARENT_GATE_STORAGE_KEY } = await import("../src/parent/gateGuard.js");
  const now = 50_000;
  const storage = {
    getItem: (key) => key === PARENT_GATE_STORAGE_KEY
      ? JSON.stringify({ attempts: 999, lockedUntil: now + 99_999_999 })
      : null,
  };
  const gate = readParentGate(storage, now);
  assert.equal(gate.attempts, 0);
  assert.equal(gate.locked, true);
  assert.equal(gate.lockedUntil, now + PARENT_LOCK_MS);
});


test("unlocked parent controls relock on Safari pagehide and BFCache transitions", async () => {
  const source = await (await import("node:fs/promises")).readFile(new URL("../src/parent/Parents.jsx", import.meta.url), "utf8");
  assert.match(source, /window\.addEventListener\("pagehide", lock\)/);
  assert.match(source, /window\.removeEventListener\("pagehide", lock\)/);
  assert.match(source, /if \(document\.hidden\) lock\(\)/);
});
