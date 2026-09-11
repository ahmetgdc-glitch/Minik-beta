const normalize = (text) => String(text || "").trim();

export const numberVoiceEntries = {
  de: {
    "Elf": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/565aaca3-d08c-4874-beaa-50eaed08ed88.mp3",
    "Zwölf": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/75b261b1-f72c-4191-9324-87c0744e3673.mp3",
    "Dreizehn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a8808f13-3af6-415b-8bcc-6f7407078312.mp3",
    "Vierzehn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a5add655-b046-4f2b-b1ba-2f5a2017a1ca.mp3",
    "Fünfzehn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/0b82f075-003c-421e-8276-16535da43c7c.mp3",
    "Sechzehn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b40902a3-4bab-4bc3-9707-325d72c3d6d3.mp3",
    "Siebzehn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/ff826d6f-f7b2-4b19-b92d-b4bc7264ee69.mp3",
    "Achtzehn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a76c34fe-4d24-409e-a0e0-a4f0017b9a74.mp3",
    "Neunzehn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/72d49787-2f84-4a0c-b848-d80e1460825e.mp3",
    "Zwanzig": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f00c6f72-1133-4bc6-9ca6-859fe724bbab.mp3",
  },
  tr: {
    "On bir": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/6408b859-e9c2-411d-8e02-136858767dad.mp3",
    "On iki": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/bd513e27-29bd-411c-8b97-a41946a78601.mp3",
    "On üç": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d5fd687b-20ce-4da9-92a3-d1792e54b2f0.mp3",
    "On dört": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/1546b492-8f4d-42e4-a82d-547b9feda129.mp3",
    "On beş": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/048b08c2-28ad-45bb-bca8-eb99bec50d94.mp3",
    "On altı": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/390b68c9-1fb6-4336-b13a-03b272e34571.mp3",
    "On yedi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/c5025033-dad4-4f65-800d-b548d55270b6.mp3",
    "On sekiz": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/721db098-9344-47e5-ae67-edbe46aad451.mp3",
    "On dokuz": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/4703f39f-3227-44f4-983c-df0c310bb313.mp3",
    "Yirmi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/972eaf63-6e6f-48c2-9340-0ad9c95e3113.mp3",
  },
};

export function numberVoiceClip(text, lang = "de") {
  return numberVoiceEntries[lang]?.[normalize(text)] || "";
}

export const numberVoiceClipCount = Object.values(numberVoiceEntries)
  .reduce((sum, group) => sum + Object.keys(group).length, 0);
