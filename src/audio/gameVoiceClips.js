const normalize = (text) => String(text || "").trim();

const CLIPS = {
  de: {
    "Super gemacht!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/78c4d748-f6a6-4be3-9e22-645efe0eb14b.mp3",
    "Wunderbar!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/61796136-dbc6-48ad-b904-d6cdd684bd16.mp3",
    "Das hast du toll gemacht!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a08d4a8d-7d9c-42ce-804c-1075acd5138b.mp3",
    "Schau noch einmal.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/2dffb241-e08b-4a8e-a331-00a88a8a44e4.mp3",
    "Soll ich dir helfen?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/80436496-d421-49d8-b851-fd8767f7f2c8.mp3",
  },
  tr: {
    "Harika!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e3d0dbf1-3f7e-4808-aa2d-080742f7db36.mp3",
    "Çok güzel yaptın!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f60ab1c3-53ed-4b02-95a6-4fa7c6528f36.mp3",
    "Bir daha bak.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/bdd859a8-182a-4860-82f0-24c8b8c278c4.mp3",
    "Sana yardım edeyim mi?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a76dc9cf-34f6-4e99-a9a7-96564613182f.mp3",
  },
};

export function gameVoiceClip(text, lang = "de") {
  return CLIPS[lang]?.[normalize(text)] || "";
}

export function hasGameVoiceClip(text, lang = "de") {
  return Boolean(gameVoiceClip(text, lang));
}

export const gameVoiceClipCount = Object.values(CLIPS).reduce(
  (sum, group) => sum + Object.keys(group).length,
  0,
);
