import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { categoryVoiceClip, categoryVoiceClipCount } from "../src/audio/categoryVoiceClips.js";
import { worlds } from "../src/data/content.js";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const sort = readFileSync(new URL("../src/games/SortGame.jsx", import.meta.url), "utf8");
const fetchScript = readFileSync(new URL("../scripts/fetch-voice-assets.mjs", import.meta.url), "utf8");
const verifyScript = readFileSync(new URL("../scripts/verify-build.mjs", import.meta.url), "utf8");

const sortableWorlds = ["animals", "vehicles", "food", "clothes", "home", "nature", "toys"];

test("all sorting basket category labels have natural Mino voice in DE and TR", () => {
  for (const id of sortableWorlds) {
    const world = worlds.find((item) => item.id === id);
    assert.ok(world, `missing sortable world: ${id}`);
    for (const lang of ["de", "tr"]) {
      const label = world.labels[lang];
      assert.match(categoryVoiceClip(label, lang), /^https:\/\/storage\.googleapis\.com\/.+\.mp3$/u, `missing natural category clip: ${lang} ${label}`);
      assert.equal(naturalVoicePlan(label, lang).length, 1, `category must resolve through shared voice plan: ${lang} ${label}`);
    }
  }
  assert.equal(categoryVoiceClipCount, 14);
});

test("SortGame continues to use the destination world label as help", () => {
  assert.match(sort, /group\.labels\[lang\]/);
});

test("category voice participates in offline production localization", () => {
  assert.match(fetchScript, /src\/audio\/categoryVoiceClips\.js/);
  assert.match(verifyScript, /src\/audio\/categoryVoiceClips\.js/);
});
