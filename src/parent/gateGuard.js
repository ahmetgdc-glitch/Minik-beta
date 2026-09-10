export const MAX_PARENT_ATTEMPTS = 5;
export const PARENT_LOCK_MS = 30_000;
export const PARENT_GATE_STORAGE_KEY = "minik_parent_gate_v1";

export function normalizeParentGate(raw = {}, now = Date.now()) {
  const attempts = Math.min(
    MAX_PARENT_ATTEMPTS - 1,
    Math.max(0, Number.isFinite(Number(raw?.attempts)) ? Math.floor(Number(raw.attempts)) : 0),
  );
  const candidate = Number(raw?.lockedUntil);
  // Never trust arbitrary localStorage values to lock the parent area for an
  // excessive amount of time. A valid persisted lock may only cover one
  // normal cooldown window from the moment it is read.
  const lockedUntil = Number.isFinite(candidate) && candidate > now
    ? Math.min(candidate, now + PARENT_LOCK_MS)
    : 0;
  return {
    attempts: lockedUntil ? 0 : attempts,
    lockedUntil,
    locked: lockedUntil > now,
  };
}

export function nextParentGate(previous = {}, correct, now = Date.now()) {
  const safe = normalizeParentGate(previous, now);
  if (safe.lockedUntil > now) return safe;
  if (correct) return { attempts: 0, lockedUntil: 0, locked: false };
  const attempts = safe.attempts + 1;
  if (attempts >= MAX_PARENT_ATTEMPTS) {
    return { attempts: 0, lockedUntil: now + PARENT_LOCK_MS, locked: true };
  }
  return { attempts, lockedUntil: 0, locked: false };
}

export function parentGateRemaining(gate = {}, now = Date.now()) {
  return Math.max(0, Math.ceil(((Number(gate.lockedUntil) || 0) - now) / 1000));
}

export function readParentGate(storage, now = Date.now()) {
  try {
    const raw = JSON.parse(storage?.getItem(PARENT_GATE_STORAGE_KEY) || "null");
    return normalizeParentGate(raw, now);
  } catch {
    return normalizeParentGate({}, now);
  }
}

export function persistParentGate(storage, gate, now = Date.now()) {
  try {
    const safe = normalizeParentGate(gate, now);
    storage?.setItem(PARENT_GATE_STORAGE_KEY, JSON.stringify(safe));
    return true;
  } catch {
    return false;
  }
}
