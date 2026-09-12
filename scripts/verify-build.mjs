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

const legacyVoiceSourcePattern = /https:\/\/storage\.googleapis\.com\/adm--audio-playback--7d--public\/mcp-preview\/([a-f0-9-]+\.mp3)/g;
const personalVoiceSourcePattern = /https:\/\/resource2\.heygen\.ai\/text_to_speech\/[^"'\s]+\/(id=[a-f0-9-]+\.wav)/g;
const legacyVoiceSourceFiles = [
  "src/audio/gameVoiceClips.js",
  "src/audio/animalVoiceClips.js",
  "src/audio/numberVoiceClips.js",
  "src/audio/helpVoiceClips.js",
  "src/audio/categoryVoiceClips.js",
  "src/audio/vehicleVoiceClips.js",
  "src/audio/bodyVoiceClips.js",
  "src/audio/foodVoiceClips.js",
  "src/audio/naturalVoicePlans.js",
];
const legacyVoiceSources = await Promise.all(legacyVoiceSourceFiles.map((file) => fs.readFile(path.resolve(file), "utf8")));
const personalVoiceSource = await fs.readFile(path.resolve("src/audio/personalVoiceClips.js"), "utf8");
const generatedPersonalVoiceSource = await fs.readFile(
  path.resolve("src/audio/generatedPersonalVoiceClips.js"),
  "utf8",
);
const expectedLegacyVoiceFiles = new Set(
  legacyVoiceSources.flatMap((source) => [...source.matchAll(legacyVoiceSourcePattern)].map((match) => match[1])),
);
const expectedPersonalVoiceFiles = new Set(
  [...personalVoiceSource.matchAll(personalVoiceSourcePattern)].map((match) => match[1]),
);
const expectedVoiceFiles = new Set([...expectedLegacyVoiceFiles, ...expectedPersonalVoiceFiles]);
const builtVoiceFiles = (await fs.readdir(path.join(root, "assets/voice"))).filter((file) => /\.(?:mp3|wav)$/iu.test(file));
assert.equal(
  builtVoiceFiles.length,
  expectedVoiceFiles.size,
  `Expected ${expectedVoiceFiles.size} localized voice clips, found ${builtVoiceFiles.length}`,
);
for (const filename of expectedVoiceFiles) {
  assert.ok(builtVoiceFiles.includes(filename), `Missing localized voice clip: ${filename}`);
}

const voiceManifest = JSON.parse(await fs.readFile(path.join(root, "assets/voice/manifest.json"), "utf8"));
assert.equal(voiceManifest.expected, expectedLegacyVoiceFiles.size);
assert.equal(voiceManifest.available, expectedLegacyVoiceFiles.size);
assert.equal(voiceManifest.missing.length, 0);

const personalVoiceManifest = JSON.parse(await fs.readFile(path.join(root, "assets/voice/personal-manifest.json"), "utf8"));
assert.equal(personalVoiceManifest.expected, expectedPersonalVoiceFiles.size);
assert.equal(personalVoiceManifest.available, expectedPersonalVoiceFiles.size);
assert.equal(personalVoiceManifest.missing.length, 0);

const generatedPersonalFiles = new Set(
  [...generatedPersonalVoiceSource.matchAll(/assets\/personal-voice\/(personal-(?:de|tr)-[a-f0-9]{20}\.mp3)/g)]
    .map((match) => match[1]),
);
assert.equal(generatedPersonalFiles.size, 298);
const builtPersonalVoiceFiles = (
  await fs.readdir(path.join(root, "assets/personal-voice"))
).filter((file) => /\.mp3$/iu.test(file));
assert.equal(
  builtPersonalVoiceFiles.length,
  generatedPersonalFiles.size,
  `Expected ${generatedPersonalFiles.size} generated personal clips, found ${builtPersonalVoiceFiles.length}`,
);
for (const filename of generatedPersonalFiles) {
  assert.ok(
    builtPersonalVoiceFiles.includes(filename),
    `Missing generated personal voice clip: ${filename}`,
  );
}

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
  assert.ok(active[1].size >= 8, "App shell must be cached");
  assert.ok(active[1].size < 120, `Boot cache must stay lightweight on Safari, found ${active[1].size} files`);
  assert.equal(
    [...active[1].keys()].some((url) => url.includes("/assets/voice/") && /\.(?:mp3|wav)$/iu.test(url)),
    false,
    "Boot cache must not preload the whole voice library",
  );
  function request(url, mode = "cors", method = "GET") {
    let response;
    listeners.get("fetch")({ request: { url, mode, method }, respondWith(promise) { response = promise; } });
    return response;
  }
  assert.equal(request(scope + "reset.html", "navigate"), undefined, "Recovery page must bypass the service worker");
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

  // Rich content is cached on demand rather than during startup. Once heard,
  // a natural voice clip remains available offline without boot-time pressure.
  offline = false;
  const voiceUrl = scope + `assets/voice/${builtVoiceFiles[0]}`;
  const warmedVoice = await request(voiceUrl);
  assert.ok(warmedVoice?.body.byteLength > 100);
  offline = true;
  const cachedVoice = await request(voiceUrl);
  assert.ok(cachedVoice?.body.byteLength > 100, "A used natural voice clip must remain available offline");

  assert.equal(request("https://unrelated.test/asset.svg"), undefined);
  assert.equal(request(scope, "cors", "POST"), undefined);
  console.log(`Build + offline contract passed: ${scope} (${active[1].size} boot files, ${builtVoiceFiles.length} localized voice clips)`);
}
