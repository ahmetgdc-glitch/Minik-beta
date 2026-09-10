export function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function sample(values, count) {
  return shuffle(values).slice(0, count);
}
export function choicesFor(target, pool, count = 2) {
  return shuffle([
    target,
    ...sample(
      pool.filter((item) => item.id !== target.id),
      count - 1,
    ),
  ]);
}
