import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const picker = fs.readFileSync(new URL("../src/components/MusicPicker.jsx", import.meta.url), "utf8");
const pickerCss = fs.readFileSync(new URL("../src/components/music-picker.css", import.meta.url), "utf8");
const profiles = fs.readFileSync(new URL("../src/audio/musicProfiles.js", import.meta.url), "utf8");
const sounds = fs.readFileSync(new URL("../src/audio/sounds.js", import.meta.url), "utf8");

test("software update controls stay out of the child surface", () => {
  assert.match(app, /updateReady && !playing && route === "parents"/);
  assert.doesNotMatch(app, /\{updateReady && !playing && \(/);
});

test("offline and storage diagnostics stay in the adult area instead of covering learning worlds", () => {
  assert.match(app, /!online && route === "parents"/);
  assert.match(app, /getStorageFailure\(\) && route === "parents"/);
  assert.match(app, /getStorageRecovery\(\) && !getStorageFailure\(\) && route === "parents"/);
  assert.doesNotMatch(app, /\{!online && \(/);
  assert.doesNotMatch(app, /\{getStorageFailure\(\) && \(/);
});

test("MINIK offers at least three distinct selectable music moods plus music off", () => {
  for (const id of ["playful", "calm", "adventure"]) {
    assert.match(profiles, new RegExp(`id: "${id}"`));
  }
  assert.match(profiles, /id: "off"/);
  const styleCount = [...profiles.matchAll(/\s+id: "(?:playful|calm|adventure)"/g)].length;
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

test("music picker is independent from the narration toggle", () => {
  assert.match(app, /<MusicPicker lang=\{lang\} \/>/);
  assert.doesNotMatch(app, /<MusicPicker[^>]*enabled=/);
  assert.doesNotMatch(picker, /if \(!enabled\) stopMusic\(\)/);
  assert.match(picker, /if \(selected !== "off"\) startMusic\(\{ style: selected \}\)/);
  const voiceToggle = app.match(/className="audio-toggle"[\s\S]*?<\/button>/)?.[0] || "";
  assert.doesNotMatch(voiceToggle, /stopMusic\(\)/);
});

test("music trigger and dialog close control keep child-safe hit targets", () => {
  assert.match(pickerCss, /\.music-picker-trigger \{[^}]*width:44px;[^}]*min-width:44px;[^}]*height:44px;[^}]*min-height:44px;/u);
  assert.match(pickerCss, /\.music-picker-head > button \{[^}]*width:44px;[^}]*min-width:44px;[^}]*height:44px;[^}]*min-height:44px;/u);
  assert.match(pickerCss, /\.music-picker-options > button \{[^}]*min-height:64px;/u);
});

test("narrow iPhones keep the extra music control from crowding any top bar", () => {
  assert.match(pickerCss, /@media \(max-width:520px\)/);
  assert.match(pickerCss, /\.profile-chip \{ min-width:44px; width:44px; min-height:44px;/u);
  assert.match(pickerCss, /\.profile-chip b \{ display:none; \}/);
  assert.match(pickerCss, /\.mobile-brand \.mino \{ display:none; \}/);
  assert.match(pickerCss, /\.topbar-actions \{ gap:5px; \}/);
  assert.match(pickerCss, /max-height:calc\(100dvh - 180px - env\(safe-area-inset-bottom\)\)/);
});
