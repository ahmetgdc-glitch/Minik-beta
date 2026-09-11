const normalize = (text) => String(text || "").trim();

export const animalVoiceEntries = {
  de: {
    "Löwe": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/4c99025d-0c4e-4e7c-9335-0a649b2707bb.mp3",
    "Hund": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/baf42a02-b2cc-4c85-994c-5230a31b7291.mp3",
    "Katze": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3c2d6b51-5e05-4f54-8332-6d1eb3f463d9.mp3",
    "Kuh": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/17bbad3e-d0a9-4e0b-98af-6fab82adf91b.mp3",
    "Pferd": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/42794f03-8d91-4d85-ab80-a78a045b5463.mp3",
    "Schaf": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/1ac3eee0-8cd6-43b3-ba11-e14e63990216.mp3",
    "Tiger": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/53d0b257-1926-4b73-a702-c2be84840881.mp3",
    "Affe": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b6f9f39a-9390-4ecf-ab19-153af12c0aab.mp3",
    "Kaninchen": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/675ee69a-b8b5-47d7-8f37-19b726ec0e49.mp3",
    "Bär": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3b108a81-6512-416c-93d8-e2045bfc6020.mp3",
    "Elefant": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/ed7e8a11-02c4-4784-ac8f-caddf3c68312.mp3",
    "Giraffe": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/c09c8d65-54fa-4ebe-9aed-194cc0f5778b.mp3",
    "Pinguin": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/0edaa00d-24e7-47b5-9695-bd8ffbbf4627.mp3",
    "Frosch": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b59a0762-b0fa-476f-b25a-6b136688469c.mp3",
    "Fisch": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/c77e3131-57b0-4e7b-a0df-e616f37146dd.mp3",
    "Vogel": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/76f18478-18a6-4f8e-85e6-43ecb23d9ca1.mp3",
  },
  tr: {
    "Aslan": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/4e0c9ea2-1977-4e99-9952-35cda0af9fe3.mp3",
    "Köpek": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/57fc96f2-e778-4bcd-baeb-e60563e9f1de.mp3",
    "Kedi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/226adfa7-02a1-4d8c-91db-dc7c72c6ae08.mp3",
    "İnek": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/9b7652fc-78f5-42e1-883e-af525d4c1094.mp3",
    "At": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/6e35fb92-0985-4cad-9023-c6a949dc8ac3.mp3",
    "Koyun": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8d9116b0-610a-4dfb-ad17-3d9844aaed9e.mp3",
    "Kaplan": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/4cddc1c1-e4be-43b4-bfe8-281b858e576e.mp3",
    "Maymun": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/3dbb4226-d3b5-44ff-86f4-cf37c48c79f3.mp3",
    "Tavşan": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/edea9365-71aa-4de5-bf2b-a5819509d2cf.mp3",
    "Ayı": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/be9cdf38-081a-4220-b7ed-afef07e7bd76.mp3",
    "Fil": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e5eea034-1471-44d4-a52b-c14071b18a31.mp3",
    "Zürafa": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/637539b0-02a8-420e-b14d-2691f83ebff4.mp3",
    "Penguen": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/679ed504-0d33-41e0-88ce-838ed120d020.mp3",
    "Kurbağa": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/857effb6-9719-487d-baba-b0ec934ec919.mp3",
    "Balık": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/9d7d751a-2aa1-4d52-af57-774d193f5914.mp3",
    "Kuş": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b397e214-adc3-4ffe-b964-136b6f1daf5a.mp3",
  },
};

export function animalVoiceClip(text, lang = "de") {
  return animalVoiceEntries[lang]?.[normalize(text)] || "";
}

export const animalVoiceClipCount = Object.values(animalVoiceEntries).reduce(
  (sum, group) => sum + Object.keys(group).length,
  0,
);
