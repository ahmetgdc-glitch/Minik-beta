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

test("local recordings begin buffering before the decoder fallback deadline", async (t) => {
  let preload = "";
  class Audio extends MediaAudio {
    set preload(value) {
      preload = value;
    }
    get preload() {
      return preload;
    }
  }
  const { voice } = await voiceRuntime(t, { Audio });
  assert.equal(await voice.speak("Löwe", "de"), true);
  assert.equal(preload, "auto");
});

test("Turkish media uses CORS for cached ranges and preserves external fallback playback", async (t) => {
  const loads = [];
  let failLocal = false;
  class Audio extends MediaAudio {
    load() { loads.push({ url: this.src, crossOrigin: this.crossOrigin }); }
    play() {
      if (failLocal && this.src.startsWith("https://minik.example/")) return Promise.reject(new Error("local failure"));
      return super.play();
    }
  }
  const { voice } = await voiceRuntime(t, { Audio });
  assert.equal(await voice.speak("Harika!", "tr"), true);
  assert.equal(loads[0].crossOrigin, "anonymous");
  failLocal = true;
  assert.equal(await voice.speak("Harika!", "tr"), true);
  assert.ok(loads.some((load) => !load.url.startsWith("https://minik.example/") && load.crossOrigin === null));
  failLocal = false;
  assert.equal(await voice.speak("Harika!", "tr"), true);
  assert.equal(loads.at(-1).crossOrigin, "anonymous", "Local playback must regain CORS after a remote fallback");
});

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

test("cancelling a stalled background decode aborts it and allows the same clip to retry", async (t) => {
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
  assert.equal(
    await voice.speak("Löwe", "de"),
    true,
    "media playback must not wait for a stalled optional decoder",
  );
  assert.equal(downloadSignal?.aborted, false);
  voice.stopSpeech();
  await nextTurn();
  assert.equal(downloadSignal?.aborted, true);
  stalled = false;
  assert.equal(await voice.speak("Löwe", "de"), true);
  assert.equal(
    downloads,
    2,
    "a cancelled background decode must not poison the decoded audio cache",
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
    await nextTurn();
  }
  assert.equal(
    downloads,
    4,
    "older decoded clips must be released when the memory budget is exceeded",
  );
});

for (const slowStage of ["download", "decode"]) {
  test(`slow ${slowStage} does not delay the first local recording`, async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let release;
    let sources = 0;
    let signal;
    const delayed = new Promise((resolve) => { release = resolve; });
    const buffer = { duration: 1, length: 44100, numberOfChannels: 1 };
    const response = { ok: true, arrayBuffer: async () => new ArrayBuffer(16) };
    const context = audioContext({
      decodeAudioData: () => slowStage === "decode" ? delayed : Promise.resolve(buffer),
      createBufferSource() { sources++; throw new Error("background decoder must not play"); },
    });
    const window = Object.assign(new EventTarget(), { AudioContext: function () { return context; } });
    const media = [];
    class Audio extends MediaAudio {
      play() {
        if (!this.src.startsWith("data:")) media.push(this.src);
        return super.play();
      }
    }
    const fetch = async (_url, options) => {
      signal = options.signal;
      return slowStage === "download" ? delayed : response;
    };
    const { voice } = await voiceRuntime(t, { Audio, window, fetch });
    await voice.unlockVoiceAudio();
    const speaking = voice.speak("Löwe", "de");
    await nextTurn();
    assert.equal(media.length, 1, "HTML Audio must start without waiting for the decoder budget");
    assert.match(media[0], /^https:\/\/minik\.example\/Minik-beta\/assets\/voice\//);
    assert.equal(await speaking, true);
    assert.equal(signal?.aborted, false);
    t.mock.timers.tick(500);
    await nextTurn();
    assert.equal(signal?.aborted, true, "the optional background decode still respects its budget");
    release(slowStage === "download" ? response : buffer);
    await nextTurn();
    assert.equal(sources, 0, "background decode can warm the cache but cannot start a second voice");
    assert.equal(media.length, 1);
  });
}

test("fixed narration survives a stalled background decode using the same recorded clip", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const context = audioContext({ decodeAudioData: () => new Promise(() => {}) });
  const window = Object.assign(new EventTarget(), { AudioContext: function () { return context; } });
  const media = [];
  class Audio extends MediaAudio {
    play() {
      if (!this.src.startsWith("data:")) media.push(this.src);
      return super.play();
    }
  }
  const fetch = async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(16) });
  const { voice } = await voiceRuntime(t, { Audio, window, fetch });
  await voice.unlockVoiceAudio();
  assert.equal(await voice.speak("Löwe", "de"), true);
  assert.equal(media.length, 1);
  t.mock.timers.tick(500);
  await nextTurn();
  assert.equal(media.length, 1, "a late decoder must never start a second copy of the word");
});

for (const failure of ["source-stall", "source-error"]) {
  test(`cached fixed narration survives a WebAudio ${failure} using the same recorded clip`, async (t) => {
    t.mock.timers.enable({ apis: ["setTimeout"] });
    let decoded;
    const decodedReady = new Promise((resolve) => { decoded = resolve; });
    let sourceStopped = false;
    const context = audioContext({
      decodeAudioData: async () => {
        decoded();
        return { duration: 1, length: 44100, numberOfChannels: 1 };
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
    assert.equal(await voice.speak("Löwe", "de"), true);
    await decodedReady;
    await nextTurn();
    media.length = 0;

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

    const speaking = voice.speak("Löwe", "de");
    await nextTurn();
    if (failure === "source-stall") {
      t.mock.timers.tick(5000);
      await nextTurn();
    }
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
