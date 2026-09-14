export const MUSIC_STYLE_STORAGE_KEY = "minik_music_style_v1";

export const MUSIC_STYLES = Object.freeze([
  Object.freeze({
    id: "playful",
    icon: "✨",
    de: "Spielwiese",
    tr: "Oyun bahçesi",
    descriptionDe: "Leicht, fröhlich und neugierig.",
    descriptionTr: "Hafif, neşeli ve meraklı.",
    notes: Object.freeze([261.6, 329.6, 392, 329.6, 293.7, 349.2, 440, 349.2]),
    intervalMs: 720,
    duration: 0.62,
    type: "triangle",
    volume: 0.018,
    octaveEcho: 0,
  }),
  Object.freeze({
    id: "calm",
    icon: "☁️",
    de: "Wolkenruhe",
    tr: "Bulut sakinliği",
    descriptionDe: "Ruhig und weich für konzentriertes Lernen.",
    descriptionTr: "Odaklanmak için sakin ve yumuşak.",
    notes: Object.freeze([261.6, 392, 329.6, 392, 293.7, 440, 349.2, 392]),
    intervalMs: 980,
    duration: 0.86,
    type: "sine",
    volume: 0.013,
    octaveEcho: 0.18,
  }),
  Object.freeze({
    id: "adventure",
    icon: "🚀",
    de: "Kleine Reise",
    tr: "Küçük macera",
    descriptionDe: "Etwas lebendiger für Entdecken und Spielen.",
    descriptionTr: "Keşif ve oyun için biraz daha hareketli.",
    notes: Object.freeze([293.7, 392, 440, 349.2, 329.6, 440, 493.9, 392]),
    intervalMs: 590,
    duration: 0.5,
    type: "triangle",
    volume: 0.016,
    octaveEcho: 0.12,
  }),
]);

export const MUSIC_OFF = Object.freeze({
  id: "off",
  icon: "🔇",
  de: "Musik aus",
  tr: "Müzik kapalı",
  descriptionDe: "Stimme und Geräusche bleiben aktiv.",
  descriptionTr: "Seslendirme ve efektler açık kalır.",
  notes: Object.freeze([]),
  intervalMs: 0,
  duration: 0,
  type: "sine",
  volume: 0,
  octaveEcho: 0,
});

export function normalizeMusicStyle(value) {
  return MUSIC_STYLES.some((style) => style.id === value) ? value : value === "off" ? "off" : "playful";
}

export function getMusicStyle() {
  if (typeof window === "undefined") return "playful";
  try {
    return normalizeMusicStyle(window.localStorage.getItem(MUSIC_STYLE_STORAGE_KEY));
  } catch {
    return "playful";
  }
}

export function setMusicStyle(value) {
  const next = normalizeMusicStyle(value);
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(MUSIC_STYLE_STORAGE_KEY, next); } catch {}
  }
  return next;
}

export function musicStyleProfile(value = getMusicStyle()) {
  const id = normalizeMusicStyle(value);
  return id === "off" ? MUSIC_OFF : MUSIC_STYLES.find((style) => style.id === id) || MUSIC_STYLES[0];
}
