import { itemMastery } from "./mastery.js";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function reviewInterval(progress, itemId, lang = progress.settings?.lang || "de") {
  const raw = progress.mastery?.[`${lang}:${itemId}`] || {};
  const state = itemMastery(progress, itemId, lang);
  const independent = Number(raw.independent || 0);
  const wrong = Number(raw.wrong || 0);

  if (state.level === "new") return 0;
  if (state.level === "practice") return wrong >= independent + 2 ? 4 * HOUR : 12 * HOUR;
  if (state.level === "learning") return independent >= 2 ? DAY : 12 * HOUR;
  // Mastered terms are intentionally revisited over increasingly wider gaps.
  if (independent >= 8) return 14 * DAY;
  if (independent >= 5) return 7 * DAY;
  return 3 * DAY;
}

export function nextReviewAt(progress, itemId, lang = progress.settings?.lang || "de") {
  const raw = progress.mastery?.[`${lang}:${itemId}`] || {};
  const lastSeen = Number(raw.lastSeen || 0);
  const interval = reviewInterval(progress, itemId, lang);
  if (!lastSeen || !interval) return 0;
  return lastSeen + interval;
}

export function isReviewDue(progress, itemId, lang = progress.settings?.lang || "de", now = Date.now()) {
  const state = itemMastery(progress, itemId, lang);
  if (state.level === "new") return false;
  const dueAt = nextReviewAt(progress, itemId, lang);
  return !!dueAt && dueAt <= now;
}

export function dueItems(progress, items, lang = progress.settings?.lang || "de", now = Date.now()) {
  return items
    .filter((item) => isReviewDue(progress, item.id, lang, now))
    .sort((a, b) => nextReviewAt(progress, a.id, lang) - nextReviewAt(progress, b.id, lang));
}

export function dueCount(progress, items, lang = progress.settings?.lang || "de", now = Date.now()) {
  return dueItems(progress, items, lang, now).length;
}
