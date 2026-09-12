import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) =>
  fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const sounds = read("src/audio/sounds.js");
const voice = read("src/audio/voice.js");
const app = read("src/App.jsx");
const game = read("src/games/GameSession.jsx");

test("background music uses a separate quiet WebAudio lifecycle", () => {
  assert.match(sounds, /musicNodes = \[\]/);
  assert.match(sounds, /musicTimers = \[\]/);
  assert.match(sounds, /musicPauseReasons = new Set\(\)/);
  assert.match(sounds, /export function setBackgroundMusicEnabled/);
  assert.match(sounds, /export function pauseBackgroundMusic/);
  assert.match(sounds, /export function resumeBackgroundMusic/);
  assert.match(sounds, /context\?\.state === "running"/);
  assert.match(sounds, /0\.011/);
  assert.doesNotMatch(
    sounds,
    /export function stopSounds\(\)[\s\S]*musicNodes[\s\S]*function tone/,
  );
});

test("MINIK speech owns the music pause while a recording is playing", () => {
  assert.match(voice, /pauseBackgroundMusic\("speech"\)/);
  assert.match(voice, /finally \{[\s\S]*resumeBackgroundMusic\("speech"\)/);
  assert.doesNotMatch(
    voice,
    /speechSynthesis|SpeechSynthesisUtterance|systemVoiceEnabled|speakSystem/,
  );
});

test("app audio controls and navigation keep the central audio lifecycle consistent", () => {
  assert.match(app, /setBackgroundMusicEnabled\(nextAudio\)/);
  assert.match(app, /pauseBackgroundMusic\("language-switch"\)/);
  assert.match(app, /resumeBackgroundMusic\("language-switch"\)/);
  assert.match(app, /function go\(path\) \{[\s\S]*stopSpeech\(\);[\s\S]*stopSounds\(\);/);
});

test("game pause and lifecycle backgrounding stop music until safe resume", () => {
  assert.match(
    game,
    /const pauseManually = useCallback\([\s\S]*pauseBackgroundMusic\("game-pause"\)/,
  );
  assert.match(
    game,
    /document\.hidden[\s\S]*pauseBackgroundMusic\("game-pause"\)[\s\S]*stopSpeech\(\)[\s\S]*stopSounds\(\)/,
  );
  assert.match(game, /resumeBackgroundMusic\("game-pause"\)/);
});
