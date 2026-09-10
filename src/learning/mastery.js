export function itemMastery(progress, itemId, lang = progress.settings?.lang || "de") {
  const m = progress.mastery?.[`${lang}:${itemId}`] || {};
  const independent = Number(m.independent || 0);
  const wrong = Number(m.wrong || 0);
  const correct = Number(m.correct || 0);
  const attempts = correct + wrong;

  if (independent >= 3 && wrong <= independent + 1) {
    return { level: "mastered", independent, wrong, correct, attempts };
  }
  if (attempts >= 2 && wrong > independent) {
    return { level: "practice", independent, wrong, correct, attempts };
  }
  if (attempts > 0 || independent > 0) {
    return { level: "learning", independent, wrong, correct, attempts };
  }
  return { level: "new", independent, wrong, correct, attempts };
}

export function worldMastery(progress, world, lang = progress.settings?.lang || "de") {
  const states = world.items.map((item) => itemMastery(progress, item.id, lang));
  const mastered = states.filter((s) => s.level === "mastered").length;
  const practice = states.filter((s) => s.level === "practice").length;
  const learning = states.filter((s) => s.level === "learning").length;
  const seen = states.filter((s) => s.level !== "new").length;
  const total = states.length;
  return {
    mastered,
    practice,
    learning,
    seen,
    total,
    percent: total ? Math.round((mastered / total) * 100) : 0,
  };
}
