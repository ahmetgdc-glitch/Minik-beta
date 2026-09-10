import { normalizeState } from "./model.js";

export const BACKUP_FORMAT = "minik-family-backup";
export const BACKUP_VERSION = 1;
export const BACKUP_MAX_PROFILES = 8;
export const BACKUP_MAX_BYTES = 5 * 1024 * 1024;
export const PROFILE_ID_MAX_LENGTH = 64;
const AGE_GROUPS = ["2-3", "4-5", "6+"];
const cleanAgeGroup = (value) => AGE_GROUPS.includes(value) ? value : "4-5";

const cleanName = (value, fallback) =>
  String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18) || fallback;
const safeProfileId = (value) => {
  const id = typeof value === "string" ? value.trim() : "";
  return new RegExp(`^[A-Za-z0-9_-]{1,${PROFILE_ID_MAX_LENGTH}}$`).test(id) ? id : "";
};
const safeCreatedAt = (value, now = Date.now()) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= now + 24 * 60 * 60 * 1000
    ? Math.floor(n)
    : now;
};
const serializedByteLength = (text) => {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text).byteLength;
  return text.length * 2;
};

export function createBackupPayload(profiles, activeId) {
  const usedIds = new Set();
  const safe = (profiles || []).slice(0, BACKUP_MAX_PROFILES).map((profile, index) => {
    let id = safeProfileId(profile?.id);
    if (!id || usedIds.has(id)) id = `profile-${index + 1}`;
    usedIds.add(id);
    return {
      id,
      name: cleanName(profile?.name, `Kind ${index + 1}`),
      avatar: String(profile?.avatar || "🐠").slice(0, 16),
      ageGroup: cleanAgeGroup(profile?.ageGroup),
      createdAt: safeCreatedAt(profile?.createdAt),
      progress: normalizeState(profile?.progress),
    };
  });
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    activeId: safe.some((profile) => profile.id === activeId) ? activeId : safe[0]?.id || "",
    profiles: safe,
  };
}

export function parseBackupPayload(input) {
  let raw = input;
  if (typeof input === "string") {
    if (serializedByteLength(input) > BACKUP_MAX_BYTES) throw new Error("backup-too-large");
    try { raw = JSON.parse(input); } catch { throw new Error("invalid-json"); }
  }
  if (!raw || typeof raw !== "object" || raw.format !== BACKUP_FORMAT || raw.version !== BACKUP_VERSION)
    throw new Error("invalid-format");
  if (!Array.isArray(raw.profiles) || !raw.profiles.length)
    throw new Error("no-profiles");
  if (raw.profiles.length > BACKUP_MAX_PROFILES)
    throw new Error("too-many-profiles");

  const ids = new Set();
  const profiles = raw.profiles.map((profile, index) => {
    if (!profile || typeof profile !== "object") throw new Error("invalid-profile");
    const id = safeProfileId(profile.id);
    if (!id || ids.has(id)) throw new Error("invalid-profile-id");
    ids.add(id);
    return {
      id,
      name: cleanName(profile.name, `Kind ${index + 1}`),
      avatar: String(profile.avatar || "🐠").slice(0, 16),
      ageGroup: cleanAgeGroup(profile.ageGroup),
      createdAt: safeCreatedAt(profile.createdAt),
      progress: normalizeState(profile.progress),
    };
  });
  return {
    profiles,
    activeId: ids.has(String(raw.activeId || "")) ? String(raw.activeId) : profiles[0].id,
  };
}
