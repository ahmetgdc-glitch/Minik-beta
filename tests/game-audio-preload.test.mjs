import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const FIXED_CLIP =
  "https://storage.googleapis.com/adm--audio-playback--7d--public/mcp-preview/00000000-0000-0000-0000-00000000000a.mp3";
const LOCAL_CLIP = "/Minik-beta/assets/voice/00000000-0000-0000-0000-00000000000a.mp3";

const voiceSource = fs
  .readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8")
  .replace(/^import .*;\n/gm, "")
  .replace(/import \{[\s\S]*?\} from "\.\/systemVoice4\.js";\n/u, "")
  .replace(/export /g, "");

function buildHarness({ Audio, fixedNaturalVoicePlan, setSpeechActive = () => {} }) {
  return new Function(
    "Audio",
    "fixedNaturalVoicePlan",
    "isFixedNaturalVoiceClipUrl",
    "setSpeechActive",
    "hasVoice4Selection",
    "speakWithVoice4",
    "stopSystemVoice4",
    "systemVoice4Available",
    "voice4InventoryReady",
    `${voiceSource}; return { speak, preloadVoiceClip, preloadedVoiceReady };`,
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
}

async function withGlobals(window, document, fetchImpl, run) {
  const priorWindow = globalThis.window;
  const priorDocument = globalThis.document;
  const priorFetch = globalThis.fetch;
  globalThis.window = window;
  globalThis.document = document;
  globalThis.fetch = fetchImpl;
  try {
    return await run();
  } finally {
    if (priorWindow === undefined) delete globalThis.window;
    else globalThis.window = priorWindow;
    if (priorDocument === undefined) delete globalThis.document;
    else globalThis.document = priorDocument;
    if (priorFetch === undefined) delete globalThis.fetch;
    else globalThis.fetch = priorFetch;
  }
}

function baseGlobals() {
  const document = {
    baseURI: "https://example.org/Minik-beta/index.html",
    hidden: false,
    visibilityState: "visible",
    addEventListener() {},
    removeEventListener() {},
  };
  return { document };
}

function eventSource() {
  return {
    addEventListener() {},
    removeEventListener() {},
  };
}

function mediaReadyPlayer(state) {
  class Player {
    constructor() {
      player = this;
      this.src = "";
      this.readyState = 0;
      this.listeners = new Map();
      this.loadCalls = 0;
    }
    setAttribute() {}
    addEventListener(type, fn) {
      const set = this.listeners.get(type) || new Set();
      set.add(fn);
      this.listeners.set(type, set);
    }
    removeEventListener(type, fn) {
      this.listeners.get(type)?.delete(fn);
    }
    emit(type) {
      const set = this.listeners.get(type) || new Set();
      for (const fn of [...set]) fn();
    }
    pause() {}
    load() {
      this.loadCalls++;
      if (state.autoReady !== false) {
        this.readyState = 2;
        queueMicrotask(() => {
          this.emit("loadeddata");
        });
      }
    }
    play() {
      return Promise.resolve();
    }
  }
  let player = null;
  return { Player, get player() { return player; } };
}

function delayedMediaPlayer() {
  class Player {
    constructor() {
      player = this;
      this.src = "";
      this.readyState = 0;
      this.listeners = new Map();
      this.loadCalls = 0;
    }
    setAttribute() {}
    addEventListener(type, fn) {
      const set = this.listeners.get(type) || new Set();
      set.add(fn);
      this.listeners.set(type, set);
    }
    removeEventListener(type, fn) {
      this.listeners.get(type)?.delete(fn);
    }
    emit(type) {
      for (const fn of [...(this.listeners.get(type) || [])]) fn();
    }
    pause() {}
    load() {
      this.loadCalls++;
      const source = this.src;
      this.readyState = 0;
      queueMicrotask(() => {
        if (this.src !== source) return;
        this.readyState = 2;
        this.emit("loadeddata");
      });
    }
    play() {
      return Promise.resolve();
    }
  }
  let player = null;
  return { Player, get player() { return player; } };
}

function fakeContext() {
  let source;
  const ctx = {
    state: "running",
    decodeCalls: 0,
    destination: {},
    resume() {
      return Promise.resolve();
    },
    async decodeAudioData() {
      ctx.decodeCalls++;
      return { duration: 1.25, length: 5600, numberOfChannels: 1 };
    },
    createBufferSource() {
      source = {
        buffer: null,
        connect() {},
        disconnect() {},
        start() {
          source.started = true;
        },
        stop() {},
        set onended(fn) {
          source._onended = fn;
        },
        get onended() {
          return source._onended;
        },
      };
      return source;
    },
    createGain() {
      return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} };
    },
  };
  return { ctx, get source() { return source; } };
}

