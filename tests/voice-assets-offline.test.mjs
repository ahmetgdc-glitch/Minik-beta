import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pkg = readFileSync(new URL("../package.json", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");
const worker = readFileSync(new URL("../scripts/build-sw.mjs", import.meta.url), "utf8");
const downloader = readFileSync(new URL("../scripts/fetch-voice-assets.mjs", import.meta.url), "utf8");
const voice = readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");
const systemVoice4 = readFileSync(new URL("../src/audio/systemVoice4.js", import.meta.url), "utf8");

test("production build localizes natural voice files before generating the service worker", () => {
  const downloadIndex = pkg.indexOf("fetch-voice-assets.mjs");
  const workerIndex = pkg.indexOf("build-sw.mjs");
  assert.ok(downloadIndex > 0, "voice asset localization must be part of npm build");
  assert.ok(workerIndex > downloadIndex, "service worker must be generated after voice files exist");
});

test("CI caches voice assets and requires a complete localized library", () => {
  assert.match(workflow, /actions\/cache@v4/);
  assert.match(workflow, /path: \.voice-cache/);
  assert.match(workflow, /MINIK_REQUIRE_LOCAL_VOICE: "1"/);
});

test("voice asset downloader covers prompts and modular learning vocabulary", () => {
  assert.match(downloader, /src\/audio\/gameVoiceClips\.js/);
  assert.match(downloader, /src\/audio\/animalVoiceClips\.js/);
  assert.match(downloader, /src\/audio\/foodVoiceClips\.js/);
  assert.match(downloader, /src\/audio\/naturalVoicePlans\.js/);
  assert.match(downloader, /src\/audio\/helpVoiceClips\.js/);
  assert.match(downloader, /fetchWithRetry/);
  assert.match(downloader, /\.voice-cache/);
  assert.match(downloader, /dist\/assets\/voice/);
});

test("localized voice files are packaged but cached only after use", () => {
  assert.doesNotMatch(worker, /p\.startsWith\("assets\/voice\/"\)/);
  assert.match(worker, /const response=await fetch\(event\.request\)/);
  assert.match(worker, /await cache\.put\(event\.request,response\.clone\(\)\)/);
});

test("runtime prefers fixed natural offline narration before optional Voice 4", () => {
  const planIndex = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const playbackIndex = voice.indexOf("speakNaturalPlan(plan, token)");
  const systemIndex = voice.indexOf("speakWithVoice4(");
  assert.ok(planIndex > 0, "fixed natural narrator must be resolved first");
  assert.ok(playbackIndex > planIndex, "fixed natural narrator must be played first");
  assert.ok(systemIndex > playbackIndex, "Voice 4 must remain only a later fallback");
  assert.doesNotMatch(voice, /personalVoiceClip/);
  assert.match(systemVoice4, /VOICE4_RE/);
  assert.doesNotMatch(systemVoice4, /voice\?\.default|voice\?\.localService|sameLanguage\[0\]|voices\[0\]/);
  assert.match(voice, /assets\/voice\/\$\{filename\}/);
});
