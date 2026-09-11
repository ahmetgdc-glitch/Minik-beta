import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { itemsForWorld } from "../src/data/content.js";
import { bodyVoiceClip, bodyVoiceClipCount } from "../src/audio/bodyVoiceClips.js";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const fetchScript = readFileSync(new URL("../scripts/fetch-voice-assets.mjs", import.meta.url), "utf8");
const verifyScript = readFileSync(new URL("../scripts/verify-build.mjs", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");

test("all body labels in real MINIK data have natural DE/TR voice", () => {
  const items = itemsForWorld("body");
  assert.equal(items.length, 12, "body catalog size changed; update voice coverage deliberately");
  for (const item of items) {
    for (const lang of ["de", "tr"]) {
      const label = item.labels[lang];
      assert.match(
        bodyVoiceClip(label, lang),
        /^https:\/\/storage\.googleapis\.com\/.+\.mp3$/u,
        `missing natural ${lang} body clip for ${item.id}: ${label}`,
      );
      assert.equal(naturalVoicePlan(label, lang).length, 1);
    }
  }
  assert.equal(bodyVoiceClipCount, 24);
});

test("body voice library participates in the offline production pipeline", () => {
  for (const source of [fetchScript, verifyScript, workflow]) {
    assert.match(source, /bodyVoiceClips\.js/);
  }
});
