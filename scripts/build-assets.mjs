import fs from "node:fs/promises";
import path from "node:path";
import { worlds, allItems } from "../src/data/content.js";
const root = path.resolve(import.meta.dirname, "..");
const pack = JSON.parse(
  await fs.readFile(
    path.join(root, "node_modules/@iconify-json/noto/icons.json"),
    "utf8",
  ),
);
const extra = [
  "star",
  "glowing-star",
  "wrapped-gift",
  "spiral-shell",
  "coral",
  "castle",
  "blowfish",
  "crown",
  "top-hat",
  "rainbow",
  "trophy",
  "gem-stone",
  "artist-palette",
  "musical-notes",
  "brain",
  "puzzle-piece",
  "basket",
  "ear",
  "raised-hand",
  "drum",
  "magnifying-glass-tilted-left",
  "crayon",
  "fish",
  "tropical-fish",
  "seedling",
  "sailboat",
  "sparkles",
];
const keys = [
  ...new Set([
    ...worlds.map((w) => w.asset),
    ...allItems.map((i) => i.asset),
    ...extra,
  ]),
];
const out = path.join(root, "public/assets/illustrations");
await fs.mkdir(out, { recursive: true });
let errors = [];
for (const key of keys) {
  let icon = pack.icons[key];
  if (!icon && pack.aliases?.[key]) icon = pack.icons[pack.aliases[key].parent];
  if (!icon) {
    errors.push(key);
    continue;
  }
  await fs.writeFile(
    path.join(out, key + ".svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${icon.width || pack.width || 128}" height="${icon.height || pack.height || 128}" viewBox="0 0 ${icon.width || pack.width || 128} ${icon.height || pack.height || 128}">${icon.body}</svg>\n`,
  );
}
if (errors.length) {
  console.error("Missing Noto illustrations:", errors.join(", "));
  process.exit(1);
}
const manifest = {
  version: "0.3.0",
  generatedAt: "2026-09-09",
  collection: {
    name: "Google Noto Emoji",
    license: "Apache-2.0",
    source: "https://github.com/googlefonts/noto-emoji",
  },
  packs: worlds.map((w) => ({
    id: w.id,
    items: w.items.map((i) => i.id),
    assets: [
      ...new Set(
        w.items.flatMap((i) => [
          `assets/illustrations/${i.asset}.svg`,
          ...(i.variants.photo ? [i.variants.photo] : []),
        ]),
      ),
    ],
  })),
};
await fs.writeFile(
  path.join(root, "public/assets/content-manifest.json"),
  JSON.stringify(manifest, null, 2),
);
console.log(
  `Asset pipeline: ${keys.length} illustrations, ${worlds.length} worlds, ${allItems.length} learning objects`,
);