function fetchCounter(ok) {
  let count = 0;
  const impl = async () => {
    count++;
    if (!ok) return { ok: false, status: 500 };
    return { ok: true, status: 200, arrayBuffer: async () => new ArrayBuffer(1400) };
  };
  return { count: () => count, impl };
}

test("session preload decodes speech into the shared narrator cache without double downloads", async () => {
  const mrp = mediaReadyPlayer({ autoReady: true });
  const { ctx } = fakeContext();
  const fetchTrack = fetchCounter(true);
  const window = { AudioContext: class { constructor() { return ctx; } }, webkitAudioContext: undefined, ...eventSource() };
  const { document } = baseGlobals();

  await withGlobals(window, document, fetchTrack.impl, async () => {
    const api = buildHarness({ Audio: mrp.Player, fixedNaturalVoicePlan: () => [FIXED_CLIP] });

    const first = api.preloadVoiceClip(LOCAL_CLIP);
    const second = api.preloadVoiceClip(LOCAL_CLIP);
    assert.equal(await first, true);
    assert.equal(await second, true);
    assert.equal(fetchTrack.count(), 1, "two identical preloads must not download twice");
    assert.equal(ctx.decodeCalls, 1, "the decoded buffer must be reused after the first decode");
    assert.equal(api.preloadedVoiceReady(LOCAL_CLIP), true);
    assert.equal(api.preloadedVoiceReady(FIXED_CLIP), true, "remote and local spelling must share one cache key");
    assert.equal(mrp.player, null, "decoded session clips must not contend for the shared media player");
  });
});

test("the first spoken word after preload starts without any new network or decode", async () => {
  const mrp = mediaReadyPlayer({ autoReady: true });
  const fake = fakeContext();
  const { ctx } = fake;
  const fetchTrack = fetchCounter(true);
  const window = { AudioContext: class { constructor() { return ctx; } }, webkitAudioContext: undefined, ...eventSource() };
  const { document } = baseGlobals();

  await withGlobals(window, document, fetchTrack.impl, async () => {
    const api = buildHarness({ Audio: mrp.Player, fixedNaturalVoicePlan: () => [FIXED_CLIP] });
    assert.equal(await api.preloadVoiceClip(LOCAL_CLIP), true);

    const spoken = api.speak("Hallo Mino");
    await new Promise((resolve) => setTimeout(resolve, 0));
    const source = fake.source;
    assert.ok(source, "speak must take the decoded WebAudio fast path after preload");
    source._onended?.();
    assert.equal(await spoken, true);
    assert.equal(fetchTrack.count(), 1, "first playback must not fetch the clip again");
    assert.equal(ctx.decodeCalls, 1, "first playback must not decode the clip again");
  });
});

test("a failed audio preload stays unready and the same session can retry it", async () => {
  const mrp = mediaReadyPlayer({ autoReady: false });
  const { ctx } = fakeContext();
  const fetchTrack = fetchCounter(false);
  const window = { AudioContext: class { constructor() { return ctx; } }, webkitAudioContext: undefined, ...eventSource() };
  const { document } = baseGlobals();

  await withGlobals(window, document, fetchTrack.impl, async () => {
    const api = buildHarness({ Audio: mrp.Player, fixedNaturalVoicePlan: () => [FIXED_CLIP] });

    const attempt = api.preloadVoiceClip(LOCAL_CLIP);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const player = mrp.player;
    player.emit("error");
    assert.equal(await attempt, false);
    assert.equal(api.preloadedVoiceReady(LOCAL_CLIP), false, "a broken clip must never count as ready");

    const retried = api.preloadVoiceClip(LOCAL_CLIP);
    await new Promise((resolve) => setTimeout(resolve, 0));
    player.emit("error");
    assert.equal(await retried, false, "the media player is still broken for this session");
    assert.equal(fetchTrack.count(), 2, "a retry must re-attempt only the missing clip");
  });
});

test("a clip that only warms the media player still satisfies the playback gate", async () => {
  const mrp = mediaReadyPlayer({ autoReady: true });
  const window = eventSource();
  const { document } = baseGlobals();
  const fetchTrack = fetchCounter(true);

  await withGlobals(window, document, fetchTrack.impl, async () => {
    const api = buildHarness({ Audio: mrp.Player, fixedNaturalVoicePlan: () => [FIXED_CLIP] });
    assert.equal(await api.preloadVoiceClip(LOCAL_CLIP), true);
    assert.equal(api.preloadedVoiceReady(LOCAL_CLIP), true);
    assert.equal(fetchTrack.count(), 0, "a pure media warm-up must not fetch or decode");
  });
});

