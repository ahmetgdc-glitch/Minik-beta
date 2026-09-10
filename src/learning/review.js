import { itemMastery } from "./mastery.js";
import { isReviewDue, nextReviewAt } from "./schedule.js";

function reviewScore(progress, item, lang, now = Date.now()) {
  const state = itemMastery(progress, item.id, lang);
  const raw = progress.mastery?.[`${lang}:${item.id}`] || {};
  const wrong = Number(raw.wrong || 0);
  const independent = Number(raw.independent || 0);
  const lastSeen = Number(raw.lastSeen || 0);
  const due = isReviewDue(progress, item.id, lang, now);
  const overdue = due ? Math.min(180, Math.max(0, (now - nextReviewAt(progress, item.id, lang)) / 3600000) * 3) : 0;
  const levelWeight = {
    practice: 400,
    learning: 240,
    new: 120,
    mastered: 0,
  }[state.level] || 0;
  const ageBoost = lastSeen
    ? Math.min(80, Math.max(0, (now - lastSeen) / 86400000) * 4)
    : 30;
  return (due ? 700 : 0) + overdue + levelWeight + wrong * 35 - independent * 8 + ageBoost;
}

export function reviewItems(progress, items, lang, now = Date.now()) {
  const ranked = [...items]
    .map((item, index) => ({ item, index, score: reviewScore(progress, item, lang, now) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);

  const notMastered = ranked.filter(
    (item) => itemMastery(progress, item.id, lang).level !== "mastered",
  );
  return (notMastered.length >= 2 ? notMastered : ranked).slice(
    0,
    Math.max(6, Math.min(12, ranked.length)),
  );
}
