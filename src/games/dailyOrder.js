export const routineSequence = [
  "routines.wake",
  "routines.teeth",
  "routines.dress",
  "routines.breakfast",
  "routines.school",
  "routines.learn",
  "routines.lunch",
  "routines.play",
  "routines.family",
  "routines.bath",
  "routines.pajama",
  "routines.story",
  "routines.sleep",
];

export function orderPairs(items) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered = routineSequence.map((id) => byId.get(id)).filter(Boolean);
  return ordered.slice(0, -1).map((item, i) => [item, ordered[i + 1]]);
}
