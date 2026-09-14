export const DIFFICULTY_LEVELS = Object.freeze({
  2: Object.freeze({
    id: "easy",
    value: 2,
    de: "Leicht",
    tr: "Kolay",
    options: 2,
    sequenceLength: 2,
    memoryPairs: 2,
    puzzlePieces: 4,
    explorationObjects: 2,
    countMax: 5,
    previewMs: 1700,
    wrongRevealMs: 1100,
    hintDelayMs: 4500,
    helpDelayMs: 8000,
    hintAfterMistakes: 1,
    demoAfterMistakes: 2,
  }),
  4: Object.freeze({
    id: "medium",
    value: 4,
    de: "Mittel",
    tr: "Orta",
    options: 4,
    sequenceLength: 3,
    memoryPairs: 4,
    puzzlePieces: 6,
    explorationObjects: 4,
    countMax: 10,
    previewMs: 1200,
    wrongRevealMs: 850,
    hintDelayMs: 6500,
    helpDelayMs: 11000,
    hintAfterMistakes: 2,
    demoAfterMistakes: 3,
  }),
  6: Object.freeze({
    id: "hard",
    value: 6,
    de: "Schwer",
    tr: "Zor",
    options: 6,
    sequenceLength: 4,
    memoryPairs: 6,
    puzzlePieces: 9,
    explorationObjects: 6,
    countMax: 20,
    previewMs: 800,
    wrongRevealMs: 650,
    hintDelayMs: 9000,
    helpDelayMs: 15000,
    hintAfterMistakes: 3,
    demoAfterMistakes: 4,
  }),
});

export function normalizeDifficulty(value) {
  const n = Number(value);
  return n >= 6 ? 6 : n >= 4 ? 4 : 2;
}

export function difficultyProfile(value) {
  return DIFFICULTY_LEVELS[normalizeDifficulty(value)];
}

export function difficultyLabel(value, lang = "de") {
  const profile = difficultyProfile(value);
  return lang === "tr" ? profile.tr : profile.de;
}
