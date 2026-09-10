export const oppositePairs = {
  feelings: [
    ["feelings.happy", "feelings.sad"],
    ["feelings.angry", "feelings.calm"],
    ["feelings.afraid", "feelings.calm"],
  ],
  weather: [
    ["weather.cold", "weather.warm"],
    ["weather.sunrise", "weather.night"],
  ],
  routines: [
    ["routines.wake", "routines.sleep"],
    ["routines.outside", "routines.rest"],
  ],
};

export function pairsForWorld(worldId, items) {
  const byId = new Map(items.map((item) => [item.id, item]));
  return (oppositePairs[worldId] || [])
    .map(([a, b]) => [byId.get(a), byId.get(b)])
    .filter(([a, b]) => a && b);
}
