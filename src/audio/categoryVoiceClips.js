const normalize = (text) => String(text || "").trim();

export const categoryVoiceEntries = {
  de: {
    "Tiere": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8c474877-24fb-439a-a415-1997774da438.mp3",
    "Fahrzeuge": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/eba74b16-587f-4c6b-ba32-038ce578d0de.mp3",
    "Essen": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3604ade8-9f80-42bb-92c9-eed634aee4d0.mp3",
    "Kleidung": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/aa902b39-6c6c-4630-bcd4-8200acf34869.mp3",
    "Zuhause": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/263ed9e8-560e-4465-97d2-afb986e8567a.mp3",
    "Natur": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/4b11058c-6925-46c8-b336-27b9f1f5a0c3.mp3",
    "Spielzeug": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/749c5dda-edb1-4f57-8115-0aea7477ea4a.mp3",
  },
  tr: {
    "Hayvanlar": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f429fd11-471d-4304-aaa0-ff20bd26204d.mp3",
    "Araçlar": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/87290ae7-cc8f-4402-8b42-e86621841358.mp3",
    "Yiyecekler": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/18465b6b-0d81-4b77-9192-0373fd415708.mp3",
    "Kıyafetler": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/1768b9e3-4830-4b74-be36-32f612e0fd56.mp3",
    "Ev": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/157d6b4c-ec08-4df8-a9d0-222514ee3f01.mp3",
    "Doğa": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/7d20da4e-bdc8-46be-a87e-a15f9217d4a2.mp3",
    "Oyuncaklar": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/2c3a131f-609a-45b2-b5b5-2fe493a58a0e.mp3",
  },
};

export function categoryVoiceClip(text, lang = "de") {
  return categoryVoiceEntries[lang]?.[normalize(text)] || "";
}

export const categoryVoiceClipCount = Object.values(categoryVoiceEntries)
  .reduce((sum, group) => sum + Object.keys(group).length, 0);
