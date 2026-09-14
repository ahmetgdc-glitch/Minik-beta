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

const builtJavaScript = (await fs.readdir(path.join(root, "assets")))
  .filter((file) => file.endsWith(".js"));
const builtStyles = (await fs.readdir(path.join(root, "assets")))
  .filter((file) => file.endsWith(".css"));
assert.ok(builtJavaScript.length >= 24, `Expected split game modules, found ${builtJavaScript.length} JavaScript files`);
assert.ok(builtStyles.length >= 22, `Expected split game styles, found ${builtStyles.length} CSS files`);
const entryScript = html.match(/<script[^>]+src="\.\/(assets\/index-[^"]+\.js)"/u)?.[1];
const entryStyle = html.match(/<link[^>]+href="\.\/(assets\/index-[^"]+\.css)"/u)?.[1];
assert.ok(entryScript, "Production HTML must reference the hashed app entry");
assert.ok(entryStyle, "Production HTML must reference the hashed app stylesheet");
const entryBytes = (await fs.stat(path.join(root, entryScript))).size;
const entryStyleBytes = (await fs.stat(path.join(root, entryStyle))).size;
assert.ok(entryBytes < 400_000, `Initial JavaScript must stay below 400 KB, found ${entryBytes} bytes`);
assert.ok(entryStyleBytes < 200_000, `Initial CSS must stay below 200 KB, found ${entryStyleBytes} bytes`);
const coreFiles = JSON.parse(worker.match(/const CORE=(\[[^;]+\]);/u)?.[1] || "null");
assert.ok(Array.isArray(coreFiles), "Service worker must publish a readable CORE list");
for (const file of [...builtJavaScript, ...builtStyles]) {
  assert.ok(coreFiles.includes(`./assets/${file}`), `Offline boot cache must include code chunk: ${file}`);
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
  const source = await fs.readFile(path.resolve("public/assets/voice", filename));
  const output = await fs.readFile(path.join(root, "assets/voice", filename));
  assert.ok(source.byteLength > 100 && source.equals(output), `Bundled voice bytes must survive the build unchanged: ${filename}`);
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
  let failCacheWrites = false;
  let lastNetworkResponse;
  let skipWaitingCalls = 0;
  let claimCalls = 0;
  const registration = { scope, active: {} };
  const listeners = new Map();
  const stores = new Map();
  const prefix = `minik:${scope}:`;
  const old = prefix + "old";
  const other = "minik:https://example.test/another-app/:old";
  stores.set(old, new Map());
  stores.set(other, new Map());
  const key = (request) => new URL(request.url || request, scope).href;
  function basicResponse(body, options = {}) {
    const response = new Response(body, options);
    Object.defineProperty(response, "type", { value: "basic" });
    return response;
  }
  async function fetchFile(request) {
    if (offline) throw new Error("Simulated offline connection");
    if (serverFailure) return basicResponse("temporary server error", { status: 503 });
    const url = key(request);
    assert.ok(url.startsWith(scope), `Unexpected request: ${url}`);
    const relative = url.slice(scope.length).split(/[?#]/)[0] || "index.html";
    const file = path.resolve(root, relative);
    assert.ok(file.startsWith(root + path.sep));
    const body = await fs.readFile(file);
    const headers = { "Content-Type": relative.endsWith(".wav") ? "audio/wav" : relative.endsWith(".mp3") ? "audio/mpeg" : "application/octet-stream" };
    if (request.headers?.has("Range")) {
      assert.equal(request.headers.get("Range"), "bytes=0-1", "Cold media probe must reach the network unchanged");
      lastNetworkResponse = basicResponse(body.subarray(0, 2), {
        status: 206, headers: { ...headers, "Content-Range": `bytes 0-1/${body.byteLength}`, "Content-Length": "2" },
      });
    } else {
      lastNetworkResponse = basicResponse(body, { headers });
    }
    return lastNetworkResponse;
  }
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(files) { for (const file of files) store.set(key(file), await fetchFile(file)); },
        async match(request) { return store.get(key(request))?.clone(); },
        async put(request, response) {
          if (failCacheWrites) throw new Error("Simulated QuotaExceededError");
          assert.notEqual(response.status, 206, "The real Cache API rejects partial media responses");
          // Consume the body just as Cache.put does, and return independent copies.
          store.set(key(request), new Response(await response.arrayBuffer(), { status: response.status, headers: response.headers }));
        },
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
  };
  vm.runInNewContext(worker, {
    URL, Request, Response, Headers, caches, fetch: fetchFile, AbortController, setTimeout, clearTimeout,
    self: {
      location: { origin: "https://example.test" }, registration,
      clients: { claim: async () => { claimCalls++; } },
      async skipWaiting() { skipWaitingCalls++; },
      addEventListener(type, callback) { listeners.set(type, callback); },
    },
  });
  async function lifecycle(type, details = {}) {
    let pending;
    listeners.get(type)({ ...details, waitUntil(promise) { pending = promise; } });
    await pending;
  }
  await lifecycle("install");
  assert.equal(skipWaitingCalls, 0, "An update must wait while the previous MINIK worker is active");
  assert.equal(claimCalls, 0, "Installing an update cannot take over a child's live page");
  assert.ok(stores.has(old), "A waiting update must preserve the running version's cache");
  await lifecycle("message", { data: { type: "UNRELATED" } });
  assert.equal(skipWaitingCalls, 0);
  await lifecycle("message", { data: { type: "SKIP_WAITING" } });
  assert.equal(skipWaitingCalls, 1, "Only an explicit update request may skip the waiting phase");
  await lifecycle("activate");
  assert.equal(claimCalls, 1);
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
  const background = [];
  function request(url, mode = "cors", method = "GET", headers = {}) {
    let response;
    const incoming = mode === "navigate" ? { url, mode, method, headers: new Headers(headers) } : new Request(url, { mode, method, headers });
    listeners.get("fetch")({
      request: incoming,
      respondWith(promise) { response = promise; },
      waitUntil(promise) { background.push(promise); },
    });
    return response;
  }
  async function finishBackground() { await Promise.all(background.splice(0)); }
  assert.equal(request(scope + "reset.html", "navigate"), undefined, "Recovery page must bypass the service worker");
  failCacheWrites = true;
  const uncachedVoice = await request(scope + `assets/voice/${builtVoiceFiles[0]}`);
  assert.equal(uncachedVoice, lastNetworkResponse, "Full storage must not discard successfully downloaded audio");
  const uncachedPage = await request(scope, "navigate");
  assert.equal(uncachedPage, lastNetworkResponse, "Full storage must not replace fresh HTML with an older cached page");
  failCacheWrites = false;
  serverFailure = true;
  const degradedPage = await request(scope, "navigate");
  assert.match(await degradedPage.text(), /MINIK/, "A temporary 5xx navigation must fall back to the cached app shell");
  serverFailure = false;
  offline = true;
  const page = await request(scope, "navigate");
  assert.match(await page.text(), /MINIK/);
  const image = await request(scope + "assets/mascot/mino.webp");
  assert.ok((await image.arrayBuffer()).byteLength > 1000);
  for (const script of builtJavaScript) {
    const chunk = await request(scope + `assets/${script}`);
    assert.ok((await chunk.arrayBuffer()).byteLength > 100, `Split module must work offline: ${script}`);
  }
  for (const stylesheet of builtStyles) {
    const chunk = await request(scope + `assets/${stylesheet}`);
    assert.ok((await chunk.arrayBuffer()).byteLength > 100, `Split game style must work offline: ${stylesheet}`);
  }
  for (const scene of ["archipelago", "meadow", "playroom"]) {
    const landscape = await request(scope + `assets/scenes/${scene}.webp`);
    assert.ok((await landscape.arrayBuffer()).byteLength > 1000, `${scene} must work on the first offline visit`);
  }

  // Rich content is cached on demand rather than during startup. Once heard,
  // a natural voice clip remains available offline without boot-time pressure.
  offline = false;
  const voiceUrl = scope + `assets/voice/${builtVoiceFiles[0]}`;
  const warmedVoice = await request(voiceUrl);
  assert.ok((await warmedVoice.arrayBuffer()).byteLength > 100);
  offline = true;
  const cachedVoice = await request(voiceUrl);
  assert.ok((await cachedVoice.arrayBuffer()).byteLength > 100, "A used natural voice clip must remain available offline");

  // Exercise actual MP3 and WAV bytes through the generated worker, including
  // Safari's initial two-byte probe and later offline seeks under every scope.
  for (const extension of ["mp3", "wav"]) {
    const filename = builtVoiceFiles.find((file) => file.endsWith(`.${extension}`) && file !== builtVoiceFiles[0]);
    const mediaUrl = scope + `assets/voice/${filename}`;
    const original = await fs.readFile(path.join(root, "assets/voice", filename));
    offline = false;
    const probe = await request(mediaUrl, "cors", "GET", { Range: "bytes=0-1" });
    assert.equal(probe.status, 206);
    assert.deepEqual(Buffer.from(await probe.arrayBuffer()), original.subarray(0, 2));
    await finishBackground();
    offline = true;
    for (const [range, start, end] of [["bytes=0-1", 0, 2], ["bytes=2-", 2, original.length], ["bytes=-4", original.length - 4, original.length]]) {
      const replay = await request(mediaUrl, "cors", "GET", { Range: range });
      assert.equal(replay.status, 206, `${extension}: ${range}`);
      assert.equal(replay.headers.get("Content-Range"), `bytes ${start}-${end - 1}/${original.length}`);
      assert.equal(replay.headers.get("Content-Length"), String(end - start));
      assert.equal(replay.headers.get("Content-Type"), extension === "wav" ? "audio/wav" : "audio/mpeg");
      assert.deepEqual(Buffer.from(await replay.arrayBuffer()), original.subarray(start, end));
    }
    const complete = await request(mediaUrl);
    assert.equal(complete.status, 200, "Partial playback must preserve the complete cached recording");
    assert.deepEqual(Buffer.from(await complete.arrayBuffer()), original);
    await finishBackground();
  }

  assert.equal(request("https://unrelated.test/asset.svg"), undefined);
  assert.equal(request(scope, "cors", "POST"), undefined);
  registration.active = null;
  offline = false;
  await lifecycle("install");
  assert.equal(skipWaitingCalls, 2, "A first install may activate immediately without replacing a running worker");
  console.log(`Build + offline contract passed: ${scope} (${active[1].size} boot files, ${builtVoiceFiles.length} localized voice clips)`);
}
