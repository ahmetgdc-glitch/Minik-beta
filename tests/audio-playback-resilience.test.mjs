import test from "node:test";
import assert from "node:assert/strict";
import { setImmediate as nextTurn } from "node:timers/promises";
import { voiceRuntime } from "./helpers/voice-runtime.mjs";

class MediaAudio {
  setAttribute() {}
  pause() {}
  load() {}
  play() {
    queueMicrotask(() => this.onended?.());
    return Promise.resolve();
  }
}

function audioContext(overrides = {}) {
  return Object.assign(
    {
      state: "running",
      destination: {},
      resume: async () => {},
      decodeAudioData: async () => ({
        duration: 1,
        length: 44100,
        numberOfChannels: 1,
      }),
      createBufferSource() {
        return {
          connect() {},
          disconnect() {},
          stop() {},
          start() {
            queueMicrotask(() => this.onended?.());
          },
        };
      },
    },
    overrides,
  );
}

test("a late iOS unlock cannot replace a newer spoken word with silence", async (t) => {
  let resume;
  const resumed = new Promise((resolve) => {
    resume = resolve;
  });
  const context = audioContext({ state: "suspended", resume: () => resumed });
  const played = [];
  class Audio extends MediaAudio {
    play() {
      played.push(this.src);
      return Promise.resolve();
    }
  }
  const window = Object.assign(new EventTarget(), {
    AudioContext: function () {
      return context;
    },
  });
  const { voice } = await voiceRuntime(t, { Audio, window });
  const unlocking = voice.unlockVoiceAudio();
  const speaking = voice.speak("Löwe", "de");
  assert.equal(played.length, 1);
  context.state = "running";
  resume();
  assert.equal(
    await unlocking,
    false,
    "a cancelled unlock must not report readiness",
  );
  await nextTurn();
  assert.equal(
    played.length,
    1,
    "the old resume must not play SILENT_WAV over the new word",
  );
  voice.stopSpeech();
  assert.equal(await speaking, false);
});

for (const stall of ["start", "end"]) {
  test(`stalled media ${stall} settles and permits the next word`, async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let stalled = true;
    class Audio extends MediaAudio {
      play() {
        return stalled
          ? stall === "start"
            ? new Promise(() => {})
            : Promise.resolve()
          : super.play();
      }
    }
    const { voice } = await voiceRuntime(t, { Audio });
    let result;
    voice.speak("Löwe", "de").then((value) => {
      result = value;
    });
    await nextTurn();
    for (let step = 0; step < 12 && result === undefined; step++) {
      t.mock.timers.tick(5000);
      await nextTurn();
    }
    assert.equal(
      result,
      false,
      "a browser that never settles play() cannot keep narration active forever",
    );
    stalled = false;
    assert.equal(await voice.speak("Harika!", "tr"), true);
  });
}

test("cancelling a stalled download resolves speech and allows the same clip to retry", async (t) => {
  const context = audioContext();
  const window = Object.assign(new EventTarget(), {
    AudioContext: function () {
      return context;
    },
  });
  let stalled = true;
  let downloadSignal;
  let downloads = 0;
  const fetch = async (url, options) => {
    downloads++;
    downloadSignal = options.signal;
    if (stalled) return new Promise(() => {});
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(16) };
  };
  const { voice } = await voiceRuntime(t, { Audio: MediaAudio, window, fetch });
  assert.equal(await voice.unlockVoiceAudio(), true);
  let result;
  voice.speak("Löwe", "de").then((value) => {
    result = value;
  });
  await nextTurn();
  voice.stopSpeech();
  await nextTurn();
  assert.equal(
    result,
    false,
    "stopSpeech must also settle speech still waiting for a download",
  );
  assert.equal(downloadSignal?.aborted, true);
  stalled = false;
  assert.equal(await voice.speak("Löwe", "de"), true);
  assert.equal(
    downloads,
    2,
    "a cancelled promise must not poison the decoded audio cache",
  );
});

test("decoded voice buffers stay within a bounded memory budget", async (t) => {
  // Metadata models 8 MiB per clip without allocating that memory in the test.
  const context = audioContext({
    decodeAudioData: async () => ({
      duration: 1,
      length: 2 * 1024 * 1024,
      numberOfChannels: 1,
    }),
  });
  const window = Object.assign(new EventTarget(), {
    AudioContext: function () {
      return context;
    },
  });
  let downloads = 0;
  const fetch = async () => {
    downloads++;
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(16) };
  };
  const { voice } = await voiceRuntime(t, { Audio: MediaAudio, window, fetch });
  await voice.unlockVoiceAudio();
  for (const word of ["Löwe", "Hund", "Katze", "Löwe"]) {
    assert.equal(await voice.speak(word, "de"), true);
  }
  assert.equal(
    downloads,
    4,
    "older decoded clips must be released when the memory budget is exceeded",
  );
});

for (const failure of ["decode-stall", "source-stall", "source-error"]) {
  test(`fixed narration survives a WebAudio ${failure} using the same recorded clip`, async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let sourceStopped = false;
    const context = audioContext();
    if (failure === "decode-stall")
      context.decodeAudioData = () => new Promise(() => {});
    if (failure === "source-error")
      context.createBufferSource = () => {
        throw new Error("interrupted audio engine");
      };
    if (failure === "source-stall")
      context.createBufferSource = () => ({
        connect() {},
        disconnect() {},
        start() {},
        stop() {
          sourceStopped = true;
        },
      });
    const window = Object.assign(new EventTarget(), {
      AudioContext: function () {
        return context;
      },
    });
    const media = [];
    class Audio extends MediaAudio {
      play() {
        if (!this.src.startsWith("data:")) media.push(this.src);
        return super.play();
      }
    }
    const fetch = async () => ({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(16),
    });
    const { voice } = await voiceRuntime(t, { Audio, window, fetch });
    await voice.unlockVoiceAudio();
    const speaking = voice.speak("Löwe", "de");
    await nextTurn();
    t.mock.timers.tick(5000);
    await nextTurn();
    assert.equal(await speaking, true);
    assert.equal(
      media.length,
      1,
      "WebAudio failure must use the fixed local recording through HTML Audio",
    );
    assert.match(
      media[0],
      /^https:\/\/minik\.example\/Minik-beta\/assets\/voice\//,
    );
    if (failure === "source-stall")
      assert.equal(
        sourceStopped,
        true,
        "a timed-out source must not resume over the fallback",
      );
  });
}

test("a late rejection from an interrupted word cannot clear the next word's handlers", async (t) => {
  const pending = [];
  let player;
  class Audio extends MediaAudio {
    constructor() {
      super();
      player = this;
    }
    play() {
      return new Promise((resolve, reject) => {
        pending.push({ resolve, reject });
      });
    }
  }
  const { voice } = await voiceRuntime(t, { Audio });
  const first = voice.speak("Löwe", "de");
  const second = voice.speak("Harika!", "tr");
  pending[0].reject(new Error("late interruption"));
  await nextTurn();
  pending[1].resolve();
  player.onended();
  assert.equal(await first, false);
  assert.equal(await second, true);
});
