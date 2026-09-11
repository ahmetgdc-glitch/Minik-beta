const normalize = (text) => String(text || "").trim();
const preloaded = new Map();

const CLIPS = {
  de: {
    "Super gemacht!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/78c4d748-f6a6-4be3-9e22-645efe0eb14b.mp3",
    "Wunderbar!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/61796136-dbc6-48ad-b904-d6cdd684bd16.mp3",
    "Das hast du toll gemacht!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a08d4a8d-7d9c-42ce-804c-1075acd5138b.mp3",
    "Schau noch einmal.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/2dffb241-e08b-4a8e-a331-00a88a8a44e4.mp3",
    "Soll ich dir helfen?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/80436496-d421-49d8-b851-fd8767f7f2c8.mp3",
    "Schau mal! Tippe auf das Bild.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/26f13859-7be9-4314-94cd-306834aa08b1.mp3",
    "Tippe zwei Teile an und tausche sie.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a3e3d422-d8be-46c2-8094-d10ea2971f7e.mp3",
    "Finde zwei gleiche Bilder.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3642288d-3643-44e0-8a11-aef818c1a055.mp3",
    "Bring das Bild zu seinem Zwilling.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/ab73617a-7303-43fd-b6ad-1eef1607bccc.mp3",
  },
  tr: {
    "Harika!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e3d0dbf1-3f7e-4808-aa2d-080742f7db36.mp3",
    "Çok güzel yaptın!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f60ab1c3-53ed-4b02-95a6-4fa7c6528f36.mp3",
    "Bir daha bak.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/bdd859a8-182a-4860-82f0-24c8b8c278c4.mp3",
    "Sana yardım edeyim mi?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a76dc9cf-34f6-4e99-a9a7-96564613182f.mp3",
    "Bak bakalım! Resme dokun.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/ac66daf6-b54a-43a2-a204-4ba5f8746eea.mp3",
    "İki parçaya dokun, yerlerini değiştir.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/20cb385a-b9de-43eb-a30d-92fd3d160f2c.mp3",
    "Aynı iki resmi bul.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/1d439ed8-910c-445b-9e1e-d61777b0a561.mp3",
    "Resmi eşine götür.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/ed815b11-e8c3-4d9e-a215-f3f40900ce76.mp3",
  },
};

export function gameVoiceClip(text, lang = "de") {
  return CLIPS[lang]?.[normalize(text)] || "";
}

export function hasGameVoiceClip(text, lang = "de") {
  return Boolean(gameVoiceClip(text, lang));
}

export function preloadGameVoiceClips(lang) {
  if (typeof Audio === "undefined") return 0;
  const groups = lang && CLIPS[lang] ? [CLIPS[lang]] : Object.values(CLIPS);
  let added = 0;
  for (const group of groups) {
    for (const url of Object.values(group)) {
      if (preloaded.has(url)) continue;
      try {
        const audio = new Audio();
        audio.preload = "auto";
        audio.src = url;
        audio.load?.();
        preloaded.set(url, audio);
        added++;
      } catch {}
    }
  }
  return added;
}

export const gameVoiceClipCount = Object.values(CLIPS).reduce(
  (sum, group) => sum + Object.keys(group).length,
  0,
);
