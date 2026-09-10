import { sample, shuffle } from "../utils/random.js";
export function buildDifferenceRound(items) {
  const unique = items.filter((item, index, all) =>
    item?.id && all.findIndex((other) => other.id === item.id) === index,
  );
  if (unique.length < 2) return null;
  const [base, odd] = sample(unique, 2);
  const cells = shuffle([
    { key: `base-1-${base.id}`, item: base, odd: false },
    { key: `base-2-${base.id}`, item: base, odd: false },
    { key: `base-3-${base.id}`, item: base, odd: false },
    { key: `odd-${odd.id}`, item: odd, odd: true },
  ]);
  return { base, odd, cells };
}
