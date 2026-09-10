import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  UPDATE_CHECK_INTERVAL_MS,
  shouldCheckForOfflineUpdate,
} from "../src/app/offline.js";

const offline = fs.readFileSync("src/app/offline.js", "utf8");
const app = fs.readFileSync("src/App.jsx", "utf8");

test("installed PWA update checks are throttled to avoid foreground network spam", () => {
  const now = 2_000_000;
  assert.equal(shouldCheckForOfflineUpdate(0, now), true);
  assert.equal(shouldCheckForOfflineUpdate(now - UPDATE_CHECK_INTERVAL_MS + 1, now), false);
  assert.equal(shouldCheckForOfflineUpdate(now - UPDATE_CHECK_INTERVAL_MS, now), true);
  assert.match(offline, /updateViaCache:\s*"none"/);
  assert.match(offline, /registration\.update\(\)/);
  assert.match(offline, /document\.visibilityState === "visible"/);
});

test("an explicitly accepted PWA update cannot leave the UI stuck forever on WebKit", () => {
  assert.match(app, /if \(!updating\) return undefined/);
  assert.match(app, /setTimeout\(\(\) => \{[\s\S]*consumeOfflineReloadRequest\(\)[\s\S]*window\.location\.reload\(\)[\s\S]*setUpdating\(false\)[\s\S]*\}, 6000\)/);
  assert.match(app, /clearTimeout\(fallback\)/);
});
