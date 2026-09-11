const normalize = (text) => String(text || "").trim();

export const foodVoiceEntries = {
  de: {
    "Apfel": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f48ea557-ec4e-4ef8-b696-f416a5227575.mp3",
    "Banane": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/fcf201a1-abb5-438b-8a08-3f7283baf778.mp3",
    "Birne": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/cba61b94-f6f5-4b5f-99fb-fff922bbada8.mp3",
    "Erdbeere": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/2ef8ab7b-5e51-4f46-8ba2-6de3a565585a.mp3",
    "Trauben": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/6f18c398-a57f-4dda-8103-218160f0b4de.mp3",
    "Wassermelone": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8b82fd0d-b436-49e6-b488-ee9832471291.mp3",
    "Kirschen": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f8ca13f2-22c4-42d1-bff5-231b6b003347.mp3",
    "Pfirsich": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/1b76a629-c135-419b-88c3-c693df8f0d79.mp3",
    "Zitrone": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/ed50c069-a9d3-4d4a-b0ee-263ab0146aa2.mp3",
    "Ananas": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/7acca4da-068f-4316-8cdc-2dae72cecaaa.mp3",
    "Kiwi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/fdc5813e-559a-4cb3-adbd-6ae83b50a1dd.mp3",
  },
  tr: {
    "Elma": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f1be7efd-1d1d-43e1-a277-b582bf22dbbc.mp3",
    "Muz": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/836402ee-68fa-4e87-bfd2-b5e2f905e1b4.mp3",
    "Armut": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/15b2196e-fdeb-4825-a3e6-10276932065f.mp3",
    "Portakal": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/cd8b4648-e503-4361-a6e8-edb412117fb9.mp3",
    "Çilek": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/0b85264e-cfd5-4a69-be1a-f2524a2247ce.mp3",
    "Üzüm": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/9c077fa3-c3f3-4ce5-ad26-b7dbc30fff68.mp3",
    "Karpuz": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3f81a860-8555-4b21-8c6d-32fd5ebf1d40.mp3",
    "Kiraz": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/72bd674d-ddfa-4247-972e-3f914af3c9b1.mp3",
    "Şeftali": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8daab45d-80bf-4839-bf37-be9303c83431.mp3",
    "Limon": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/1a080dce-5572-408a-9e86-34ab9ada5419.mp3",
    "Ananas": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/eca68cdc-7e6c-4e75-a6ef-111ba0eda4b6.mp3",
    "Kivi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/568ede53-3321-4de7-9620-b8f43fe0a04c.mp3",
  },
};

export function foodVoiceClip(text, lang = "de") {
  return foodVoiceEntries[lang]?.[normalize(text)] || "";
}

export const foodVoiceClipCount = Object.values(foodVoiceEntries).reduce(
  (sum, group) => sum + Object.keys(group).length,
  0,
);
