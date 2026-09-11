import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { helpVoiceClip, helpVoiceClipCount } from "../src/audio/helpVoiceClips.js";

const rhythm = readFileSync(new URL("../src/games/RhythmGame.jsx", import.meta.url), "utf8");
const explore = readFileSync(new URL("../src/games/ExploreGame.jsx", import.meta.url), "utf8");
const match = readFileSync(new URL("../src/games/MatchGame.jsx", import.meta.url), "utf8");
const fetchScript = readFileSync(new URL("../scripts/fetch-voice-assets.mjs", import.meta.url), "utf8");
const verifyScript = readFileSync(new URL("../scripts/verify-build.mjs", import.meta.url), "utf8");

test("common game help prompts use natural recorded Mino voice", () => {
  const pairs = [
    ["Folge den leuchtenden Tasten.", "de", rhythm],
    ["Parlayan tuşları takip et.", "tr", rhythm],
    ["Wische und entdecke die anderen Bilder.", "de", explore],
    ["Kaydır ve diğer resimleri keşfet.", "tr", explore],
    ["Tippe auf ein Bild und dann auf seinen Zwilling.", "de", match],
    ["Önce resmi, sonra eşini seç.", "tr", match],
  ];
  for (const [phrase, lang, game] of pairs) {
    assert.ok(game.includes(phrase), `game no longer uses expected help prompt: ${phrase}`);
    const clip = helpVoiceClip(phrase, lang);
    assert.match(clip, /^https:\/\/storage\.googleapis\.com\/.+\.mp3$/u, `missing natural help clip: ${phrase}`);
  }
  assert.ok(helpVoiceClipCount >= 6);
});

test("help voice library participates in offline production voice pipeline", () => {
  assert.match(fetchScript, /src\/audio\/helpVoiceClips\.js/);
  assert.match(verifyScript, /src\/audio\/helpVoiceClips\.js/);
});
