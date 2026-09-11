import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve("dist");
const worker = await fs.readFile(path.join(root, "sw.js"), "utf8");
const html = await fs.readFile(path.join(root, "index.html"), "utf8");
assert.match(html, /MINIK/);
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  assert.ok(!match[1].startsWith("/"), `Root-relative build asset: ${match[1]}`);
  await fs.access(path.resolve(root, match[1]));
}

const voiceSourcePattern = /https:\/\/storage\.googleapis\.com\/adm--audio-playback--7d--public\/mcp-preview\/([a-f0-9-]+\.mp3)/g;
const voiceSourceFiles = [
  "src/audio/gameVoiceClips.js",
  "src/audio/animalVoiceClips.js",
  "src/audio/numberVoiceClips.js",
  "src/audio/helpVoiceClips.js",
  "src/audio/categoryVoiceClips.js",
  "src/audio/vehicleVoiceClips.js",
  "src/audio/foodVoiceClips.js",
  "src/audio/naturalVoicePlans.js",
];
const voiceSources = await Promise.all(voiceSourceFiles.map((file) => fs.readFile(path.resolve(file), "utf8")));
const expectedVoiceFiles = new Set(voiceSources.flatMap((source) => [...source.matchAll(voiceSourcePattern)].map((match) => match[1])));
const builtVoiceFiles = (await fs.readdir(path.join(root, "assets/voice"))).filter((file) => file.endsWith(".mp3"));
assert.equal(builtVoiceFiles.length, expectedVoiceFiles.size, `Expected ${expectedVoiceFiles.size} localized voice clips, found ${builtVoiceFiles.length}`);
const voiceManifest = JSON.parse(await fs.readFile(path.join(root, "assets/voice/manifest.json"), "utf8"));
assert.equal(voiceManifest.expected, expectedVoiceFiles.size);
assert.equal(voiceManifest.available, expectedVoiceFiles.size);
assert.equal(voiceManifest.missing.length, 0);

for (const scope of ["https://example.test/", "https://example.test/Minik-beta/", "https://example.test/Minik-2.0-/"]) {
  let offline = false;
  let serverFailure = false;
  const listeners = new Map();
  const stores = new Map();
  const prefix = `minik:${scope}:`;
  const old = prefix + "old";
  const other = "minik:https://example.test/another-app/:old";
  stores.set(old, new Map());
  stores.set(other, new Map());
  const key = (request) => new URL(request.url || request, scope).href;
  async function fetchFile(request) {
    if (offline) throw new Error("Simulated offline connection");
    if (serverFailure) return { ok: false, status: 503, type: "basic", body: Buffer.from("temporary server error"), clone() { return this; } };
    const url = key(request);
    assert.ok(url.startsWith(scope), `Unexpected request: ${url}`);
    const relative = url.slice(scope.length).split(/[?#]/)[0] || "index.html";
    const file = path.resolve(root, relative);
    assert.ok(file.startsWith(root + path.sep));
    const body = await fs.readFile(file);
    return { ok: true, type: "basic", body, clone() { return this; } };
  }
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(files) { for (const file of files) store.set(key(file), await fetchFile(file)); },
        async match(request) { return store.get(key(request)); },
        async put(request, response) { store.set(key(request), response); },
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
  };
  vm.runInNewContext(worker, {
    URL, caches, fetch: fetchFile, AbortController, setTimeout, clearTimeout,
    self: {
      location: { origin: "https://example.test" }, registration: { scope }, clients: { claim: async () => {} }, skipWaiting() {},
      addEventListener(type, callback) { listeners.set(type, callback); },
    },
  });
  async function lifecycle(type) {
    let pending;
    listeners.get(type)({ waitUntil(promise) { pending = promise; } });
    await pending;
  }
  await lifecycle("install");
  await lifecycle("activate");
  assert.ok(!stores.has(old), "Old cache for this app must be removed");
  assert.ok(stores.has(other), "Another app's cache must remain untouched");
  const active = [...stores.entries()].find(([name]) => name.startsWith(prefix));
  assert.ok(active[1].size >= 270, "Complete compact core must be cached");
  function request(url, mode = "cors", method = "GET") {
    let response;
    listeners.get("fetch")({ request: { url, mode, method }, respondWith(promise) { response = promise; } });
    return response;
  }
  serverFailure = true;
  const degradedPage = await request(scope, "navigate");
  assert.match(degradedPage.body.toString(), /MINIK/, "A temporary 5xx navigation must fall back to the cached app shell");
  serverFailure = false;
  offline = true;
  const page = await request(scope, "navigate");
  assert.match(page.body.toString(), /MINIK/);
  const image = await request(scope + "assets/mascot/mino.webp");
  assert.ok(image.body.byteLength > 1000);
  for (const scene of ["archipelago", "meadow", "playroom"]) {
    const landscape = await request(scope + `assets/scenes/${scene}.webp`);
    assert.ok(landscape?.body.byteLength > 1000, `${scene} must work on the first offline visit`);
  }
  const naturalVoice = await request(scope + `assets/voice/${builtVoiceFiles[0]}`);
  assert.ok(naturalVoice?.body.byteLength > 100, "Natural Mino voice must work on the first offline visit");
  assert.equal(request("https://unrelated.test/asset.svg"), undefined);
  assert.equal(request(scope, "cors", "POST"), undefined);
  console.log(`Build + offline contract passed: ${scope} (${active[1].size} cached files, ${builtVoiceFiles.length} voice clips)`);
}
