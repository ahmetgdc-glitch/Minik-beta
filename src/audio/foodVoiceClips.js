const normalize = (text) => String(text || "").trim();

export const foodVoiceEntries = {
  de: {
    "Apfel": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f48ea557-ec4e-4ef8-b696-f416a5227575.mp3",
    "Banane": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/fcf201a1-abb5-438b-8a08-3f7283baf778.mp3",
    "Birne": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/cba61b94-f6f5-4b5f-99fb-fff922bbada8.mp3",
    "Erdbeere": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/2ef8ab7b-5e51-4f46-8ba2-6de3a565585a.mp3",
    "Trauben": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/6f18c398-a57f-4dda-8103-218160f0b4de.mp3",
  },
  tr: {
    "Elma": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f1be7efd-1d1d-43e1-a277-b582bf22dbbc.mp3",
    "Muz": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/836402ee-68fa-4e87-bfd2-b5e2f905e1b4.mp3",
    "Armut": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/15b2196e-fdeb-4825-a3e6-10276932065f.mp3",
    "Portakal": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/cd8b4648-e503-4361-a6e8-edb412117fb9.mp3",
    "Çilek": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/0b85264e-cfd5-4a69-be1a-f2524a2247ce.mp3",
    "Üzüm": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/9c077fa3-c3f3-4ce5-ad26-b7dbc30fff68.mp3",
  },
};

export function foodVoiceClip(text, lang = "de") {
  return foodVoiceEntries[lang]?.[normalize(text)] || "";
}

export const foodVoiceClipCount = Object.values(foodVoiceEntries).reduce(
  (sum, group) => sum + Object.keys(group).length,
  0,
);
