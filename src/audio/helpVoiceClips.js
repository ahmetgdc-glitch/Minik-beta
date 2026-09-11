const normalize = (text) => String(text || "").trim();

export const helpVoiceEntries = {
  de: {
    "Folge den leuchtenden Tasten.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d5550e08-7347-4549-965d-519ad71dca45.mp3",
  },
  tr: {
    "Parlayan tuşları takip et.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d5b92968-a360-4259-88f4-793c7c2b790f.mp3",
  },
};

export function helpVoiceClip(text, lang = "de") {
  return helpVoiceEntries[lang]?.[normalize(text)] || "";
}

export const helpVoiceClipCount = Object.values(helpVoiceEntries)
  .reduce((sum, group) => sum + Object.keys(group).length, 0);
