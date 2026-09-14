// Presentation metadata only. World and item IDs remain the Beta 66 IDs.
export const sceneChapters = [
  {
    id: "outside",
    de: "Draußen",
    tr: "Dışarıda",
    asset: "sunflower",
    worlds: ["animals", "nature", "food", "weather", "sports"],
  },
  {
    id: "studio",
    de: "Bunte Werkstatt",
    tr: "Renkli atölye",
    asset: "artist-palette",
    worlds: ["colors", "shapes", "numbers", "letters", "school"],
  },
  {
    id: "town",
    de: "Unterwegs",
    tr: "Yoldayız",
    asset: "automobile",
    worlds: ["vehicles", "places", "jobs", "safety"],
  },
  {
    id: "home",
    de: "Bei uns",
    tr: "Bizim evde",
    asset: "house",
    worlds: ["home", "body", "feelings", "clothes", "people", "routines"],
  },
  {
    id: "wonder",
    de: "Wunderwelt",
    tr: "Harikalar",
    asset: "rocket",
    worlds: ["space", "music", "sounds", "actions", "toys"],
  },
];

const outside = new Set([
  "animals",
  "nature",
  "weather",
  "vehicles",
  "places",
  "sports",
  "safety",
]);
export function sceneForWorld(worldId) {
  return outside.has(worldId)
    ? "meadow"
    : worldId === "space"
      ? "archipelago"
      : "playroom";
}

// Lightweight landmarks give every destination its own place identity while
// reusing the existing local illustration library. They are presentation-only:
// no content, progress or routing IDs depend on this map.
export const sceneDecorations = Object.freeze({
  animals: ["deciduous-tree", "sunflower", "cloud"],
  nature: ["mountain", "rainbow", "deciduous-tree"],
  food: ["basket", "sunflower", "house"],
  weather: ["cloud-with-rain", "wind-face", "rainbow"],
  sports: ["trophy", "soccer-ball", "deciduous-tree"],
  colors: ["artist-palette", "rainbow", "balloon"],
  shapes: ["large-blue-diamond", "puzzle-piece", "balloon"],
  numbers: ["input-numbers", "game-die", "star"],
  letters: ["writing-hand", "crayon", "backpack"],
  school: ["backpack", "crayon", "woman-teacher"],
  vehicles: ["automobile", "cloud", "house"],
  places: ["castle", "house", "mountain"],
  jobs: ["woman-health-worker", "man-construction-worker", "woman-teacher"],
  safety: ["police-car", "ambulance", "rescue-workers-helmet"],
  home: ["house", "couch-and-lamp", "window"],
  body: ["anatomical-heart", "brain", "raised-hand"],
  feelings: ["smiling-face-with-hearts", "rainbow", "people-hugging"],
  clothes: ["dress", "billed-cap", "running-shoe"],
  people: ["family", "people-hugging", "house"],
  routines: ["alarm-clock", "toothbrush", "bed"],
  space: ["rocket", "crescent-moon", "star"],
  music: ["musical-notes", "drum", "musical-keyboard"],
  sounds: ["bell", "ear", "musical-notes"],
  actions: ["person-running", "clapping-hands", "woman-dancing"],
  toys: ["teddy-bear", "kite", "balloon"],
});

export function decorationsForWorld(worldId) {
  return sceneDecorations[worldId] || [];
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
  if (
    !Number.isFinite(width) ||
    width <= 0 ||
    !Number.isFinite(scrollLeft) ||
    count < 1
  )
    return 0;
  return Math.max(0, Math.min(count - 1, Math.round(scrollLeft / width)));
}

export function explorationSize(difficulty) {
  return difficulty >= 6 ? 6 : difficulty >= 4 ? 4 : 2;
}

export function addDiscovery(found, id, allowedIds) {
  if (!allowedIds.includes(id) || found.includes(id)) return found;
  return [...found, id];
}
