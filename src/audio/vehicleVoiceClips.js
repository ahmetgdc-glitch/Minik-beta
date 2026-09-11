const normalize = (text) => String(text || "").trim();

export const vehicleVoiceEntries = {
  de: {
    "Auto": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b67c57aa-9a73-471d-aecb-1dfca54d6ba5.mp3",
    "Bus": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/440594ab-b3d6-4a44-8434-83961b829349.mp3",
    "Zug": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/114738b7-192c-422c-a843-36cf504d88d1.mp3",
    "Fahrrad": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b454350d-bf61-448c-8cd1-9f6b03d9eae3.mp3",
    "Lastwagen": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d4fc7858-af91-47c4-9622-79ea07b83a2a.mp3",
    "Traktor": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/03f929f3-a1ec-49a0-9753-53ba2f3510b3.mp3",
    "Flugzeug": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/63aedb4b-fdc6-4eec-9d27-dd937e601a0b.mp3",
    "Schiff": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/cc16ab0f-60a7-4b9d-9e93-50197c4c9167.mp3",
    "Kanu": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/19605951-2249-4e6d-bd50-935ba78c7b4e.mp3",
    "Roller": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/6eb45b5d-6541-458f-88a8-e89afe7345a4.mp3",
    "Krankenwagen": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d7b544ba-854f-429b-8963-e129eb469ee3.mp3",
    "Feuerwehrauto": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b123c59f-4f60-463f-a4f3-ca8e6cbe30b4.mp3",
    "Hubschrauber": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/6b6a7829-c731-4cd9-8a31-a469ae2a74b2.mp3",
    "Rakete": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a258764b-acf3-4fc8-aeda-b5a618078820.mp3",
    "Segelboot": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/6dca855d-6e99-4785-a0e0-6ab56b68c806.mp3",
    "Motorrad": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/dc30aad9-682e-4f63-b4d3-c38fcb7b7075.mp3",
    "Straßenbahn": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8e9bb6ce-fa38-4067-b7a7-fa9af4bfabee.mp3",
    "Taxi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/dff65343-b5ae-475e-8ce1-acadf8f17d4d.mp3",
    "Polizeiauto": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/a1113889-797c-4a28-b45f-06e2ff521e6e.mp3",
    "Motorboot": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/682d4398-ea12-4a53-abc2-e89449d4eb50.mp3",
  },
  tr: {
    "Araba": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/7a851673-c843-459c-9b98-a85f9cd2bfb2.mp3",
    "Otobüs": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/eddfd9c3-981d-46bc-a1a2-a60163fc02ed.mp3",
    "Tren": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/97cbdab4-ca5d-4d4e-9b56-4571c0022e33.mp3",
    "Bisiklet": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/b8be0042-48b8-446f-b5f9-2b56ceebdf20.mp3",
    "Kamyon": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/9c89aa0f-ce00-42bc-85c1-6110c975e335.mp3",
    "Traktör": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/11bfd1b8-4f9c-4b71-9f1b-8ad333e6a61d.mp3",
    "Uçak": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/57283bee-ee5e-4679-bb68-6412e2d5e0f5.mp3",
    "Gemi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/61feeda7-3c51-4e06-a968-9fbb0f2748cb.mp3",
    "Kano": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/5b11b33c-91fd-408a-8f32-831859c645a0.mp3",
    "Scooter": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/eccdccab-2b66-4c15-8793-9520b1972ffa.mp3",
    "Ambulans": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/52e6f7f4-0812-4bee-b594-1e6a42ba8eb2.mp3",
    "İtfaiye aracı": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/fba5d90f-75ad-41a9-8da1-0c3d1a8a499d.mp3",
    "Helikopter": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/e4c380fc-2f4d-4120-8352-97064ab6f826.mp3",
    "Roket": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d4ff2a9f-fecd-4ddb-bc06-5ceabcbf866d.mp3",
    "Yelkenli": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/dac63113-df03-44c4-a7d6-d13fe8d1cb59.mp3",
    "Motosiklet": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/c3194638-829a-4efb-9c42-2783fecfe96f.mp3",
    "Tramvay": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/29171fdc-2264-42e8-8058-206173c1d8a6.mp3",
    "Taksi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/d619363c-1478-496e-87f9-5a0fbb41c346.mp3",
    "Polis arabası": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/421e1af7-f718-493c-9601-d8ef2f373b42.mp3",
    "Sürat teknesi": "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/8237f390-336e-4391-82fe-89c03986f5fd.mp3",
  },
};

export function vehicleVoiceClip(text, lang = "de") {
  return vehicleVoiceEntries[lang]?.[normalize(text)] || "";
}

export const vehicleVoiceClipCount = Object.values(vehicleVoiceEntries)
  .reduce((sum, group) => sum + Object.keys(group).length, 0);
