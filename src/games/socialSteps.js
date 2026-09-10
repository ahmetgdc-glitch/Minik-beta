export const socialSafetySequences = [
  {
    id: "crossing",
    title: {
      de: "Sicher über die Straße",
      tr: "Yoldan güvenle geç",
    },
    steps: ["safety.stop", "safety.look", "safety.cross"],
  },
  {
    id: "bike",
    title: {
      de: "Sicher Fahrrad fahren",
      tr: "Bisiklete güvenle bin",
    },
    steps: ["safety.helmet", "safety.bike", "safety.safe"],
  },
  {
    id: "car",
    title: {
      de: "Sicher im Auto",
      tr: "Arabada güvende ol",
    },
    steps: ["safety.seat", "safety.belt", "safety.safe"],
  },
  {
    id: "hot",
    title: {
      de: "Etwas ist heiß",
      tr: "Bir şey çok sıcak",
    },
    steps: ["safety.hot", "safety.adult", "safety.safe"],
  },
  {
    id: "kitchen",
    title: {
      de: "Sicher in der Küche",
      tr: "Mutfakta güvende ol",
    },
    steps: ["safety.sharp", "safety.adult", "safety.safe"],
  },
  {
    id: "lost",
    title: {
      de: "Wenn du unsicher bist",
      tr: "Kendini güvensiz hissedersen",
    },
    steps: ["safety.stranger", "safety.adult", "safety.safe"],
  },
];

export function buildSocialSafetyRounds(items) {
  const byId = new Map((items || []).map((item) => [item.id, item]));
  return socialSafetySequences
    .map((sequence) => ({
      ...sequence,
      items: sequence.steps.map((id) => byId.get(id)),
    }))
    .filter((sequence) => sequence.items.every(Boolean));
}
