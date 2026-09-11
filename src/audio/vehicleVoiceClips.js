const normalize = (text) => String(text || "").trim();

export const vehicleVoiceEntries = {
  de: {
    "Auto": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b67c57aa-9a73-471d-aecb-1dfca54d6ba5.mp3",
    "Bus": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/440594ab-b3d6-4a44-8434-83961b829349.mp3",
    "Zug": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/114738b7-192c-422c-a843-36cf504d88d1.mp3",
    "Fahrrad": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b454350d-bf61-448c-8cd1-9f6b03d9eae3.mp3",
  },
  tr: {
    "Araba": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/7a851673-c843-459c-9b98-a85f9cd2bfb2.mp3",
    "Otobüs": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/eddfd9c3-981d-46bc-a1a2-a60163fc02ed.mp3",
    "Tren": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/97cbdab4-ca5d-4d4e-9b56-4571c0022e33.mp3",
    "Bisiklet": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b8be0042-48b8-446f-b5f9-2b56ceebdf20.mp3",
  },
};

export function vehicleVoiceClip(text, lang = "de") {
  return vehicleVoiceEntries[lang]?.[normalize(text)] || "";
}

export const vehicleVoiceClipCount = Object.values(vehicleVoiceEntries)
  .reduce((sum, group) => sum + Object.keys(group).length, 0);
