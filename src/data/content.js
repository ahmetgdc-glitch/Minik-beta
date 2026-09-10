import { catalog } from "./worlds/catalog.js";

const palette = [
  "#ffe1a1",
  "#d0edfc",
  "#ffdad5",
  "#d8eaca",
  "#e6def9",
  "#f9e4bc",
];
const defs = [
  [
    "animals",
    "Tiere",
    "Hayvanlar",
    "lion",
    "Auf zu den Tieren!",
    "Hayvanları keşfet!",
  ],
  [
    "colors",
    "Farben",
    "Renkler",
    "artist-palette",
    "So bunt ist deine Welt.",
    "Dünyan rengârenk.",
  ],
  [
    "numbers",
    "Zahlen",
    "Sayılar",
    "input-numbers",
    "Eins, zwei, drei …",
    "Bir, iki, üç …",
  ],
  [
    "food",
    "Essen",
    "Yiyecekler",
    "red-apple",
    "Was schmeckt dir?",
    "Neleri seversin?",
  ],
  [
    "vehicles",
    "Fahrzeuge",
    "Araçlar",
    "automobile",
    "Brumm, los geht’s!",
    "Haydi yola çıkalım!",
  ],
  [
    "feelings",
    "Gefühle",
    "Duygular",
    "smiling-face-with-hearts",
    "Wie fühlst du dich?",
    "Nasıl hissediyorsun?",
  ],
  [
    "shapes",
    "Formen",
    "Şekiller",
    "large-blue-diamond",
    "Ecken, Kanten, runde Dinge.",
    "Köşeler ve yuvarlak şekiller.",
  ],
  [
    "nature",
    "Natur",
    "Doğa",
    "sunflower",
    "Draußen gibt es viel zu sehen.",
    "Dışarıda keşfedilecek çok şey var.",
  ],
  [
    "body",
    "Körper",
    "Vücut",
    "waving-hand",
    "Von Kopf bis Fuß.",
    "Baştan ayağa.",
  ],
  [
    "clothes",
    "Kleidung",
    "Kıyafetler",
    "t-shirt",
    "Was ziehen wir heute an?",
    "Bugün ne giyelim?",
  ],
  [
    "home",
    "Zuhause",
    "Ev",
    "house",
    "Komm, wir schauen uns um.",
    "Haydi etrafa bakalım.",
  ],
  [
    "people",
    "Menschen",
    "İnsanlar",
    "family",
    "Große und kleine Menschen.",
    "Büyük ve küçük insanlar.",
  ],
  [
    "actions",
    "Bewegung",
    "Hareketler",
    "person-running",
    "Das kannst du alles machen!",
    "Bunları sen de yapabilirsin!",
  ],
  [
    "jobs",
    "Berufe",
    "Meslekler",
    "woman-astronaut",
    "Wer macht eigentlich was?",
    "Kim ne iş yapar?",
  ],
  [
    "sounds",
    "Geräusche",
    "Sesler",
    "musical-notes",
    "Spitz die Ohren!",
    "Kulak ver!",
  ],
  [
    "school",
    "Schule",
    "Okul",
    "writing-hand",
    "Entdecke Schule und Lernen.",
    "Okulu ve öğrenmeyi keşfet.",
  ],
  [
    "sports",
    "Sport",
    "Spor",
    "soccer-ball",
    "Beweg dich mit Mino!",
    "Mino ile hareket et!",
  ],
  [
    "music",
    "Musik",
    "Müzik",
    "musical-notes",
    "Hör hin und mach Musik.",
    "Dinle ve müzik yap.",
  ],
  [
    "space",
    "Weltraum",
    "Uzay",
    "rocket",
    "Flieg mit Mino ins All.",
    "Mino ile uzaya uç.",
  ],
  [
    "weather",
    "Wetter",
    "Hava durumu",
    "cloud-with-rain",
    "Sonne, Regen, Wind und Schnee.",
    "Güneş, yağmur, rüzgâr ve kar.",
  ],
  [
    "routines",
    "Mein Tag",
    "Günüm",
    "alarm-clock",
    "Vom Aufstehen bis zum Schlafengehen.",
    "Uyanmaktan uykuya kadar günüm.",
  ],
  [
    "safety",
    "Sicher unterwegs",
    "Güvenlik",
    "police-car",
    "Lerne sichere Entscheidungen im Alltag.",
    "Günlük hayatta güvenli seçimleri öğren.",
  ],
  [
    "places",
    "Orte",
    "Yerler",
    "house",
    "Welche Orte kennst du?",
    "Hangi yerleri biliyorsun?",
  ],
  [
    "letters",
    "Buchstaben",
    "Harfler",
    "writing-hand",
    "Entdecke Buchstaben mit Bildern.",
    "Harfleri resimlerle keşfet.",
  ],
  [
    "toys",
    "Spielzeug",
    "Oyuncaklar",
    "teddy-bear",
    "Zeit zum Spielen!",
    "Oyun zamanı!",
  ],
];
const make = (category, line, index) => {
  const [key, de, tr, asset, group] = line.split("|");
  return {
    id: `${category}.${key}`,
    category,
    type: "illustration",
    labels: { de, tr },
    asset,
    group: group || category,
    tags: [category, group || category],
    difficulty: index < 8 ? 1 : index < 18 ? 2 : 3,
    audio: { de: null, tr: null },
    variants: { illustration: `assets/illustrations/${asset}.svg` },
    provenance: { collection: "Google Noto Emoji", license: "Apache-2.0" },
  };
};
const content = Object.fromEntries(
  Object.entries(catalog).map(([id, rows]) => [
    id,
    rows.split("\n").map((r, i) => make(id, r, i)),
  ]),
);
const colorRows = [
  ["red", "Rot", "Kırmızı", "#ee5148"],
  ["blue", "Blau", "Mavi", "#3588df"],
  ["yellow", "Gelb", "Sarı", "#ffcd36"],
  ["green", "Grün", "Yeşil", "#4ba968"],
  ["orange", "Orange", "Turuncu", "#ff9438"],
  ["purple", "Lila", "Mor", "#8e5bc2"],
  ["pink", "Rosa", "Pembe", "#ef91b8"],
  ["brown", "Braun", "Kahverengi", "#976147"],
  ["black", "Schwarz", "Siyah", "#27313b"],
  ["white", "Weiß", "Beyaz", "#ffffff"],
  ["gray", "Grau", "Gri", "#929da8"],
  ["turquoise", "Türkis", "Turkuaz", "#37c8c4"],
];
content.colors = colorRows.map(([key, de, tr, color], i) => ({
  ...make("colors", `${key}|${de}|${tr}|artist-palette|color`, i),
  type: "color",
  color,
}));
const shapeRows = [
  ["circle", "Kreis", "Daire"],
  ["square", "Quadrat", "Kare"],
  ["triangle", "Dreieck", "Üçgen"],
  ["rectangle", "Rechteck", "Dikdörtgen"],
  ["star", "Stern", "Yıldız"],
  ["heart", "Herz", "Kalp"],
  ["diamond", "Raute", "Eşkenar dörtgen"],
  ["oval", "Oval", "Oval"],
];
content.shapes = shapeRows.map(([key, de, tr], i) => ({
  ...make("shapes", `${key}|${de}|${tr}|large-blue-diamond|shape`, i),
  type: "shape",
  shape: key,
  color: "#5e9fe2",
}));
const deNums =
  "Eins,Zwei,Drei,Vier,Fünf,Sechs,Sieben,Acht,Neun,Zehn,Elf,Zwölf,Dreizehn,Vierzehn,Fünfzehn,Sechzehn,Siebzehn,Achtzehn,Neunzehn,Zwanzig".split(
    ",",
  );
