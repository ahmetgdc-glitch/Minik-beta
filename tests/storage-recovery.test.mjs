import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  chooseActiveProfileId,
  chooseFamilyEnvelope,
  parseFamilyEnvelope,
  persistFamilyEnvelope,
} from "../src/progress/familyPersistence.js";

const good = (name = "Ada") => JSON.stringify({ version: 1, profiles: [{ id: "p1", name }] });

test("family persistence prefers valid live state and falls back to recovery", () => {
  assert.equal(chooseFamilyEnvelope(good("Live"), good("Backup")).source, "primary");
  const recovered = chooseFamilyEnvelope("{broken", good("Backup"));
  assert.equal(recovered.source, "recovery");
  assert.equal(recovered.raw.profiles[0].name, "Backup");
  assert.equal(chooseFamilyEnvelope("bad", "also bad").source, "none");
});

test("family envelope rejects wrong versions and empty profile sets", () => {
  assert.equal(parseFamilyEnvelope(JSON.stringify({ version: 2, profiles: [{ id: "p" }] })), null);
  assert.equal(parseFamilyEnvelope(JSON.stringify({ version: 1, profiles: [] })), null);
});



test("family envelope rejects structurally corrupt or ambiguous profile arrays", () => {
  assert.equal(parseFamilyEnvelope(JSON.stringify({ version: 1, profiles: [null] })), null);
  assert.equal(parseFamilyEnvelope(JSON.stringify({ version: 1, profiles: [{ id: "" }] })), null);
  assert.equal(
    parseFamilyEnvelope(JSON.stringify({ version: 1, profiles: [{ id: "p1" }, { id: "p1" }] })),
    null,
  );
  assert.equal(
    parseFamilyEnvelope(JSON.stringify({ version: 1, profiles: [{ id: "p1", progress: "broken" }] })),
    null,
  );
});

test("structurally corrupt live family falls back to the last known good recovery", () => {
  const corruptLive = JSON.stringify({ version: 1, profiles: [null] });
  const recovered = chooseFamilyEnvelope(corruptLive, good("Backup"));
  assert.equal(recovered.source, "recovery");
  assert.equal(recovered.raw.profiles[0].name, "Backup");
});
test("saving preserves the previous valid family as last-known-good recovery", () => {
  const values = new Map([["live", good("Before")]]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  persistFamilyEnvelope(storage, "live", "recovery", { version: 1, profiles: [{ id: "p1", name: "After" }] });
  assert.equal(JSON.parse(values.get("recovery")).profiles[0].name, "Before");
  assert.equal(JSON.parse(values.get("live")).profiles[0].name, "After");
});

test("saving never replaces recovery with a corrupt live value", () => {
  const values = new Map([["live", "{broken"], ["recovery", good("Safe")]]);
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  persistFamilyEnvelope(storage, "live", "recovery", { version: 1, profiles: [{ id: "p1", name: "Fresh" }] });
  assert.equal(JSON.parse(values.get("recovery")).profiles[0].name, "Safe");
});


test("family envelope rejects oversized profile sets and unsafe ids before live recovery selection", () => {
  const tooMany = JSON.stringify({
    version: 1,
    profiles: Array.from({ length: 9 }, (_, i) => ({ id: `p${i}` })),
  });
  assert.equal(parseFamilyEnvelope(tooMany), null);
  assert.equal(
    parseFamilyEnvelope(JSON.stringify({ version: 1, profiles: [{ id: "bad:id" }] })),
    null,
  );
  assert.equal(
    chooseFamilyEnvelope(tooMany, good("Safe backup")).source,
    "recovery",
  );
});

test("family persistence refuses to write an envelope that cannot be read back", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.throws(() => persistFamilyEnvelope(storage, "live", "recovery", {
    version: 1, profiles: [{ id: "bad:id" }],
  }), /invalid-family-envelope/);
  assert.equal(values.has("live"), false);
});


test("embedded active profile wins over the legacy selection key", () => {
  const raw = {
    version: 1,
    activeId: "p2",
    profiles: [{ id: "p1" }, { id: "p2" }],
  };
  assert.equal(chooseActiveProfileId(raw, "p1"), "p2");
  assert.equal(chooseActiveProfileId({ ...raw, activeId: "missing" }, "p1"), "p1");
  assert.equal(chooseActiveProfileId({ ...raw, activeId: "bad:id" }, "missing"), "p1");
});

test("persisted family envelope keeps active child in the authoritative write", () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  persistFamilyEnvelope(storage, "live", "recovery", {
    version: 1,
    activeId: "p2",
    profiles: [{ id: "p1" }, { id: "p2" }],
  });
  const live = JSON.parse(values.get("live"));
  assert.equal(live.activeId, "p2");
  assert.equal(chooseActiveProfileId(live, "p1"), "p2");
});

test("store saves and recovers the active profile from the family envelope", () => {
  const source = fs.readFileSync(new URL("../src/progress/store.js", import.meta.url), "utf8");
  assert.match(source, /activeId:\s*family\.activeId/);
  assert.match(source, /chooseActiveProfileId\(raw,\s*legacyRequested\)/);
  assert.match(source, /persistFamilyEnvelope\(storage,\s*FAMILY_KEY,\s*RECOVERY_KEY/);
});
