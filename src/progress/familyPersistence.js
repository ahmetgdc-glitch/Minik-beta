export const FAMILY_STORAGE_VERSION = 1;
export const FAMILY_MAX_PROFILES = 8;
export const FAMILY_MAX_SERIALIZED_CHARS = 5 * 1024 * 1024;
export const FAMILY_PROFILE_ID_MAX_LENGTH = 64;

const safeProfileId = (value) => {
  const id = typeof value === "string" ? value.trim() : "";
  return new RegExp(`^[A-Za-z0-9_-]{1,${FAMILY_PROFILE_ID_MAX_LENGTH}}$`).test(id) ? id : "";
};


export function chooseActiveProfileId(raw, legacyActiveId = "") {
  const profiles = Array.isArray(raw?.profiles) ? raw.profiles : [];
  const ids = new Set(
    profiles.map((profile) => safeProfileId(profile?.id)).filter(Boolean),
  );
  const embedded = safeProfileId(raw?.activeId);
  if (embedded && ids.has(embedded)) return embedded;
  const legacy = safeProfileId(legacyActiveId);
  if (legacy && ids.has(legacy)) return legacy;
  return profiles.length ? safeProfileId(profiles[0]?.id) : "";
}

export function parseFamilyEnvelope(text) {
  if (!text) return null;
  try {
    if (typeof text === "string" && text.length > FAMILY_MAX_SERIALIZED_CHARS) return null;
    const raw = typeof text === "string" ? JSON.parse(text) : text;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    if (raw.version !== FAMILY_STORAGE_VERSION) return null;
    if (
      !Array.isArray(raw.profiles) ||
      raw.profiles.length === 0 ||
      raw.profiles.length > FAMILY_MAX_PROFILES
    ) return null;

    // Do enough structural validation here to decide whether the live family
    // is trustworthy. Without this, a JSON-valid primary such as
    // {profiles:[null]} wins over a healthy recovery snapshot and can make the
    // loader abandon every child profile. Duplicate ids are equally unsafe
    // because they make active-profile selection ambiguous.
    const ids = new Set();
    for (const profile of raw.profiles) {
      if (!profile || typeof profile !== "object" || Array.isArray(profile)) return null;
      const id = safeProfileId(profile.id);
      if (!id || ids.has(id)) return null;
      if (profile.progress != null && (typeof profile.progress !== "object" || Array.isArray(profile.progress)))
        return null;
      ids.add(id);
    }
    return raw;
  } catch {
    return null;
  }
}

export function chooseFamilyEnvelope(primaryText, recoveryText) {
  const primary = parseFamilyEnvelope(primaryText);
  if (primary) return { raw: primary, source: "primary" };
  const recovery = parseFamilyEnvelope(recoveryText);
  if (recovery) return { raw: recovery, source: "recovery" };
  return { raw: null, source: "none" };
}

export function persistFamilyEnvelope(storage, primaryKey, recoveryKey, envelope) {
  if (!storage) throw new Error("storage-unavailable");
  const serialized = JSON.stringify(envelope);
  if (!parseFamilyEnvelope(serialized)) throw new Error("invalid-family-envelope");
  const previous = storage.getItem(primaryKey);
  // Keep a last-known-good snapshot before replacing the live family state.
  if (parseFamilyEnvelope(previous)) storage.setItem(recoveryKey, previous);
  storage.setItem(primaryKey, serialized);
  return serialized;
}
