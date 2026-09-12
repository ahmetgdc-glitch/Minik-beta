import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const offline = fs.readFileSync("src/app/offline.js", "utf8");
const app = fs.readFileSync("src/App.jsx", "utf8");
const workflow = fs.readFileSync(".github/workflows/deploy.yml", "utf8");

test("PWA announces a waiting update and activates it only on request", () => {
  assert.match(offline, /registration\?\.waiting/);
  assert.match(offline, /minik:update-ready/);
  assert.match(offline, /postMessage\(\{ type: "SKIP_WAITING" \}\)/);
});

test("app reloads once after service-worker controller change and hides update prompt during games", () => {
  assert.match(app, /controllerchange/);
  assert.match(app, /let reloading = false/);
  assert.match(app, /window\.location\.reload\(\)/);
  assert.match(app, /updateReady && !playing/);
  assert.match(app, /Jetzt aktualisieren/);
});

test("GitHub Pages workflow has deploy permissions and bounded jobs", () => {
  assert.match(workflow, /permissions:\s+[\s\S]*pages: write/);
  assert.match(workflow, /permissions:\s+[\s\S]*id-token: write/);
  assert.match(workflow, /timeout-minutes: 15/);
  assert.match(workflow, /timeout-minutes: 10/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});

test("GitHub Pages deploy waits through delayed legacy-run discovery and fails closed", () => {
  assert.match(workflow, /drain-legacy-pages:/);
  assert.match(workflow, /legacy_seen=0/);
  assert.match(workflow, /for attempt in \{1\.\.60\}/);
  assert.match(workflow, /elif \[ "\$attempt" -ge 12 \]; then/);
  assert.match(workflow, /sleep 5/);
  assert.match(workflow, /Legacy Pages run completed; safe to publish verified Vite build\./);
  assert.match(workflow, /Legacy Pages run is still active after the drain window; refusing to deploy early/);
  assert.match(workflow, /Unable to establish a safe Pages deployment order/);
});

test("legacy Pages drain does not reserve the github-pages environment", () => {
  const drainStart = workflow.indexOf("  drain-legacy-pages:");
  const deployStart = workflow.indexOf("  deploy:");
  assert.ok(drainStart > 0 && deployStart > drainStart);
  const drainBlock = workflow.slice(drainStart, deployStart);
  const deployBlock = workflow.slice(deployStart);
  assert.doesNotMatch(drainBlock, /environment:\s*[\s\S]*name:\s*github-pages/);
  assert.match(deployBlock, /needs: \[build, drain-legacy-pages\]/);
  assert.match(deployBlock, /environment:\s*[\s\S]*name:\s*github-pages/);
  assert.doesNotMatch(deployBlock, /Wait for legacy Pages deployment/);
});

test("GitHub Pages workflow uses stable Node 22 and lean npm install", () => {
  const workflow = fs.readFileSync(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");
  assert.match(workflow, /node-version:\s*["']22["']/);
  assert.match(workflow, /npm ci --no-audit --no-fund/);
});

test("PWA latches an update that becomes ready before React subscribes", () => {
  assert.match(offline, /let updateReadyLatched = false/);
  assert.match(offline, /updateReadyLatched = true/);
  assert.match(offline, /if \(updateReadyLatched\) queueMicrotask\(\(\) => listener\(\)\)/);
  assert.match(offline, /updateReadyLatched = false;[\s\S]*SKIP_WAITING/);
});
