import test from "node:test";
import assert from "node:assert/strict";
import {
  MUSIC_STYLES,
  MUSIC_OFF,
  MUSIC_STYLE_STORAGE_KEY,
  normalizeMusicStyle,
  musicStyleProfile,
  getMusicStyle,
  setMusicStyle,
} from "../src/audio/musicProfiles.js";

test("music moods are genuinely distinct and quiet enough for a narrator-led child app", () => {
  assert.ok(MUSIC_STYLES.length >= 3);
  assert.equal(new Set(MUSIC_STYLES.map(({ id }) => id)).size, MUSIC_STYLES.length);
  assert.equal(new Set(MUSIC_STYLES.map(({ intervalMs }) => intervalMs)).size, MUSIC_STYLES.length);
  assert.equal(new Set(MUSIC_STYLES.map(({ notes }) => notes.join(","))).size, MUSIC_STYLES.length);
  for (const style of MUSIC_STYLES) {
    assert.ok(style.notes.length >= 6, `${style.id} should feel like a loop, not one beep`);
    assert.ok(style.volume > 0 && style.volume <= 0.02, `${style.id} must remain background-level`);
    assert.ok(style.intervalMs >= 500, `${style.id} should not become hectic`);
    assert.ok(style.de && style.tr && style.descriptionDe && style.descriptionTr);
  }
});

test("music off never disables the narrator or aliases a real music mood", () => {
  assert.equal(MUSIC_OFF.id, "off");
  assert.equal(MUSIC_OFF.volume, 0);
  assert.deepEqual(MUSIC_OFF.notes, []);
  assert.equal(normalizeMusicStyle("off"), "off");
  assert.equal(normalizeMusicStyle("unknown"), "playful");
  assert.equal(musicStyleProfile("off"), MUSIC_OFF);
});

test("music choice survives reload through the dedicated preference key", () => {
  const previousWindow = globalThis.window;
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
    },
  };
  try {
    assert.equal(setMusicStyle("calm"), "calm");
    assert.equal(store.get(MUSIC_STYLE_STORAGE_KEY), "calm");
    assert.equal(getMusicStyle(), "calm");
    assert.equal(musicStyleProfile().id, "calm");
    assert.equal(setMusicStyle("not-real"), "playful");
    assert.equal(getMusicStyle(), "playful");
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
