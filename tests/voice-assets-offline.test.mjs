import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pkg = readFileSync(new URL("../package.json", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");
const worker = readFileSync(new URL("../scripts/build-sw.mjs", import.meta.url), "utf8");
const downloader = readFileSync(new URL("../scripts/fetch-voice-assets.mjs", import.meta.url), "utf8");
const voice = readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

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

test("voice asset downloader covers fixed prompts, natural plans and modular animal vocabulary", () => {
  assert.match(downloader, /src\/audio\/gameVoiceClips\.js/);
  assert.match(downloader, /src\/audio\/animalVoiceClips\.js/);
  assert.match(downloader, /src\/audio\/naturalVoicePlans\.js/);
  assert.match(downloader, /fetchWithRetry/);
  assert.match(downloader, /\.voice-cache/);
  assert.match(downloader, /dist\/assets\/voice/);
});

test("service worker precaches localized voice files", () => {
  assert.match(worker, /p\.startsWith\("assets\/voice\/"\)/);
});

test("runtime prefers local recording, then remote recording, without automatic robot speech", () => {
  const localIndex = voice.indexOf("speakGameClip(localClip, token)");
  const remoteIndex = voice.indexOf("return speakGameClip(url, token)");
  const optInIndex = voice.indexOf("settings.systemVoiceFallback === true");
  const systemIndex = voice.indexOf("return speakSystem(text, lang, settings, token)");
  assert.ok(localIndex > 0, "local natural clip must be attempted first");
  assert.ok(remoteIndex > localIndex, "remote recording must remain the recording fallback");
  assert.ok(optInIndex > remoteIndex, "system voice must not be considered before recorded audio");
  assert.ok(systemIndex > optInIndex, "browser speech must only exist behind explicit opt-in");
  assert.match(voice, /assets\/voice\/\$\{filename\}/);
  assert.match(voice, /naturalVoicePlan\(text, lang\)/);
  assert.match(voice, /if \(settings\.systemVoiceFallback === true\)/);
});
