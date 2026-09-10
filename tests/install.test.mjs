import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/app/install.js", import.meta.url), "utf8");
const parents = fs.readFileSync(new URL("../src/parent/Parents.jsx", import.meta.url), "utf8");
const manifest = JSON.parse(fs.readFileSync(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

test("PWA install helper supports iOS standalone and Chromium install prompts", () => {
  assert.match(source, /navigator|nav/);
  assert.match(source, /standalone/);
  assert.match(source, /display-mode: standalone/);
  assert.match(source, /beforeinstallprompt/);
  assert.match(source, /appinstalled/);
  assert.match(source, /userChoice/);
});

test("parent area gives adults a safe install path including iPhone Safari guidance", () => {
  assert.match(parents, /MINIK als App installieren/);
  assert.match(parents, /Zum Home-Bildschirm/);
  assert.match(parents, /requestInstall/);
  assert.match(parents, /installState\.standalone/);
});

test("web app manifest is scoped for installable GitHub Pages deployment", () => {
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"));
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"));
});