const trNums =
  "Bir,İki,Üç,Dört,Beş,Altı,Yedi,Sekiz,Dokuz,On,On bir,On iki,On üç,On dört,On beş,On altı,On yedi,On sekiz,On dokuz,Yirmi".split(
    ",",
  );
content.numbers = deNums.map((de, i) => ({
  ...make("numbers", `${i + 1}|${de}|${trNums[i]}|input-numbers|number`, i),
  type: "number",
  number: i + 1,
}));
const soundRows = `bell|Glocke|Zil|bell|ring
phone|Telefonklingeln|Telefon zili|telephone|ring
knock|Klopfen|Kapı tıklaması|door|beat
clock|Ticken|Saat tıkırtısı|alarm-clock|beat
rain|Regengeräusch|Yağmur sesi|cloud-with-rain|nature
wind|Windgeräusch|Rüzgâr sesi|wind-face|nature
water|Wassertropfen|Su damlası|droplet|nature
drum|Trommel|Davul|drum|music
piano|Klavier|Piyano|musical-keyboard|music
flute|Flöte|Flüt|flute|music
train|Zuggeräusch|Tren sesi|locomotive|travel
siren|Sirene|Siren|ambulance|travel`;
content.sounds = soundRows
  .split("\n")
  .map((r, i) => ({ ...make("sounds", r, i), sound: r.split("|")[0] }));
for (const key of ["happy", "sad", "surprised", "angry", "tired", "calm"]) {
  const item = content.feelings.find((x) => x.id === `feelings.${key}`);
  item.variants.photo = `assets/photos/${key}.webp`;
  item.photo = {
    src: item.variants.photo,
    kind: "generated-photo",
    creator: "MINIK / OpenAI ImageGen",
    created: "2026-09-09",
    realPerson: false,
    consent: "synthetic-adult",
    description: {
      de: "KI-erzeugtes Fotomotiv einer erwachsenen Person",
      tr: "Yapay zekâyla üretilmiş yetişkin fotoğrafı",
    },
  };
}
export const worlds = defs.map(
  ([id, de, tr, asset, descriptionDe, descriptionTr], i) => ({
    id,
    labels: { de, tr },
    de,
    tr,
    asset,
    color: palette[i % palette.length],
    description: { de: descriptionDe, tr: descriptionTr },
    items: content[id],
  }),
);
export const allItems = worlds.flatMap((w) => w.items);
export const itemById = Object.fromEntries(allItems.map((x) => [x.id, x]));
export const worldById = Object.fromEntries(worlds.map((w) => [w.id, w]));
export const animalItems = content.animals;
export function itemsForWorld(id) {
  return worldById[id]?.items || content.animals;
}
export function visualKey(item) {
  return item.type === "color"
    ? item.color
    : item.type === "shape"
      ? item.shape
      : item.type === "number"
        ? String(item.number)
        : item.asset;
}
export function uniqueVisuals(items) {
  const keys = new Set();
  return items.filter((item) => {
    const key = visualKey(item);
    if (keys.has(key)) return false;
    keys.add(key);
    return true;
  });
}
export const label = (object, lang = "de") =>
  object?.labels?.[lang] || object?.[lang] || "";
