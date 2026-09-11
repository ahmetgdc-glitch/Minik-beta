import { gameVoiceClip } from "./gameVoiceClips.js";
import {
  foodVoiceClip,
  foodVoiceClipCount,
  foodVoiceEntries,
} from "./foodVoiceClips.js";
import {
  helpVoiceClip,
  helpVoiceClipCount,
  helpVoiceEntries,
} from "./helpVoiceClips.js";
import {
  categoryVoiceClip,
  categoryVoiceClipCount,
  categoryVoiceEntries,
} from "./categoryVoiceClips.js";

const normalize = (text) => String(text || "").trim();
const stripEnd = (text) => normalize(text).replace(/[.!?]+$/u, "").trim();
const preloaded = new Map();

const PHRASES = {
  de: {
    "Hallo! Komm, wir entdecken die Welt!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/9376d8c3-bd01-4e04-9fec-cd4e40d28d0f.mp3",
    "Wohin möchtest du? Tippe auf ein Bild.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/45adc209-d3d2-43c1-ba74-bd9b65836bf1.mp3",
    "Schön, dass du da bist!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/79087717-915e-4825-a611-dc8d9d00040e.mp3",
    "Hallo, ich bin Mino!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8a396277-8bcb-4b77-b6a5-4b0353bcf364.mp3",
    "Finde dieses Bild.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/7fe8576b-6d3f-43dc-bfb9-bc0e279417df.mp3",
    "Mit welchem Buchstaben beginnt das Wort?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/54276862-60a3-4cb3-9c63-e825d2ba327e.mp3",
    "Drei Bilder sind gleich. Finde das andere.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b830f7f0-1f24-433e-9bf4-39984a55edae.mp3",
    "Welches Bild kommt als Nächstes?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/791aa8cb-164c-4c08-986e-ce2efbf9dd41.mp3",
    "Schau dir die Bilder gut an.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/c9385070-bc79-4766-b50a-c05e76f35c90.mp3",
    "Was sieht Mino zum Schluss?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/9452c6e2-e242-4c05-bf24-e458376e7ea8.mp3",
    "Sprich mir nach.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/88a42dc3-64e1-4ef5-a005-679608bf2bb4.mp3",
    "Fahre die Spur nach. Starte am grünen Punkt.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8fe4c85f-0d14-4c8d-af92-9a6722678b9e.mp3",
    "Das wiederholen wir noch einmal.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/7049a5d4-a64f-4a1b-93b4-3bb7e58101f8.mp3",
    "Tippe auf dieses Bild.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/38f4ab97-9cc8-41a9-8d19-aae2be010d82.mp3",
    "Was ist das Gegenteil?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e11ad4ef-1a25-4b0b-89c8-9500bdb3bfc8.mp3",
    "Was kommt danach?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/adc49683-6915-4d6f-a48e-14efa86a7501.mp3",
    "Als Nächstes kommt:": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/4ab987ed-cd0a-4285-8a19-f2335540d916.mp3",
  },
  tr: {
    "Merhaba! Haydi dünyayı keşfedelim!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/437aeecc-5ab2-4b53-9ebf-42176f604168.mp3",
    "Nereye gidelim? Bir resme dokun.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8403e365-f2af-4edb-a761-3d26c390650f.mp3",
    "İyi ki geldin!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b128c2cb-b526-4563-862b-4c3e8d8af7e0.mp3",
    "Merhaba, ben Mino!": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/59206d17-3fe6-4bff-b6ff-b1d34a8ce50c.mp3",
    "Bu resmi bul.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8cba0837-58b1-452c-bcc0-c2e2110b2739.mp3",
    "Bu kelime hangi harfle başlıyor?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/30884798-38e3-45c4-8bd4-f12a1158c8f0.mp3",
    "Üç resim aynı. Farklı olanı bul.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e462b6e1-6846-463c-9087-ee18988ef8b3.mp3",
    "Sırada hangi resim var?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/05433168-8386-4496-a6a6-cba26d4011a5.mp3",
    "Resimlere dikkatle bak.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d005cab2-6fed-4102-83e3-1e4465f11f82.mp3",
    "Mino en son ne görüyor?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/bf757ed3-4958-47f2-a1c5-91ee334f6420.mp3",
    "Benimle söyle.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e7bd6dc8-0298-44f0-9d1f-48bdee05abe8.mp3",
    "İzi takip et. Yeşil noktadan başla.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/36dfed75-dec9-41a1-987f-6d86a6a1619a.mp3",
    "Bir kez daha hatırlayalım.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/51092f45-122e-4600-ae94-11c38be22d97.mp3",
    "Bu resmi seç.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/f2b5547e-680e-4296-b7c7-6afb163a1237.mp3",
    "Bunun zıttı hangisi?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/7026f8c9-9e8d-443d-9fef-2702601e4178.mp3",
    "Sonra ne gelir?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/c653dce8-27e8-4f73-bf36-a7346aaf2621.mp3",
    "Sırada:": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/039d066f-fb6c-4c97-888a-a7672e9245bc.mp3",
  },
};

export function naturalPhraseClip(text, lang = "de") {
  return PHRASES[lang]?.[normalize(text)] || "";
}

function recordedClip(text, lang) {
  return naturalPhraseClip(text, lang) || helpVoiceClip(text, lang) || categoryVoiceClip(text, lang) || gameVoiceClip(text, lang) || foodVoiceClip(text, lang);
}

function resolve(parts, lang) {
  const urls = parts.map((part) => recordedClip(part, lang));
  return urls.length && urls.every(Boolean) ? urls : [];
}

