import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
const FIXED_CLIP = "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/00000000-0000-0000-0000-000000000001.mp3";
const voiceSourceForHarness = () => read("src/audio/voice.js")
  .replace(/^import .*;\n/gm, "")
  .replace(/import \{[\s\S]*?\} from "\.\/systemVoice4\.js";\n/u, "")
  .replace(/export /g, "");
const voiceHarness = (Audio, fixedNaturalVoicePlan, setSpeechActive) =>
  new Function(
    "Audio",
    "fixedNaturalVoicePlan",
    "isFixedNaturalVoiceClipUrl",
    "setSpeechActive",
    "hasVoice4Selection",
    "speakWithVoice4",
    "stopSystemVoice4",
    "systemVoice4Available",
    "voice4InventoryReady",
    `${voiceSourceForHarness()}; return {speak, stopSpeech, unlockVoiceAudio};`,
  )(
    Audio,
    fixedNaturalVoicePlan,
    () => true,
    setSpeechActive,
    () => false,
    async () => false,
    () => {},
    () => false,
    () => false,
  );

test("late audio unlock cannot pause a new narration or replace its handlers", async () => {
  let player, finishUnlock, plays = 0, pauses = 0;
  class Audio {
    constructor() { player = this; }
    setAttribute() {}
    pause() { pauses++; }
    load() {}
    play() {
      plays++;
      return plays === 1 ? new Promise((resolve) => { finishUnlock = resolve; }) : Promise.resolve();
    }
  }
  const api = voiceHarness(Audio, () => [FIXED_CLIP], () => {});
  const unlock = api.unlockVoiceAudio();
  const duplicate = api.unlockVoiceAudio();
  assert.equal(plays, 1);
  const narration = api.speak("Hallo");
  const handler = player.onended;
  const pauseCount = pauses;
  finishUnlock();
  assert.equal(await unlock, false, "a superseded unlock must not report readiness for its old gesture");
  assert.equal(await duplicate, false);
  assert.equal(pauses, pauseCount);
  assert.equal(player.onended, handler);
  assert.equal(await api.unlockVoiceAudio(), true);
  assert.equal(player.src, FIXED_CLIP);
  assert.equal(player.onended, handler);
  assert.equal(plays, 2);
  player.onended();
  assert.equal(await narration, true);
});

test("speech ducking survives cancellation and ends on completion or audio off", async () => {
  const levels = [];
  let player;
  class Audio {
    constructor() { player = this; }
    setAttribute() {}
    pause() {}
    load() {}
    play() { return Promise.resolve(); }
  }
  const api = voiceHarness(Audio, () => [FIXED_CLIP], (active) => levels.push(active));
  const first = api.speak("eins");
  assert.equal(levels.at(-1), true);
  const second = api.speak("zwei");
  assert.equal(await first, false);
  assert.equal(levels.at(-1), true);
  player.onended();
  assert.equal(await second, true);
  assert.equal(levels.at(-1), false);
  const third = api.speak("drei");
  assert.equal(await api.speak("stumm", "de", {audio: false}), false);
  assert.equal(await third, false);
  assert.equal(levels.at(-1), false);
});

test("music output is attenuated without altering speech volume", () => {
  const source = read("src/audio/sounds.js");
  assert.match(source, /g.connect\(musicBus\)/);
  assert.match(source, /speechActive \? 0.18 : 1/);
  assert.match(source, /setTargetAtTime/);
});

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
  const source = read("src/audio/sounds.js")
    .replace(/^import .*;\n/gm, "")
    .replace(/export /g, "");
  const musicStyleProfile = () => ({
    id: "playful",
    notes: [261.6, 329.6],
    intervalMs: 720,
    duration: 0.62,
    type: "triangle",
    volume: 0.018,
    octaveEcho: 0,
  });
  const api = new Function("window", "clearInterval", "musicStyleProfile", source + "; return {startMusic, stopMusic, setMusicPaused};")(
    window,
    () => { cleared++; },
    musicStyleProfile,
  );
  assert.equal(api.startMusic(), true);
  api.setMusicPaused(true);
  assert.equal(cleared, 1);
  assert.ok(stops >= 1);
  assert.equal(api.startMusic(), false);
  assert.equal(starts, 1);
  api.setMusicPaused(false);
  // Legacy callers may still pass an `enabled` field. Music on/off now belongs
  // to the selected profile, so narration state must not silence it.
  assert.equal(api.startMusic({enabled: false}), true);
  assert.equal(starts, 2);
  api.stopMusic();
});

