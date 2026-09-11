const normalize = (text) => String(text || "").trim();

export const helpVoiceEntries = {
  de: {
    "Folge den leuchtenden Tasten.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d5550e08-7347-4549-965d-519ad71dca45.mp3",
    "Wische und entdecke die anderen Bilder.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/adca6522-bb16-40dc-8736-9fe589ca5f98.mp3",
    "Tippe auf ein Bild und dann auf seinen Zwilling.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f813e9de-287a-444b-b9c5-b5846fbb3b8b.mp3",
    "Schau genau auf die Form.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a18b29e7-a0e2-4989-9105-562fa385651b.mp3",
    "Hör das Geräusch noch einmal genau an.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8b91d904-69de-427d-8016-c1f4d8d0ee2e.mp3",
    "Schau, welches Bild sich wiederholt.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/739c86b0-6e6c-4411-b959-82860fd872a3.mp3",
    "Denk an die Reihe von eben.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/5fca0836-58d1-46f7-bd9a-6f62ff0bfff5.mp3",
  },
  tr: {
    "Parlayan tuşları takip et.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d5b92968-a360-4259-88f4-793c7c2b790f.mp3",
    "Kaydır ve diğer resimleri keşfet.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f7991fb0-55ef-4f33-a4b4-99c0ce46c974.mp3",
    "Önce resmi, sonra eşini seç.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/ca64d71c-9102-411e-94b0-3de471cf88d0.mp3",
    "Şekle dikkatlice bak.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/7a9f3d5d-fa42-448c-870c-a04912189d7c.mp3",
    "Sesi bir kez daha dikkatle dinle.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/057b5a35-db0d-47c0-bdbd-bf129a12e59f.mp3",
    "Hangi resmin tekrar ettiğine bak.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/25ce175c-48f0-4c33-acde-ceda36542152.mp3",
    "Az önceki sırayı hatırla.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/19af7d7b-ee89-437d-8cca-3bfaaac75fdb.mp3",
  },
};

export function helpVoiceClip(text, lang = "de") {
  return helpVoiceEntries[lang]?.[normalize(text)] || "";
}

export const helpVoiceClipCount = Object.values(helpVoiceEntries)
  .reduce((sum, group) => sum + Object.keys(group).length, 0);
