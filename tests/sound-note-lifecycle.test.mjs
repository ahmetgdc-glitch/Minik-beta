import test from "node:test";
import assert from "node:assert/strict";

let instance = 0;
async function soundRuntime(t, { suspended = false } = {}) {
  const heard = [];
  let release;
  const resumed = new Promise((resolve) => { release = resolve; });
  const context = {
    state: suspended ? "suspended" : "running",
    currentTime: 0,
    destination: {},
    resume() { return resumed.then(() => { this.state = "running"; }); },
    createOscillator() {
      return {
        frequency: { value: 0, setValueAtTime(value) { this.value = value; } },
        connect() {}, disconnect() {}, stop() {},
        start() { heard.push(this.frequency.value); },
      };
    },
    createGain() {
      return {
        gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}, disconnect() {},
      };
    },
  };
  const document = { hidden: false, visibilityState: "visible" };
  const values = { document, window: { AudioContext: function () { return context; } } };
  const saved = new Map();
  for (const [key, value] of Object.entries(values)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  let sound;
  t.after(() => {
    sound?.stopSounds();
    release();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  sound = await import("../src/audio/sounds.js?note-runtime=" + (++instance));
  return { sound, heard, document, release };
}

test("a cancelled rhythm note stays silent after a delayed audio resume", async (t) => {
  const { sound, heard, release } = await soundRuntime(t, { suspended: true });
  const pending = sound.playNote(0);
  sound.stopSounds();
  release();
  assert.equal(await pending, false);
  assert.deepEqual(heard, []);
});

test("Mino narration invalidates a waiting note even when the speech finishes before resume", async (t) => {
  const { sound, heard, release } = await soundRuntime(t, { suspended: true });
  const pending = sound.playNote(0);
  sound.setSpeechActive(true);
  sound.setSpeechActive(false);
  release();
  assert.equal(await pending, false);
  assert.deepEqual(heard, []);
});

test("rapid rhythm taps cannot start two old notes when the audio engine resumes", async (t) => {
  const { sound, heard, release } = await soundRuntime(t, { suspended: true });
  const first = sound.playNote(0);
  const second = sound.playNote(2);
  release();
  assert.equal(await first, false);
  assert.equal(await second, true);
  assert.deepEqual(heard, [392], "Only the most recently requested note may start");
});

test("rhythm notes do not compete with narration already in progress", async (t) => {
  const { sound, heard } = await soundRuntime(t);
  sound.setSpeechActive(true);
  assert.equal(await sound.playNote(1), false);
  assert.deepEqual(heard, []);
  sound.setSpeechActive(false);
  assert.equal(await sound.playNote(1), true);
  assert.deepEqual(heard, [329.6]);
});

test("a hidden page cannot start a note after a delayed resume", async (t) => {
  const { sound, heard, document, release } = await soundRuntime(t, { suspended: true });
  const pending = sound.playNote(0);
  document.hidden = true;
  document.visibilityState = "hidden";
  release();
  assert.equal(await pending, false);
  assert.deepEqual(heard, []);
  document.hidden = false;
  document.visibilityState = "visible";
  assert.equal(await sound.playNote(3), true);
  assert.deepEqual(heard, [523.2], "A fresh foreground tap still works");
});

test("a newer game sound replaces a waiting rhythm note without later overlap", async (t) => {
  const { sound, heard, release } = await soundRuntime(t, { suspended: true });
  const pending = sound.playNote(0);
  sound.playSound("tap");
  release();
  assert.equal(await pending, false);
  assert.deepEqual(heard, [620]);
});

test("stopping one note does not poison the next rhythm interaction", async (t) => {
  const { sound, heard } = await soundRuntime(t);
  const pending = sound.playNote(0);
  sound.stopSounds();
  assert.equal(await pending, false);
  assert.equal(await sound.playNote(2), true);
  assert.deepEqual(heard, [392]);
});
