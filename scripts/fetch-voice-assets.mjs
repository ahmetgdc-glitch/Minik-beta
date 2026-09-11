import fs from "node:fs/promises";
import path from "node:path";

const sourceFiles = [
  "src/audio/gameVoiceClips.js",
  "src/audio/animalVoiceClips.js",
  "src/audio/numberVoiceClips.js",
  "src/audio/helpVoiceClips.js",
  "src/audio/foodVoiceClips.js",
  "src/audio/naturalVoicePlans.js",
];
const cacheDir = path.resolve(".voice-cache");
const outDir = path.resolve("dist/assets/voice");
const requireComplete = process.env.MINIK_REQUIRE_LOCAL_VOICE === "1";
const urlPattern = /https:\/\/storage\.googleapis\.com\/adm--audio-playback--7d--public\/mcp-preview\/([a-f0-9-]+\.mp3)/g;

await fs.mkdir(cacheDir, { recursive: true });
await fs.mkdir(outDir, { recursive: true });

const clips = new Map();
for (const file of sourceFiles) {
  const source = await fs.readFile(path.resolve(file), "utf8");
  for (const match of source.matchAll(urlPattern)) clips.set(match[0], match[1]);
}

async function exists(file) {
  try {
    const stat = await fs.stat(file);
    return stat.isFile() && stat.size > 100;
  } catch {
    return false;
  }
}

async function fetchWithRetry(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = Buffer.from(await response.arrayBuffer());
      if (data.length < 100) throw new Error("audio response too small");
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
  throw lastError;
}

const queue = [...clips.entries()];
const failures = [];
let copied = 0;
let downloaded = 0;
let index = 0;

async function worker() {
  while (index < queue.length) {
    const current = queue[index++];
    if (!current) return;
    const [url, filename] = current;
    const cached = path.join(cacheDir, filename);
    const output = path.join(outDir, filename);
    try {
      if (!(await exists(cached))) {
        const bytes = await fetchWithRetry(url);
        const temp = `${cached}.tmp-${process.pid}-${Date.now()}`;
        await fs.writeFile(temp, bytes);
        await fs.rename(temp, cached);
        downloaded++;
      }
      await fs.copyFile(cached, output);
      copied++;
    } catch (error) {
      failures.push({ url, filename, error: String(error?.message || error) });
    }
  }
}

await Promise.all(Array.from({ length: Math.min(8, queue.length) }, () => worker()));

const manifest = {
  generatedAt: new Date().toISOString(),
  expected: clips.size,
  available: copied,
  files: [...clips.values()].filter((name) => !failures.some((item) => item.filename === name)),
  missing: failures.map(({ filename, error }) => ({ filename, error })),
};
await fs.writeFile(
  path.join(outDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(
  `Voice assets: ${copied}/${clips.size} available (${downloaded} downloaded, ${copied - downloaded} restored from cache)`,
);
if (failures.length) {
  console.warn(`Voice assets unavailable: ${failures.map((item) => item.filename).join(", ")}`);
  if (requireComplete) process.exitCode = 1;
}
