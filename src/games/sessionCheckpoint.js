const VERSION = 1;
export const SESSION_CHECKPOINT_TTL_MS = 6 * 60 * 60 * 1000;

export function checkpointKey(profileId) {
  return `minik_session_checkpoint_v1:${String(profileId || "default")}`;
}

export function normalizeCheckpoint(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object" || raw.version !== VERSION) return null;
  if (typeof raw.gameId !== "string" || typeof raw.worldId !== "string") return null;
  const updatedAt = Number(raw.updatedAt);
  if (!Number.isFinite(updatedAt) || updatedAt <= 0) return null;
  if (now - updatedAt > SESSION_CHECKPOINT_TTL_MS || updatedAt - now > 60_000) return null;
  const clampInt = (value, min = 0, max = 9999) =>
    Math.min(max, Math.max(min, Number.isFinite(Number(value)) ? Math.floor(Number(value)) : min));
  return {
    version: VERSION,
    gameId: raw.gameId,
    worldId: raw.worldId,
    sessionId: typeof raw.sessionId === "string" && raw.sessionId ? raw.sessionId.slice(0, 96) : "",
    round: clampInt(raw.round, 0, 999),
    earned: clampInt(raw.earned, 0, 999),
    attempts: clampInt(raw.attempts, 0, 9999),
    mistakes: clampInt(raw.mistakes, 0, 99),
    hint: clampInt(raw.hint, 0, 3),
    played: clampInt(raw.played, 0, 9999),
    phase: ["active", "success", "demo"].includes(raw.phase) ? raw.phase : "active",
    activeSeconds: clampInt(raw.activeSeconds, 0, 24 * 60 * 60),
    // A resumed session must never start in the future or before a sensible
    // epoch. Corrupt localStorage timestamps would otherwise poison parent
    // analytics with negative/huge session durations.
    started: (() => {
      const value = Number(raw.started);
      if (!Number.isFinite(value) || value <= 0) return now;
      return Math.min(value, updatedAt, now);
    })(),
    lang: raw.lang === "de" || raw.lang === "tr" ? raw.lang : null,
    ageGroup: ["2-3", "4-5", "6+"].includes(raw.ageGroup) ? raw.ageGroup : null,
    // Preserve the exact answer-count difficulty of the interrupted session.
    // Adaptive difficulty is recalculated from learning history on a fresh
    // session, but must not jump from 2 to 4/6 halfway through a resumed one.
    difficulty: [2, 4, 6].includes(Number(raw.difficulty)) ? Number(raw.difficulty) : null,
    updatedAt,
  };
}

export function peekCheckpoint(storage, profileId, now = Date.now()) {
  try {
    const parsed = JSON.parse(storage?.getItem(checkpointKey(profileId)) || "null");
    return normalizeCheckpoint(parsed, now);
  } catch {
    return null;
  }
}

export function loadCheckpoint(storage, profileId, gameId, worldId, now = Date.now()) {
  try {
    const key = checkpointKey(profileId);
    const parsed = JSON.parse(storage?.getItem(key) || "null");
    const checkpoint = normalizeCheckpoint(parsed, now);
    if (!checkpoint || checkpoint.gameId !== gameId || checkpoint.worldId !== worldId) return null;
    return checkpoint;
  } catch {
    return null;
  }
}

export function saveCheckpoint(storage, profileId, checkpoint, now = Date.now()) {
  if (!storage || typeof storage.setItem !== "function") return false;
  try {
    const normalized = normalizeCheckpoint(
      { ...checkpoint, version: VERSION, updatedAt: now },
      now,
    );
    if (!normalized) return false;
    storage?.setItem(checkpointKey(profileId), JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

export function clearCheckpoint(storage, profileId) {
  if (!storage || typeof storage.removeItem !== "function") return false;
  try {
    storage?.removeItem(checkpointKey(profileId));
    return true;
  } catch {
    return false;
  }
}
export function clearCheckpoints(storage, profileIds = []) {
  let ok = true;
  for (const profileId of new Set(profileIds.filter(Boolean))) {
    ok = clearCheckpoint(storage, profileId) && ok;
  }
  return ok;
}



export function checkpointForGame(checkpoint, totalRounds) {
  if (!checkpoint) return null;
  const total = Math.max(1, Math.min(999, Math.floor(Number(totalRounds) || 1)));
  const round = Math.min(Math.max(0, checkpoint.round || 0), total - 1);
  const phase = ["active", "success", "demo"].includes(checkpoint.phase)
    ? checkpoint.phase
    : "active";
  // Earned stars can never exceed the number of rounds that have actually
  // been solved. This closes a corrupted-localStorage path that could make
  // the finish screen/session summary claim hundreds of completed rounds.
  const maxEarned = Math.min(total, round + (phase === "success" ? 1 : 0));
  const maxAttempts = total * 3;
  return {
    ...checkpoint,
    round,
    phase,
    earned: Math.min(Math.max(0, checkpoint.earned || 0), maxEarned),
    mistakes: Math.min(Math.max(0, checkpoint.mistakes || 0), 3),
    attempts: Math.min(Math.max(0, checkpoint.attempts || 0), maxAttempts),
    played: Math.min(Math.max(0, checkpoint.played || 0), maxAttempts),
  };
}


export function checkpointDifficulty(checkpoint, fallback = 2, maxAllowed = 6) {
  const allowed = [2, 4, 6];
  const fallbackValue = allowed.includes(Number(fallback)) ? Number(fallback) : 2;
  const restored = allowed.includes(Number(checkpoint?.difficulty))
    ? Number(checkpoint.difficulty)
    : fallbackValue;
  const cap = allowed.includes(Number(maxAllowed)) ? Number(maxAllowed) : 6;
  return Math.min(restored, cap);
}

export function checkpointMatchesProfile(checkpoint, lang, ageGroup) {
  if (!checkpoint) return false;
  // Legacy checkpoints without context stay resumable. New checkpoints must
  // match the child's current learning language and age band so one session
  // never mixes two curricula or languages.
  if (checkpoint.lang && checkpoint.lang !== lang) return false;
  if (checkpoint.ageGroup && checkpoint.ageGroup !== ageGroup) return false;
  return true;
}
