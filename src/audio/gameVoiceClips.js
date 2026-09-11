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
    "Wie viele sind es?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/209ff11b-ec01-46e4-99c5-6e61a40beee5.mp3",
    "Folge dem grünen Punkt.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/28febea4-cdba-47a4-bef5-41196a0cacf5.mp3",
    "Wir drehen die Karten zusammen um.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/6fc0b29a-4e95-4f4b-a80e-a6b1bde09881.mp3",
    "Schau auf das kleine Vorbild.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8e559f66-8d9a-415b-b18a-1271fc9ebf2b.mp3",
    "Tippe jedes Bild einmal an und zähle mit.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3eb6681e-fbb7-483d-8b2f-77e63c69990c.mp3",
    "In welchen Korb gehört das?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/4021889f-8153-4aa2-aa4d-0533f623d33c.mp3",
    "Hör zu und spiele die Melodie nach.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/923f99bb-834b-4fea-b051-bccabafc8996.mp3",
    "Hör genau hin. Was klingt so?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/ad72450d-ca86-4f9f-b710-876f097fd598.mp3",
    "Zu welchem Bild gehört der Schatten?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a146d0e6-8f41-44c3-af2d-6fda1aee07a0.mp3",
    "Rot": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/aad018ed-9d25-402f-8302-d7f517a1f37c.mp3",
    "Blau": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d0a7f727-afc7-4ad3-8eb7-61d12f28b46b.mp3",
    "Gelb": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/7def4071-cb7d-4b6b-ba2c-8f9c9c19306a.mp3",
    "Grün": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e1b2d992-59ad-4664-8940-86a406f78f97.mp3",
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
    "Kaç tane var?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/bc9f7bf1-f89b-4a29-8100-e576744b1d70.mp3",
    "Yeşil noktayı takip et.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b4ad25a0-1a12-4bb7-b637-24fb0aed9411.mp3",
    "Kartları birlikte çevirelim.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/24aad09e-7b89-4491-b81d-c4fd24dbbc9e.mp3",
    "Küçük resme bak.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3e683442-9eb8-4909-9343-3b769968734b.mp3",
    "Her resme bir kez dokun ve say.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/c79c4594-6c7c-4ebc-8862-cb0e5fe2bf66.mp3",
    "Hangi sepete ait?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/2ffa01a5-0765-4568-ae67-13f5f7d4db55.mp3",
    "Dinle ve aynı melodiyi çal.": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e888d8e2-9b39-474b-b026-44716bc4b6b4.mp3",
    "Dinle. Bu ne sesi?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/ab4e2e00-1f39-4707-ae2c-bf9902a4fc03.mp3",
    "Bu gölge hangi resme ait?": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/62f84e5f-a5d6-4a31-b7d4-9239c32d94e1.mp3",
    "Kırmızı": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/c42f1d80-730a-446f-9e0f-6e201a012db9.mp3",
    "Mavi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e777b005-243d-4cdf-b444-c146f2cc5a89.mp3",
    "Sarı": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e1921ae7-2b3a-4dce-b8c9-6ab5c36b9569.mp3",
    "Yeşil": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/cfacb226-f943-48ba-9804-9064e7fe9f53.mp3",
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
