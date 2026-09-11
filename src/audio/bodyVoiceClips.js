const normalize = (text) => String(text || "").trim();

export const bodyVoiceEntries = {
  de: {
    "Auge": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/88c23569-86b2-4f1a-ab28-c6197a56dab0.mp3",
    "Ohr": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e2cee398-12cc-4468-87ce-0f0c9ceca578.mp3",
    "Nase": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f47920eb-7c2e-4238-84d1-ca14a9514be4.mp3",
    "Mund": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b400d002-32bb-4897-bf1d-91ad54763182.mp3",
    "Hand": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/728d71f7-f4c7-4a1f-855a-c29961e37dbc.mp3",
    "Fuß": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/25cfd673-999d-4ee1-ba61-0ddc5872f5b0.mp3",
    "Arm": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3cb78e76-6bc4-4ca1-9127-3e9d9d602897.mp3",
    "Bein": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e6a98e0b-e9c3-48d4-bce9-0a8056f663d0.mp3",
    "Zahn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f75a814a-79af-4144-af1e-fc473bc1c47b.mp3",
    "Zunge": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/baf77a4c-ec44-4478-af34-4834636174e3.mp3",
    "Gehirn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a0ad3f20-27fd-43c1-b7ff-a2b01acb4dba.mp3",
    "Herz": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/622a8e55-cce8-424a-9f48-d64158b0a4e9.mp3",
  },
  tr: {
    "Göz": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/9189ac4d-f3c3-4810-a042-267c8be3fdaf.mp3",
    "Kulak": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/94f4e82e-ac44-480d-92d4-7f7d2644eb15.mp3",
    "Burun": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/349a91cc-9c19-4f98-a5e4-06a443654840.mp3",
    "Ağız": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3bab8149-8b60-4fa9-b798-98bbae66f579.mp3",
    "El": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e9e507d6-2db1-4a36-adfc-480789aadbfd.mp3",
    "Ayak": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/cedc6f0e-756a-4610-a577-1230d138ee03.mp3",
    "Kol": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/90981eae-6af1-4eca-a7f3-94f9bbcf0ac0.mp3",
    "Bacak": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/cca404bc-f850-4a7e-a970-4ab80ddc912f.mp3",
    "Diş": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3c0a2273-463c-4e59-8d61-69639ddde853.mp3",
    "Dil": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/6ba02f8d-a7a5-48ce-80e4-e6b6702f3a23.mp3",
    "Beyin": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/83000286-ed58-4945-b703-00a4b233f314.mp3",
    "Kalp": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a67099ca-5282-4fe6-b737-e8cf11f89148.mp3",
  },
};

export function bodyVoiceClip(text, lang = "de") {
  return bodyVoiceEntries[lang]?.[normalize(text)] || "";
}

export const bodyVoiceClipCount = Object.values(bodyVoiceEntries)
  .reduce((sum, group) => sum + Object.keys(group).length, 0);
