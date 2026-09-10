import { worlds } from "../data/content.js";
import { gamesForWorld } from "../games/registry.js";
import { worldMastery } from "./mastery.js";
import { dueCount } from "./schedule.js";


import { gamesForAge } from "./age.js";

const completedSessions = (progress) =>
  (progress.sessions || []).filter((session) => session?.completed);

function worldStats(progress, worldId, lang) {
  const stats = progress.worlds?.[`${lang}:${worldId}`] || {};
  const answers = Number(stats.answers || 0);
  const correct = Number(stats.correct || 0);
  const accuracy = answers ? correct / answers : 0;
  const sessions = completedSessions(progress).filter(
    (session) => session.worldId === worldId && session.lang === lang,
  );
  return { answers, accuracy, sessions: sessions.length };
}

function recommendationRank(progress, world, lang, index) {
  const stats = worldStats(progress, world.id, lang);
  // New worlds stay exciting, but a weak practiced world gets priority when
  // accuracy drops. A small index tie-break keeps recommendations stable.
  const unseenBoost = stats.answers === 0 ? 42 : 0;
  const weakBoost = stats.answers >= 4 ? Math.max(0, 1 - stats.accuracy) * 70 : 0;
  const lowPracticeBoost = Math.max(0, 18 - stats.sessions * 4);
  const dueBoost = Math.min(120, dueCount(progress, world.items, lang) * 24);
  const recentPenalty = progress.lastWorld === world.id && !dueBoost ? 5 : 0;
  return dueBoost + unseenBoost + weakBoost + lowPracticeBoost - recentPenalty - index * 0.001;
}

function pickGame(progress, world, lang, usedGames) {
  const candidates = gamesForAge(gamesForWorld(world.id), progress.activeProfile?.ageGroup);
  const mastery = worldMastery(progress, world, lang);
  // When a child has concrete weak terms, prioritize a focused repetition
  // instead of merely picking the least-played generic game.
  if (dueCount(progress, world.items, lang) > 0 || mastery.practice > 0) {
    const review = candidates.find((game) => game.id === "review");
    if (review && !usedGames.has(review.id)) return review;
  }
  const sessions = completedSessions(progress).filter(
    (session) => session.worldId === world.id && session.lang === lang,
  );
  const counts = Object.fromEntries(candidates.map((game) => [game.id, 0]));
  for (const session of sessions) {
    if (session.gameId in counts) counts[session.gameId] += 1;
  }
  return [...candidates].sort((a, b) => {
    const usedA = usedGames.has(a.id) ? 1 : 0;
    const usedB = usedGames.has(b.id) ? 1 : 0;
    return usedA - usedB || counts[a.id] - counts[b.id] || a.id.localeCompare(b.id);
  })[0];
}

function reasonFor(progress, world, lang) {
  const stats = worldStats(progress, world.id, lang);
  if (stats.answers >= 4 && stats.accuracy < 0.72) return "practice";
  if (dueCount(progress, world.items, lang) > 0) return "due";
  if (!stats.answers) return "new";
  if (stats.sessions < 2) return "continue";
  return "variety";
}

export function recommendedActivities(progress, lang = progress.settings?.lang || "de", limit = 3) {
  const ranked = worlds
    .map((world, index) => ({ world, rank: recommendationRank(progress, world, lang, index) }))
    .sort((a, b) => b.rank - a.rank);

  const usedGames = new Set();
  const result = [];
  for (const { world } of ranked) {
    const game = pickGame(progress, world, lang, usedGames);
    if (!game) continue;
    usedGames.add(game.id);
    result.push({ world, game, reason: reasonFor(progress, world, lang) });
    if (result.length >= Math.max(1, limit)) break;
  }
  return result;
}
