import test from "node:test";
import assert from "node:assert/strict";
import { BACKUP_FORMAT, BACKUP_MAX_BYTES, createBackupPayload, parseBackupPayload } from "../src/progress/backup.js";
import { freshState } from "../src/progress/model.js";

test("family backup round-trips multiple children without mixing progress", () => {
  const a = freshState(); a.stars = 12; a.settings.lang = "de";
  const b = freshState(); b.stars = 34; b.settings.lang = "tr";
  const payload = createBackupPayload([
    { id: "a", name: "Ada", avatar: "🐠", createdAt: 1, progress: a },
    { id: "b", name: "Efe", avatar: "🦁", createdAt: 2, progress: b },
  ], "b");
  assert.equal(payload.format, BACKUP_FORMAT);
  const restored = parseBackupPayload(JSON.stringify(payload));
  assert.equal(restored.activeId, "b");
  assert.equal(restored.profiles.length, 2);
  assert.equal(restored.profiles[0].progress.stars, 12);
  assert.equal(restored.profiles[1].progress.stars, 34);
  assert.equal(restored.profiles[1].progress.settings.lang, "tr");
});

test("family backup rejects malformed and unsafe profile sets", () => {
  assert.throws(() => parseBackupPayload("not-json"));
  assert.throws(() => parseBackupPayload({ format: BACKUP_FORMAT, version: 1, profiles: [] }));
  const profiles = Array.from({ length: 9 }, (_, i) => ({ id: `p${i}`, progress: freshState() }));
  assert.throws(() => parseBackupPayload({ format: BACKUP_FORMAT, version: 1, profiles }));
  assert.throws(() => parseBackupPayload({
    format: BACKUP_FORMAT, version: 1,
    profiles: [{ id: "same", progress: freshState() }, { id: "same", progress: freshState() }],
  }));
});

test("backup normalizes corrupted child progress instead of trusting arbitrary data", () => {
  const restored = parseBackupPayload({
    format: BACKUP_FORMAT,
    version: 1,
    activeId: "x",
    profiles: [{ id: "x", name: "  Very very very very long child name  ", avatar: "⭐", progress: { version: 3, stars: -99, settings: { lang: "xx" } } }],
  });
  assert.equal(restored.profiles[0].name.length <= 18, true);
  assert.equal(restored.profiles[0].progress.stars, 0);
  assert.equal(restored.profiles[0].progress.settings.lang, "de");
});


test("backup parser rejects oversized files and unsafe profile identifiers", () => {
  assert.throws(() => parseBackupPayload({
    format: BACKUP_FORMAT, version: 1, profiles: [{ id: "bad:id", progress: freshState() }],
  }), /invalid-profile-id/);
  assert.throws(() => parseBackupPayload({
    format: BACKUP_FORMAT, version: 1, profiles: [{ id: "x".repeat(65), progress: freshState() }],
  }), /invalid-profile-id/);
  const huge = " ".repeat(BACKUP_MAX_BYTES + 1);
  assert.throws(() => parseBackupPayload(huge), /backup-too-large/);
});

test("backup creation bounds profile metadata before export", () => {
  const payload = createBackupPayload([{
    id: "bad:id",
    name: "  Ada\n\t Test  ",
    avatar: "⭐".repeat(30),
    createdAt: Date.now() + 10 * 24 * 60 * 60 * 1000,
    progress: freshState(),
  }], "bad:id");
  assert.equal(payload.profiles[0].id, "profile-1");
  assert.equal(payload.profiles[0].name, "Ada Test");
  assert.ok(payload.profiles[0].avatar.length <= 16);
  assert.ok(payload.profiles[0].createdAt <= Date.now() + 1000);
});
