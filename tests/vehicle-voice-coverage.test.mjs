import test from "node:test";
import assert from "node:assert/strict";
import { itemsForWorld } from "../src/data/content.js";
import { vehicleVoiceClip, vehicleVoiceClipCount } from "../src/audio/vehicleVoiceClips.js";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const expectedIds = [
  "vehicles.car", "vehicles.bus", "vehicles.train", "vehicles.bike",
  "vehicles.truck", "vehicles.tractor", "vehicles.plane", "vehicles.ship",
];

test("core vehicle labels in real MINIK data have natural DE/TR voice", () => {
  const items = itemsForWorld("vehicles").filter((item) => expectedIds.includes(item.id));
  assert.equal(items.length, 8);
  for (const item of items) {
    for (const lang of ["de", "tr"]) {
      const label = item.labels[lang];
      assert.match(vehicleVoiceClip(label, lang), /^https:\/\/storage\.googleapis\.com\/.+\.mp3$/u);
      assert.equal(naturalVoicePlan(label, lang).length, 1);
    }
  }
  assert.ok(vehicleVoiceClipCount >= 16);
});
