import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const offline = fs.readFileSync("src/app/offline.js", "utf8");
const app = fs.readFileSync("src/App.jsx", "utf8");
const sw = fs.readFileSync("scripts/build-sw.mjs", "utf8");
const verify = fs.readFileSync("scripts/verify-build.mjs", "utf8");

test("first service-worker install cannot force-reload a child's live app", () => {
  assert.match(offline, /let reloadForRequestedUpdate = false/);
  assert.match(offline, /export function consumeOfflineReloadRequest/);
  assert.match(app, /!consumeOfflineReloadRequest\(\)/);
  assert.match(app, /controllerchange/);
});

test("PWA update activation targets MINIK's own GitHub Pages scope", () => {
  assert.match(offline, /function appScopeUrl\(\)/);
  assert.match(offline, /getRegistration\(appScopeUrl\(\)\)/);
  assert.doesNotMatch(offline, /getRegistration\(\s*\)/);
});

test("navigation falls back to cached MINIK on temporary HTTP server errors", () => {
  assert.match(sw, /if\(response\?\.ok\).*return response/s);
  assert.match(sw, /const cached=await fallback\(\)/);
  assert.match(sw, /return cached\|\|response/);
  assert.match(verify, /serverFailure = true/);
  assert.match(verify, /temporary 5xx navigation must fall back/i);
});
