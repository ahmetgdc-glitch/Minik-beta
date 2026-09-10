export const minoOutfits = [
  { id: "classic", stars: 0, symbol: "", de: "Mino klassisch", tr: "Klasik Mino" },
  { id: "party", stars: 40, symbol: "🎉", de: "Party-Mino", tr: "Parti Mino" },
  { id: "explorer", stars: 80, symbol: "🧢", de: "Entdecker-Mino", tr: "Kaşif Mino" },
  { id: "diver", stars: 140, symbol: "🤿", de: "Taucher-Mino", tr: "Dalgıç Mino" },
  { id: "artist", stars: 200, symbol: "🎨", de: "Künstler-Mino", tr: "Sanatçı Mino" },
  { id: "hero", stars: 260, symbol: "🦸", de: "Super-Mino", tr: "Süper Mino" },
  { id: "royal", stars: 320, symbol: "👑", de: "Königs-Mino", tr: "Kral Mino" },
];

export const outfitById = Object.fromEntries(minoOutfits.map((o) => [o.id, o]));
export const unlockedOutfits = (state) => minoOutfits.filter((o) => state.stars >= o.stars);
export const nextOutfit = (state) => minoOutfits.find((o) => state.stars < o.stars) || null;
export const normalizeOutfit = (id, stars = 0) => {
  const outfit = outfitById[id] || outfitById.classic;
  return stars >= outfit.stars ? outfit.id : "classic";
};
