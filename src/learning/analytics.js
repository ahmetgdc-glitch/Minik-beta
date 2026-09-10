import { localDay } from "../progress/model.js";

function safeDate(value) {
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d : null;
}

function dayKey(value) {
  const d = safeDate(value);
  return d ? localDay(d) : "";
}

export function weeklyActivity(progress, now = new Date()) {
  const end = safeDate(now) || new Date();
  const days = [];
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(end);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - offset);
    days.push({
      key: localDay(d),
      date: d,
      answers: 0,
      correct: 0,
      seconds: 0,
      sessions: 0,
      completed: 0,
    });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const event of progress?.history || []) {
    const bucket = byKey.get(dayKey(event?.at));
    if (!bucket) continue;
    bucket.answers += 1;
    bucket.correct += Number(!!event.correct);
  }
  for (const session of progress?.sessions || []) {
    const bucket = byKey.get(dayKey(session?.ended || session?.started));
    if (!bucket) continue;
    bucket.sessions += 1;
    bucket.completed += Number(!!session.completed);
    bucket.seconds += Math.max(0, Number(session.seconds) || 0);
  }
  const answers = days.reduce((n, d) => n + d.answers, 0);
  const correct = days.reduce((n, d) => n + d.correct, 0);
  const seconds = days.reduce((n, d) => n + d.seconds, 0);
  const completed = days.reduce((n, d) => n + d.completed, 0);
  const activeDays = days.filter((d) => d.answers > 0 || d.sessions > 0).length;
  return {
    days,
    answers,
    correct,
    accuracy: answers ? Math.round((correct / answers) * 100) : 0,
    seconds,
    minutes: Math.round(seconds / 60),
    completed,
    activeDays,
  };
}

export function strongestLearningWorld(progress, worlds, lang) {
  return [...worlds]
    .map((world) => {
      const stat = progress?.worlds?.[`${lang}:${world.id}`];
      const answers = Number(stat?.answers) || 0;
      const correct = Number(stat?.correct) || 0;
      return {
        world,
        answers,
        accuracy: answers ? Math.round((correct / answers) * 100) : 0,
      };
    })
    .filter((x) => x.answers >= 3)
    .sort((a, b) => b.accuracy - a.accuracy || b.answers - a.answers)[0] || null;
}
