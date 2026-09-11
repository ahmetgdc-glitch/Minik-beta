// Presentation metadata only. World and item IDs remain the Beta 66 IDs.
export const sceneChapters = [
  { id: "outside", de: "Draußen", tr: "Dışarıda", asset: "sunflower", worlds: ["animals", "nature", "food", "weather", "sports"] },
  { id: "studio", de: "Bunte Werkstatt", tr: "Renkli atölye", asset: "artist-palette", worlds: ["colors", "shapes", "numbers", "letters", "school"] },
  { id: "town", de: "Unterwegs", tr: "Yoldayız", asset: "automobile", worlds: ["vehicles", "places", "jobs", "safety"] },
  { id: "home", de: "Bei uns", tr: "Bizim evde", asset: "house", worlds: ["home", "body", "feelings", "clothes", "people", "routines"] },
  { id: "wonder", de: "Wunderwelt", tr: "Harikalar", asset: "rocket", worlds: ["space", "music", "sounds", "actions", "toys"] },
];

const outside = new Set(["animals", "nature", "weather", "vehicles", "places", "sports", "safety"]);
export function sceneForWorld(worldId) {
  return outside.has(worldId) ? "meadow" : worldId === "space" ? "archipelago" : "playroom";
}

export function atlasPages(availableWorlds) {
  const available = new Set(availableWorlds.map((world) => world.id));
  return sceneChapters.flatMap((chapter) => {
    const ids = chapter.worlds.filter((id) => available.has(id));
    const pages = [];
    for (let index = 0; index < ids.length; index += 2) {
      pages.push({ chapter, ids: ids.slice(index, index + 2) });
    }
    return pages;
  });
}

export function sceneIndex(scrollLeft, width, count) {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(scrollLeft) || count < 1) return 0;
  return Math.max(0, Math.min(count - 1, Math.round(scrollLeft / width)));
}

export function explorationSize(difficulty) {
  return difficulty >= 6 ? 6 : difficulty >= 4 ? 4 : 2;
}

export function addDiscovery(found, id, allowedIds) {
  if (!allowedIds.includes(id) || found.includes(id)) return found;
  return [...found, id];
}
