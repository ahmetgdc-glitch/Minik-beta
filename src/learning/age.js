export const AGE_GROUPS = ["2-3", "4-5", "6+"];

const EARLY_GAME_IDS = new Set([
  "explore", "listen", "draw", "different", "match", "count", "sounds",
  "shadow", "missing", "memory", "opposites", "dailyorder", "socialsteps", "review", "story", "rhythm", "speak",
]);

const PRESCHOOL_GAME_IDS = new Set([
  ...EARLY_GAME_IDS,
  "sort", "pattern", "puzzle", "story", "review", "rhythm", "trace", "initialletter",
]);

export function normalizeAgeGroup(value) {
  return AGE_GROUPS.includes(value) ? value : "4-5";
}

export function maxOptionsForAge(ageGroup) {
  return ageGroup === "2-3" ? 2 : ageGroup === "4-5" ? 4 : 6;
}

export function gameFitsAge(game, ageGroup) {
  if (!game) return false;
  if (ageGroup === "2-3") return EARLY_GAME_IDS.has(game.id);
  if (ageGroup === "4-5") return PRESCHOOL_GAME_IDS.has(game.id);
  return true;
}

export function gamesForAge(games, ageGroup) {
  const filtered = (games || []).filter((game) => gameFitsAge(game, ageGroup));
  return filtered.length ? filtered : (games || []);
}