export function naturalVoicePlan(text, lang = "de") {
  const value = normalize(text);
  if (!value) return [];
  const exact = recordedClip(value, lang);
  if (exact) return [exact];

  let match;
  if (lang === "tr") {
    match = value.match(/^(.+?)\s+nerede\?$/u);
    if (match) return resolve(["Bu resmi bul.", stripEnd(match[1])], lang);

    match = value.match(/^(.+?)\s+nerede\?\s+Bir kez daha hatırlayalım\.$/u);
    if (match) return resolve(["Bu resmi bul.", stripEnd(match[1]), "Bir kez daha hatırlayalım."], lang);

    match = value.match(/^(.+?)\.\s+Bu resmi seç\.$/u);
    if (match) return resolve([stripEnd(match[1]), "Bu resmi seç."], lang);

    match = value.match(/^Hangi sepete ait\?\s*(.+?)\.?$/u);
    if (match) return resolve(["Hangi sepete ait?", stripEnd(match[1])], lang);

    match = value.match(/^(.+?)\s+hangi harfle başlıyor\?$/u);
    if (match) return resolve([stripEnd(match[1]), "Bu kelime hangi harfle başlıyor?"], lang);

    match = value.match(/^Benimle söyle:\s*(.+?)\.?$/u);
    if (match) return resolve(["Benimle söyle.", stripEnd(match[1])], lang);

    match = value.match(/^(.+?)\.\s+Bunun zıttı hangisi\?$/u);
    if (match) return resolve([stripEnd(match[1]), "Bunun zıttı hangisi?"], lang);

    match = value.match(/^(.+?)\s+sonrasında ne gelir\?$/u);
    if (match) return resolve([stripEnd(match[1]), "Sonra ne gelir?"], lang);

    match = value.match(/^(.+?)\s+sonrasında\s+(.+?)\s+gelir\.$/u);
    if (match) return resolve([stripEnd(match[1]), "Sırada:", stripEnd(match[2])], lang);

    match = value.match(/^(.+?),\s*sonra\s+(.+?),\s*ardından\s+(.+?)\.?$/u);
    if (match) return resolve([stripEnd(match[1]), stripEnd(match[2]), stripEnd(match[3])], lang);

    if (/Yeşil noktadan başla\.?$/u.test(value)) {
      return resolve(["İzi takip et. Yeşil noktadan başla."], lang);
    }
  } else {
    match = value.match(/^Finde:\s*(.+?)\.?$/u);
    if (match) return resolve(["Finde dieses Bild.", stripEnd(match[1])], lang);

    match = value.match(/^Wo ist\s+(.+?)\?\s+Das wiederholen wir noch einmal\.$/u);
    if (match) return resolve(["Finde dieses Bild.", stripEnd(match[1]), "Das wiederholen wir noch einmal."], lang);

    match = value.match(/^(.+?)\.\s+Tippe auf dieses Bild\.$/u);
    if (match) return resolve([stripEnd(match[1]), "Tippe auf dieses Bild."], lang);

    match = value.match(/^In welchen Korb gehört das\?\s*(.+?)\.?$/u);
    if (match) return resolve(["In welchen Korb gehört das?", stripEnd(match[1])], lang);

    match = value.match(/^Mit welchem Buchstaben beginnt\s+(.+?)\?$/u);
    if (match) return resolve([stripEnd(match[1]), "Mit welchem Buchstaben beginnt das Wort?"], lang);

    match = value.match(/^Sprich mir nach:\s*(.+?)\.?$/u);
    if (match) return resolve(["Sprich mir nach.", stripEnd(match[1])], lang);

    match = value.match(/^(.+?)\.\s+Was ist das Gegenteil\?$/u);
    if (match) return resolve([stripEnd(match[1]), "Was ist das Gegenteil?"], lang);

    match = value.match(/^Was kommt nach\s+(.+?)\?$/u);
    if (match) return resolve([stripEnd(match[1]), "Was kommt danach?"], lang);

    match = value.match(/^Nach\s+(.+?)\s+kommt\s+(.+?)\.$/u);
    if (match) return resolve([stripEnd(match[1]), "Als Nächstes kommt:", stripEnd(match[2])], lang);

    match = value.match(/^(.+?),\s*dann\s+(.+?),\s*danach\s+(.+?)\.?$/u);
    if (match) return resolve([stripEnd(match[1]), stripEnd(match[2]), stripEnd(match[3])], lang);

    if (/Starte am grünen Punkt\.?$/u.test(value)) {
      return resolve(["Fahre die Spur nach. Starte am grünen Punkt."], lang);
    }
  }
  return [];
}

export function preloadNaturalVoicePlans(lang) {
  if (typeof Audio === "undefined") return 0;
  const phraseGroups = lang && PHRASES[lang] ? [PHRASES[lang]] : Object.values(PHRASES);
  const helpGroups = lang && helpVoiceEntries[lang]
    ? [helpVoiceEntries[lang]]
    : Object.values(helpVoiceEntries);
  const categoryGroups = lang && categoryVoiceEntries[lang]
    ? [categoryVoiceEntries[lang]]
    : Object.values(categoryVoiceEntries);
  const foodGroups = lang && foodVoiceEntries[lang]
    ? [foodVoiceEntries[lang]]
    : Object.values(foodVoiceEntries);
  const groups = [...phraseGroups, ...helpGroups, ...categoryGroups, ...foodGroups];
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

export const naturalVoicePlanClipCount =
  Object.values(PHRASES).reduce((sum, group) => sum + Object.keys(group).length, 0) +
  helpVoiceClipCount +
  categoryVoiceClipCount +
  foodVoiceClipCount;