test("game pause keeps a dedicated music lock while narration no longer owns music on/off", () => {
  const game = read("src/games/GameSession.jsx");
  const sounds = read("src/audio/sounds.js");
  assert.match(game, /const pauseManually[\s\S]*?setMusicPaused\(true\)/);
  assert.equal((game.match(/startMusic\(\{ enabled: settings.audio \}\)/g) || []).length, 2);
  assert.match(game, /stopMusic\(\);\s*setMusicPaused\(false\)/);
  assert.match(sounds, /export function startMusic\(\{ style \} = \{\}\)/);
  assert.doesNotMatch(sounds, /!enabled \|\| profile\.id === "off"/);
});

test("music stops on background and resumes only after a visible gesture", () => {
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
  const hook = new Function(
    "useEffect",
    "useRef",
    "unlockAudio",
    "startMusic",
    "stopMusic",
    "getMusicStyle",
    "unlockVoiceAudio",
    "primeSystemSpeechForIOS",
    "window",
    "document",
    `${source}; return useAudioPrime;`,
  )(
    (effect) => { cleanup = effect(); },
    (value) => ({ current: value }),
    () => ({ state: "running" }),
    () => { starts++; },
    () => { stops++; },
    () => "playful",
    () => Promise.resolve(true),
    () => true,
    target,
    document,
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

test("app primes narration and effects independently on direct user gestures", () => {
  const app = read("src/App.jsx");
  const hook = read("src/app/useAudioPrime.js");
  const voice = read("src/audio/voice.js");
  assert.match(app, /useAudioPrime\(progress\.settings\.audio, progress\.settings\.sfx\)/);
  assert.match(hook, /voiceEnabledRef/);
  assert.match(hook, /sfxEnabledRef/);
  assert.match(hook, /addEventListener\("pointerdown", prime, true\)/);
  assert.match(hook, /addEventListener\("touchstart", prime, true\)/);
  assert.match(hook, /addEventListener\("keydown", prime, true\)/);
  assert.match(hook, /unlockAudio\(\)/);
  assert.match(hook, /unlockVoiceAudio\(\)/);
  assert.match(voice, /voicePlayer = new Audio\(\)/);
  assert.match(voice, /voicePlayer\.preload = "none"/);
});

test("background music follows its own profile instead of narration audio", () => {
  const app = read("src/App.jsx");
  const hook = read("src/app/useAudioPrime.js");
  const picker = read("src/components/MusicPicker.jsx");
  assert.match(hook, /const wantsMusic = getMusicStyle\(\) !== "off"/);
  assert.match(hook, /if \(wantsMusic\) startMusic\(\)/);
  assert.match(picker, /if \(selected !== "off"\) startMusic\(\{ style: selected \}\)/);
  assert.match(app, /<MusicPicker lang=\{lang\} \/>/);
  assert.doesNotMatch(app, /<MusicPicker[^>]*enabled=/);
  const voiceToggle = app.match(/className="audio-toggle"[\s\S]*?<\/button>/)?.[0] || "";
  assert.doesNotMatch(voiceToggle, /stopMusic\(\)/);
});

test("audio priming re-arms readiness after returning from the background without autoplaying", () => {
  const hook = read("src/app/useAudioPrime.js");
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /document\.visibilityState === "visible"\) \{[\s\S]*voiceReady = false;[\s\S]*lastPrimeAt = 0;/);
  assert.doesNotMatch(hook, /resumeAfterBackground[\s\S]*unlockVoiceAudio\(\)/);
  assert.doesNotMatch(hook, /resumeAfterBackground[\s\S]*startMusic\(\)/);
});

test("voice module never eagerly preloads the complete library during boot", () => {
  const voice = read("src/audio/voice.js");
  assert.doesNotMatch(voice, /preloadGameVoiceClips\(\)/);
  assert.doesNotMatch(voice, /preloadNaturalVoicePlans\(\)/);
  assert.doesNotMatch(voice, /import \{ preloadGameVoiceClips/);
  assert.doesNotMatch(voice, /preloadNaturalVoicePlans/);
});
