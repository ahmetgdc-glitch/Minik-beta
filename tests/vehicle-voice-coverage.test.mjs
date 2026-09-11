import test from "node:test";
import assert from "node:assert/strict";
import { itemsForWorld } from "../src/data/content.js";
import { vehicleVoiceClip, vehicleVoiceClipCount } from "../src/audio/vehicleVoiceClips.js";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

test("all vehicle labels in real MINIK data have natural DE/TR voice", () => {
  const items = itemsForWorld("vehicles");
  assert.equal(items.length, 20, "vehicle catalog size changed; update voice coverage deliberately");
  for (const item of items) {
    for (const lang of ["de", "tr"]) {
      const label = item.labels[lang];
      assert.match(
        vehicleVoiceClip(label, lang),
        /^https:\/\/storage\.googleapis\.com\/.+\.mp3$/u,
        `missing natural ${lang} vehicle clip for ${item.id}: ${label}`,
      );
      assert.equal(
        naturalVoicePlan(label, lang).length,
        1,
        `natural voice plan must resolve ${item.id} (${lang}) as one recorded clip`,
      );
    }
  }
  assert.ok(vehicleVoiceClipCount >= 40);
});
