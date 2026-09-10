import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("root render is protected by crash recovery", () => {
  const main = read("src/main.jsx");
  assert.match(main, /<CrashBoundary><App \/><\/CrashBoundary>/);
});

test("game routes request wake lock without making it mandatory", () => {
  const app = read("src/App.jsx");
  const wake = read("src/app/useGameWakeLock.js");
  assert.match(app, /const playing = gameRoute && Boolean\(validGame\)/);
  assert.match(app, /useGameWakeLock\(playing\)/);
  assert.match(wake, /"wakeLock" in navigator/);
  assert.match(wake, /sentinel\?\.release/);
});

test("public metadata no longer advertises stale content counts", () => {
  const html = read("index.html");
  assert.match(html, /25 Lernwelten/);
  assert.match(html, /500\+ Lernobjekte/);
  assert.doesNotMatch(html, /16 Lernwelten/);
  assert.doesNotMatch(html, /zwölf Minispiele/);
});

test("visible app version stays synchronized with package version", () => {
  const pkg = JSON.parse(read("package.json"));
  const meta = read("src/app/meta.js");
  const escaped = pkg.version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(meta, new RegExp(`APP_VERSION = [\"']${escaped}[\"']`));
});


test("visible beta label matches the package beta release", () => {
  const pkg = JSON.parse(read("package.json"));
  const meta = read("src/app/meta.js");
  const match = pkg.version.match(/^(\d+)\.(\d+)\.\d+-beta\.(\d+)$/);
  assert.ok(match, "Package version should use MINIK beta semver");
  const expected = `MINIK ${match[1]}.${match[2]} Beta ${match[3]}`;
  assert.match(meta, new RegExp(`APP_VERSION_LABEL = [\"']${expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\"']`));
});

test("service worker cache names include the current package version", () => {
  const swBuild = read("scripts/build-sw.mjs");
  assert.match(swBuild, /pkg\.version/);
  assert.doesNotMatch(swBuild, /minik-0\.3-/);
});

test("service worker navigation has a bounded network wait before offline fallback", () => {
  const swBuild = read("scripts/build-sw.mjs");
  assert.match(swBuild, /NAV_TIMEOUT_MS=3500/);
  assert.match(swBuild, /AbortController/);
  assert.match(swBuild, /controller\.abort/);
  assert.match(swBuild, /fallback\(\)/);
});

test("source files cannot contain nested or broken import declarations", () => {
  const root = new URL("../src/", import.meta.url);
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      if (entry.isDirectory()) walk(url);
      else if (/\.(?:js|jsx)$/.test(entry.name)) files.push(url);
    }
  };
  walk(root);
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(
      source,
      /import\s*\{[^;]*\bimport\b/s,
      `broken nested import in ${file.pathname}`,
    );
  }
});


test("release preflight blocks stale docs and deployment metadata", () => {
  const preflight = read("scripts/release-preflight.mjs");
  assert.match(preflight, /README\.md/);
  assert.match(preflight, /docs\/ROADMAP\.md/);
  assert.match(preflight, /docs\/QA_CHECKLIST\.md/);
  assert.match(preflight, /docs\/HANDOFF_SUMMARY\.md/);
  assert.match(preflight, /package-lock top-level version differs/);
  assert.match(preflight, /package-lock .* spec differs/);
  assert.match(preflight, /package-lock has stale root/);
  assert.match(preflight, /deploy workflow missing/);
});

test("GitHub workflow keeps a downloadable production build before Pages deploy", () => {
  const workflow = read(".github/workflows/deploy.yml");
  assert.match(workflow, /npm run preflight/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /name: minik-production-build/);
  assert.match(workflow, /path: dist/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
});

test("release preflight verifies source syntax, local import graph and game component coverage", () => {
  const preflight = read("scripts/release-preflight.mjs");
  assert.match(preflight, /spawnSync/);
  assert.match(preflight, /--noResolve/);
  assert.match(preflight, /TypeScript source syntax parse failed/);
  assert.match(preflight, /missing local import/);
  assert.match(preflight, /game .* has no GameSession component mapping/);
  assert.match(preflight, /resolveLocalImport/);
});


test("parent backup import rejects oversized files before reading them into memory", () => {
  const source = read("src/parent/Parents.jsx");
  assert.match(source, /file\.size/);
  assert.match(source, /BACKUP_MAX_BYTES/);
  assert.ok(source.indexOf("file.size") < source.indexOf("file.text()"));
});