test("an explicit opener preload waits while it re-warms the shared player", async () => {
  // The shared media player buffers only one clip. A session that warms its
  // whole phrase set then re-warms the round-0 opener last must end with that
  // opener bound to the player, otherwise the first spoken words on iOS would
  // start a brand-new media load behind the "ready" loading card.
  const mrp = mediaReadyPlayer({ autoReady: true });
  const { ctx } = fakeContext();
  const fetchTrack = fetchCounter(true);
  const window = { AudioContext: class { constructor() { return ctx; } }, webkitAudioContext: undefined, ...eventSource() };
  const { document } = baseGlobals();

  await withGlobals(window, document, fetchTrack.impl, async () => {
    const api = buildHarness({ Audio: mrp.Player, fixedNaturalVoicePlan: () => [FIXED_CLIP] });
    assert.equal(await api.preloadVoiceClip(LOCAL_CLIP), true);
    assert.equal(
      await api.preloadVoiceClip(LOCAL_CLIP, { primeMedia: true }),
      true,
      "the opener re-warm must stay ready",
    );
    const player = mrp.player;
    const absolute = new URL(LOCAL_CLIP, "https://example.org/Minik-beta/index.html").href;
    assert.equal(player.src, absolute, "the repeat preload must bind the shared player back to this clip");
    assert.equal(fetchTrack.count(), 1, "the re-warm must never download the clip again");
  });
});

test("different concurrent media fallbacks are serialized on the shared player", async () => {
  const delayed = delayedMediaPlayer();
  const window = eventSource();
  const { document } = baseGlobals();
  const fetchTrack = fetchCounter(true);
  const clips = Array.from({ length: 6 }, (_, index) =>
    `/Minik-beta/assets/voice/00000000-0000-0000-0000-${String(index).padStart(12, "0")}.mp3`,
  );

  await withGlobals(window, document, fetchTrack.impl, async () => {
    const api = buildHarness({ Audio: delayed.Player, fixedNaturalVoicePlan: () => [FIXED_CLIP] });
    let timeoutId;
    const timeout = new Promise((resolve) => {
      timeoutId = setTimeout(() => resolve("timeout"), 500);
    });
    const loaded = Promise.all(clips.map((clip) => api.preloadVoiceClip(clip)));
    const result = await Promise.race([loaded, timeout]);
    clearTimeout(timeoutId);

    assert.notEqual(result, "timeout", "shared media preloads must not wait for displaced-source timeouts");
    assert.deepEqual(result, [true, true, true, true, true, true]);
    assert.equal(delayed.player.loadCalls, clips.length);
    assert.equal(fetchTrack.count(), 0, "media fallback must not issue a separate fetch");
  });
});

test("PreparedGameSession routes speech through the playback-ready preload gate", () => {
  const wrapper = fs.readFileSync("src/games/PreparedGameSession.jsx", "utf8");
  assert.match(wrapper, /import \{ preloadVoiceClip, preloadedVoiceReady, unlockVoiceAudio \} from "\.\.\/audio\/voice\.js"/);
  assert.match(wrapper, /import \{ naturalPhraseTexts \} from "\.\.\/audio\/naturalVoicePlans\.js"/);
  assert.match(wrapper, /import \{ helpVoiceTexts \} from "\.\.\/audio\/helpVoiceClips\.js"/);
  assert.match(wrapper, /task\.type === "image"\s*\?\s*await preloadImage\(task\.url\)\s*:\s*await preloadVoiceClip\(task\.url\)/);
  assert.match(wrapper, /for \(const phrase of naturalPhraseTexts\(lang\)\) texts\.add\(phrase\)/);
  assert.match(wrapper, /for \(const phrase of helpVoiceTexts\(lang\)\) texts\.add\(phrase\)/);
  assert.match(wrapper, /voiceUrls\.every\(\(url\) => preloadedVoiceReady\(url\)\)/);
  assert.match(wrapper, /throw new Error\("session speech is not playback-ready"\)/);
  assert.match(wrapper, /void unlockVoiceAudio\(\)\.catch\(\(\) => false\)/);
  assert.match(wrapper, /preloadVoiceClip\(openerUrls\[0\], \{ primeMedia: true \}\)/);
});
