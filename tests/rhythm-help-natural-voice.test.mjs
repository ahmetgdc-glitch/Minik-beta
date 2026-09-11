import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { naturalVoicePlan } from "../src/audio/naturalVoicePlans.js";

const rhythm = readFileSync(new URL("../src/games/RhythmGame.jsx", import.meta.url), "utf8");
const help = readFileSync(new URL("../src/audio/helpVoiceClips.js", import.meta.url), "utf8");
const downloader = readFileSync(new URL("../scripts/fetch-voice-assets.mjs", import.meta.url), "utf8");
const verifier = readFileSync(new URL("../scripts/verify-build.mjs", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8");

test("rhythm help is naturally recorded in both languages", () => {
  for (const [text, lang] of [
    ["Folge den leuchtenden Tasten.", "de"],
    ["Parlayan tuşları takip et.", "tr"],
  ]) {
    assert.ok(rhythm.includes(text));
    assert.ok(help.includes(text));
    assert.ok(naturalVoicePlan(text, lang).length > 0, `missing natural help plan: ${text}`);
  }
});

test("rhythm help recordings are part of the offline production pipeline", () => {
  for (const source of [downloader, verifier, workflow]) assert.match(source, /helpVoiceClips\.js/);
});
