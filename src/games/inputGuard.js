export const DEFAULT_WRONG_TAP_COOLDOWN_MS = 420;

export function shouldAcceptWrongTap(previous, signature, now, cooldown = DEFAULT_WRONG_TAP_COOLDOWN_MS) {
  const safeNow = Number.isFinite(Number(now)) ? Number(now) : Date.now();
  const next = { signature: String(signature || ""), at: safeNow };
  if (!previous || previous.signature !== next.signature) return { accept: true, next };
  const elapsed = safeNow - Number(previous.at || 0);
  return { accept: elapsed < 0 || elapsed >= cooldown, next: elapsed < 0 || elapsed >= cooldown ? next : previous };
}

export function shouldBlockGameInteraction({
  locked = false,
  paused = false,
  manualPaused = false,
  lifecyclePaused = false,
  phase = "active",
  hidden = false,
} = {}) {
  return Boolean(locked || paused || manualPaused || lifecyclePaused || hidden || phase !== "active");
}
