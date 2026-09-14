import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const picker = fs.readFileSync(new URL("../src/components/MusicPicker.jsx", import.meta.url), "utf8");
const profiles = fs.readFileSync(new URL("../src/audio/musicProfiles.js", import.meta.url), "utf8");
const sounds = fs.readFileSync(new URL("../src/audio/sounds.js", import.meta.url), "utf8");

test("software update controls stay out of the child surface", () => {
  assert.match(app, /updateReady && !playing && route === "parents"/);
  assert.doesNotMatch(app, /\{updateReady && !playing && \(/);
});

test("MINIK offers at least three distinct selectable music moods plus music off", () => {
  for (const id of ["playful", "calm", "adventure"]) {
    assert.match(profiles, new RegExp(`id: "${id}"`));
  }
  assert.match(profiles, /id: "off"/);
  const styleCount = [...profiles.matchAll(/\nid: "(?:playful|calm|adventure)"/g)].length;
  assert.ok(styleCount >= 3);
  assert.match(picker, /MUSIC_STYLES/);
  assert.match(picker, /MUSIC_OFF/);
  assert.match(picker, /aria-pressed=\{item\.id === style\}/);
});

test("music selection persists and drives the game music engine", () => {
  assert.match(profiles, /MUSIC_STYLE_STORAGE_KEY/);
  assert.match(profiles, /localStorage\.setItem\(MUSIC_STYLE_STORAGE_KEY, next\)/);
  assert.match(sounds, /musicStyleProfile\(style\)/);
  assert.match(sounds, /profile\.notes/);
  assert.match(sounds, /profile\.intervalMs/);
  assert.match(sounds, /profile\.id === "off"/);
});

test("voice remains more important than background music", () => {
  assert.match(sounds, /speechActive \? 0\.18 : 1/);
  assert.match(sounds, /setTargetAtTime\(level/);
});

test("music picker is mounted in the child top bar and audio-off also stops music", () => {
  assert.match(app, /<MusicPicker lang=\{lang\} enabled=\{progress\.settings\.audio\} \/>/);
  assert.match(app, /stopMusic\(\);/);
});
