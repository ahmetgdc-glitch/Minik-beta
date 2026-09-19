import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const guards = fs.readFileSync(new URL("../src/app/child-touch-guards.css", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const scene = fs.readFileSync(new URL("../src/worlds/SceneExplorer.jsx", import.meta.url), "utf8");
const atlas = fs.readFileSync(new URL("../src/worlds/WorldAtlas.jsx", import.meta.url), "utf8");
const explore = fs.readFileSync(new URL("../src/games/ExploreGame.jsx", import.meta.url), "utf8");
const gameSession = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");
const profiles = fs.readFileSync(new URL("../src/parent/Profiles.jsx", import.meta.url), "utf8");
const aquarium = fs.readFileSync(new URL("../src/rewards/Aquarium.jsx", import.meta.url), "utf8");

test("narrow-phone child controls keep at least a 44px hit target", () => {
  assert.match(guards, /@media \(max-width: 760px\)/);
  for (const selector of ["audio-toggle", "music-picker-trigger", "profile-chip", "mobile-parents"]) {
    assert.match(guards, new RegExp(`\\.${selector}`));
  }
  assert.match(guards, /width: 44px/);
  assert.match(guards, /min-width: 44px/);
  assert.match(guards, /height: 44px/);
  assert.match(guards, /min-height: 44px/);
});

test("390px-class iPhones keep every essential topbar action without horizontal overflow", () => {
  assert.match(app, /className="mobile-brand"/);
  assert.match(app, /className="topbar-actions"/);
  assert.match(guards, /@media \(max-width: 410px\)/);
  assert.match(guards, /\.child-world-shell \.mobile-brand[\s\S]*?display: none/);
  assert.match(guards, /\.child-world-shell \.topbar-actions[\s\S]*?width: 100%[\s\S]*?min-width: 0[\s\S]*?justify-content: space-between/);
  assert.match(guards, /@media \(max-width: 375px\)[\s\S]*?\.child-world-shell \.topbar[\s\S]*?max\(8px, env\(safe-area-inset-left\)\)[\s\S]*?max\(8px, env\(safe-area-inset-right\)\)/);
  assert.match(guards, /@media \(max-width: 375px\)[\s\S]*?\.child-world-shell \.language-switch span[\s\S]*?padding-inline: 4px/);
});

test("320px phones keep only the interactive topbar star counter inside a 44px utility target", () => {
  assert.match(aquarium, /<span className="star-pill">/);
  assert.match(guards, /@media \(max-width: 340px\)/);
  assert.match(guards, /\.child-world-shell \.topbar-actions \.star-pill[\s\S]*?width: 44px[\s\S]*?min-width: 44px[\s\S]*?max-width: 44px[\s\S]*?flex: 0 0 44px/);
  assert.match(guards, /\.child-world-shell \.topbar-actions \.star-pill b[\s\S]*?position: absolute[\s\S]*?max-width: 30px[\s\S]*?text-overflow: ellipsis/);
  assert.doesNotMatch(guards, /@media \(max-width: 340px\)[\s\S]*?\.child-world-shell \.star-pill\s*\{/);
});

test("320px bottom navigation keeps Turkish tab labels on one line", () => {
  assert.match(guards, /@media \(max-width: 340px\)/);
  assert.match(guards, /\.child-world-shell \.bottom-nav button[\s\S]*?min-width: 0[\s\S]*?padding-inline: 2px/);
  assert.match(guards, /\.child-world-shell \.bottom-nav button svg[\s\S]*?width: 24px[\s\S]*?height: 24px/);
  assert.match(guards, /\.child-world-shell \.bottom-nav button span[\s\S]*?font-size: \.75rem[\s\S]*?white-space: nowrap/);
});

test("hard discovery progress fits beside Mino on 320px phones", () => {
  assert.match(scene, /className="discovery-footer"/);
  assert.match(explore, /discovery-progress/);
  assert.match(explore, /targetCount \? "all-found" : ""/);
  assert.match(explore, /explorationSize\(difficulty\)/);
  assert.match(guards, /@media \(max-width: 340px\)[\s\S]*?\.child-world-shell \.discovery-footer[\s\S]*?left: 8px[\s\S]*?right: 8px[\s\S]*?gap: 4px/);
  assert.match(guards, /\.child-world-shell \.scene-mino[\s\S]*?width: 72px[\s\S]*?min-width: 72px[\s\S]*?height: 72px/);
  assert.match(guards, /\.child-world-shell \.discovery-progress[\s\S]*?gap: 4px[\s\S]*?padding: 8px/);
  assert.match(guards, /\.child-world-shell \.discovery-progress i[\s\S]*?width: 14px[\s\S]*?height: 14px[\s\S]*?flex: 0 0 14px/);
});

test("atlas chapter navigation never collapses below a child-safe width", () => {
  assert.match(atlas, /className="atlas-chapters"/);
  assert.match(guards, /\.child-world-shell \.atlas-chapters button[\s\S]*?min-width: 44px[\s\S]*?min-height: 44px[\s\S]*?flex-shrink: 0/);
});

test("narrowest iPhones scroll chapter targets instead of shrinking or overflowing the atlas", () => {
  assert.match(guards, /@media \(max-width: 375px\)/);
  assert.match(guards, /\.child-world-shell \.atlas-chapters[\s\S]*?min-width: 0[\s\S]*?justify-content: flex-start[\s\S]*?overflow-x: auto[\s\S]*?overscroll-behavior-x: contain/);
  assert.match(guards, /\.child-world-shell \.atlas-chapters::\-webkit-scrollbar[\s\S]*?display: none/);
});

test("active atlas chapter is kept visible when arrows or swipes change pages", () => {
  assert.match(atlas, /import React, \{ useEffect, useMemo, useRef \} from "react"/);
  assert.match(atlas, /const chapterNavRef = useRef\(null\)/);
  assert.match(atlas, /querySelector\('\[aria-current="true"\]'\)/);
  assert.match(atlas, /current\.offsetLeft \+ current\.offsetWidth \/ 2 - nav\.clientWidth \/ 2/);
  assert.match(atlas, /nav\.scrollTo\(\{ left, behavior: reducedMotion \? "auto" : "smooth" \}\)/);
  assert.match(atlas, /\[active\?\.chapter\.id, reducedMotion\]/);
  assert.match(atlas, /<nav ref=\{chapterNavRef\} className="atlas-chapters"/);
});

test("profile edit and delete controls stay touch-safe on narrow devices", () => {
  assert.match(profiles, /className="profile-actions"/);
  assert.match(guards, /\.profile-actions button[\s\S]*?width: 44px[\s\S]*?min-width: 44px[\s\S]*?height: 44px[\s\S]*?min-height: 44px/);
});

test("mobile profile editor expands before compact avatar and age controls can shrink", () => {
  assert.match(profiles, /editing===p\.id\?"editing":""/);
  assert.match(profiles, /className="avatar-picker compact"/);
  assert.match(profiles, /className="age-picker compact"/);
  assert.match(guards, /\.profile-card\.editing[\s\S]*?grid-column: 1 \/ -1/);
  assert.match(guards, /\.profile-card\.editing \.avatar-picker\.compact button,[\s\S]*?\.profile-card\.editing \.age-picker\.compact button[\s\S]*?min-width: 44px[\s\S]*?min-height: 44px/);
});

test("profile creation modal remains reachable above iPhone keyboard and safe areas", () => {
  assert.match(profiles, /className="profile-modal-backdrop"/);
  assert.match(profiles, /className="profile-modal"/);
  assert.match(guards, /@media \(max-width: 760px\), \(max-height: 700px\)/);
  assert.match(guards, /\.profile-modal-backdrop[\s\S]*?overflow-y: auto[\s\S]*?env\(safe-area-inset-top\)[\s\S]*?env\(safe-area-inset-bottom\)/);
  assert.match(guards, /\.profile-modal[\s\S]*?max-height: calc\(100dvh[\s\S]*?overflow-y: auto[\s\S]*?scroll-padding-bottom: 120px/);
});

test("320px profile modal stacks long action labels instead of overflowing", () => {
  assert.match(guards, /@media \(max-width: 340px\)/);
  assert.match(guards, /\.profile-modal \.modal-actions[\s\S]*?flex-direction: column[\s\S]*?align-items: stretch[\s\S]*?gap: 8px/);
  assert.match(guards, /\.profile-modal \.modal-actions > button[\s\S]*?width: 100%/);
});

test("in-game utility controls do not shrink below 44px on narrow iPhones", () => {
  assert.match(guards, /@media \(max-width: 540px\)/);
  assert.match(guards, /\.game-header \.icon-button,[\s\S]*?\.replay-audio[\s\S]*?width: 44px[\s\S]*?min-width: 44px[\s\S]*?height: 44px[\s\S]*?min-height: 44px/);
});

test("narrow iPhones stack translated finish actions instead of squeezing three buttons into one row", () => {
  assert.match(gameSession, /className="session-finish"/);
  assert.match(gameSession, /className="finish-actions"/);
  for (const label of ["Ödüllerim", "Tekrar oyna", "Dünyama dön"]) {
    assert.ok(gameSession.includes(label), `${label} should remain a visible Turkish finish action`);
  }
  assert.match(guards, /@media \(max-width: 430px\)/);
  assert.match(guards, /\.session-finish \.finish-actions[\s\S]*?width: 100%[\s\S]*?flex-direction: column[\s\S]*?align-items: stretch[\s\S]*?gap: 8px/);
  assert.match(guards, /\.session-finish \.finish-actions \.secondary[\s\S]*?width: 100%[\s\S]*?min-width: 0[\s\S]*?min-height: 48px[\s\S]*?justify-content: center/);
});

test("narrow finish recommendation owns a shrinkable text lane", () => {
  assert.match(gameSession, /className="primary next-adventure-button"/);
  assert.match(guards, /\.session-finish > \.next-adventure-button[\s\S]*?min-width: 0[\s\S]*?max-width: 100%[\s\S]*?grid-template-columns: auto minmax\(0, 1fr\) auto/);
  assert.match(guards, /\.session-finish > \.next-adventure-button span[\s\S]*?min-width: 0[\s\S]*?overflow-wrap: anywhere/);
});

test("scene navigation gets an even larger child-friendly target", () => {
  assert.match(guards, /\.child-world-shell \.scene-round-button[\s\S]*?width: 48px[\s\S]*?height: 48px/);
  assert.match(scene, /className="scene-round-button discovery-prev"/);
  assert.match(scene, /className="scene-round-button discovery-next"/);
});

test("touch guardrails are loaded after the major visual styles so they win the cascade", () => {
  const guardsIndex = main.indexOf('import "./app/child-touch-guards.css";');
  const worldsIndex = main.indexOf('import "./worlds/worlds.css";');
  const immersiveIndex = main.indexOf('import "./games/immersive.css";');
  assert.ok(guardsIndex > worldsIndex);
  assert.ok(guardsIndex > immersiveIndex);
});
