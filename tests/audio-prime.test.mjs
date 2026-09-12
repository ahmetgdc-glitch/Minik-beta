import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("manual music pause blocks gesture restarts until explicit resume", () => {
  let starts = 0, stops = 0, cleared = 0;
  const param = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
  const window = {
    AudioContext: class {
      state = "running";
      currentTime = 0;
      createOscillator() { return { frequency: param, connect() {}, disconnect() {}, start() { starts++; }, stop() { stops++; } }; }
      createGain() { return { gain: param, connect() {}, disconnect() {} }; }
    },
    setInterval() { return 1; },
  };
  const api = new Function("window", "clearInterval", read("src/audio/sounds.js").replace(/export /g, "") + "; return {startMusic, stopMusic, setMusicPaused};")(window, () => { cleared++; });
  assert.equal(api.startMusic(), true);
  api.setMusicPaused(true);
  assert.equal(cleared, 1);
  assert.ok(stops >= 2);
  assert.equal(api.startMusic(), false);
  assert.equal(starts, 1);
  api.setMusicPaused(false);
  assert.equal(api.startMusic({enabled: false}), false);
  assert.equal(api.startMusic(), true);
  assert.equal(starts, 2);
  api.stopMusic();
});

test("game manual pause sets the music lock and both resume paths honor audio", () => {
  const game = read("src/games/GameSession.jsx");
  assert.match(game, /const pauseManually[\s\S]*?setMusicPaused\(true\)/);
  assert.equal((game.match(/startMusic\(\{ enabled: settings.audio \}\)/g) || []).length, 2);
  assert.match(game, /stopMusic\(\);\s*setMusicPaused\(false\)/);
});

test("music stops on background and pagehide and resumes only after a visible gesture", () => {
  const listeners = new Map();
  const target = {
    addEventListener: (event, fn) => listeners.set(event, fn),
    removeEventListener: (event) => listeners.delete(event),
  };
  const document = { ...target, visibilityState: "visible" };
  let starts = 0, stops = 0, cleanup;
  const source = read("src/app/useAudioPrime.js")
    .replace(/^import .*;\n/gm, "")
    .replace("export function", "function");
  const hook = new Function("useEffect", "unlockAudio", "startMusic", "stopMusic", "unlockVoiceAudio", "window", "document", `${source}; return useAudioPrime;`)(
    (effect) => { cleanup = effect(); },
    () => ({ state: "running" }),
    () => { starts++; },
    () => { stops++; },
    () => Promise.resolve(true), target, document,
  );
  hook(true, true);
  listeners.get("pointerdown")();
  assert.equal(starts, 1);
  document.visibilityState = "hidden";
  listeners.get("visibilitychange")();
  assert.equal(stops, 1);
  listeners.get("pointerdown")();
  assert.equal(starts, 1);
  document.visibilityState = "visible";
  listeners.get("visibilitychange")();
  assert.equal(starts, 1);
  listeners.get("pointerdown")();
  assert.equal(starts, 2);
  listeners.get("pagehide")();
  assert.equal(stops, 3);
  cleanup();
  assert.equal(listeners.size, 0);
});

test("app primes WebAudio and one lazy voice player on the first direct user gesture", () => {
  const app = read("src/App.jsx");
  const hook = read("src/app/useAudioPrime.js");
  const voice = read("src/audio/voice.js");
  assert.match(app, /useAudioPrime\([\s\S]*progress\.settings\.audio \|\| progress\.settings\.sfx,[\s\S]*progress\.settings\.audio/);
  assert.match(hook, /addEventListener\("pointerdown", prime, true\)/);
  assert.match(hook, /addEventListener\("touchstart", prime, true\)/);
  assert.match(hook, /addEventListener\("keydown", prime, true\)/);
  assert.match(hook, /unlockAudio\(\)/);
  assert.match(hook, /unlockVoiceAudio\(\)/);
  assert.match(voice, /voicePlayer = new Audio\(\)/);
  assert.match(voice, /voicePlayer\.preload = "none"/);
});

test("background music follows narration audio and stops during hook cleanup", () => {
  const hook = read("src/app/useAudioPrime.js");
  assert.match(hook, /startMusic\(\{ enabled: musicEnabled \}\)/);
  assert.match(hook, /return \(\) => \{[\s\S]*stopMusic\(\)/);
  assert.match(hook, /\[enabled, musicEnabled\]/);
});

test("audio priming re-arms after returning from the background without autoplaying", () => {
  const hook = read("src/app/useAudioPrime.js");
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /document\.visibilityState !== "visible"/);
  assert.match(hook, /webAudioReady = false/);
  assert.doesNotMatch(hook, /resumeAfterBackground[\s\S]*unlockVoiceAudio\(\)/);
});

test("voice module never eagerly preloads the complete library during boot", () => {
  const voice = read("src/audio/voice.js");
  assert.doesNotMatch(voice, /preloadGameVoiceClips\(\)/);
  assert.doesNotMatch(voice, /preloadNaturalVoicePlans\(\)/);
  assert.doesNotMatch(voice, /import \{ preloadGameVoiceClips/);
  assert.doesNotMatch(voice, /preloadNaturalVoicePlans/);
});
