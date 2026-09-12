import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const screen = fs.readFileSync(new URL("../src/app/GamesScreen.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/app/playground.css", import.meta.url), "utf8");
const guards = fs.readFileSync(new URL("../src/app/playground-guards.css", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("games screen uses the immersive playground instead of the legacy card grid", () => {
  assert.match(screen, /className="activity-playground"/);
  assert.match(screen, /className="playground-feature"/);
  assert.match(screen, /className="playground-river"/);
  assert.doesNotMatch(screen, /className="games-grid"/);
  assert.doesNotMatch(screen, /className="game-card"/);
});

test("game playground starts with a small choice set and keeps every game reachable", () => {
  assert.match(screen, /\[showAll, setShowAll\] = useState\(false\)/);
  assert.match(screen, /previewGames = showAll \? rest : rest\.slice\(0, 4\)/);
  assert.match(screen, /hiddenGameCount = Math\.max\(0, rest\.length - previewGames\.length\)/);
  assert.match(screen, /aria-expanded=\{showAll\}/);
  assert.match(screen, /setShowAll\(\(value\) => !value\)/);
  assert.match(screen, /Noch \$\{hiddenGameCount\} Spiele/);
  assert.match(screen, /\$\{hiddenGameCount\} oyun daha/);
});

test("Mino's featured activity is a real personalized one-tap recommendation", () => {
  assert.match(screen, /import \{ recommendedActivities \} from "\.\.\/learning\/recommendations\.js";/);
  assert.match(screen, /recommendedActivities\(progress, lang, 1\)\[0\] \|\| null/);
  assert.match(screen, /rest = visibleGames\.filter\(\(game\) => game\.id !== featured\?\.id\)/);
  assert.match(screen, /function startFeatured\(\)/);
  assert.match(screen, /onNavigate\(`\/play\/\$\{featured\.id\}\/\$\{world\.id\}`\)/);
  assert.match(screen, /onClick=\{startFeatured\}/);
  assert.match(screen, /worldLabel\(recommendation\.world, lang\)/);
});

test("profile age changes cannot keep or launch a stale age-inappropriate game selection", () => {
  assert.match(screen, /import React, \{ useEffect, useMemo, useState \} from "react";/);
  assert.match(screen, /const stillAllowed = visibleGames\.some\(\(game\) => game\.id === selected\.id\)/);
  assert.match(screen, /if \(!stillAllowed\) setSelected\(null\)/);
  assert.match(screen, /\[progress\.activeProfile\?\.id, progress\.activeProfile\?\.ageGroup\]/);
  assert.match(screen, /if \(!visibleGames\.some\(\(allowed\) => allowed\.id === game\.id\)\) return/);
  assert.match(screen, /if \(!selected \|\| !visibleGames\.some\(\(allowed\) => allowed\.id === selected\.id\)\)/);
});

test("world choice stays immersive after selecting a game", () => {
  assert.match(screen, /className="world-islands"/);
  assert.match(screen, /className="world-island"/);
  assert.doesNotMatch(screen, /<WorldCard/);
  assert.doesNotMatch(screen, /className="world-grid"/);
});

test("playground keeps large child-first touch scenes with narrow-phone adaptation", () => {
  assert.match(css, /\.playground-feature\s*\{[\s\S]*?min-height:\s*clamp\(230px/);
  assert.match(css, /\.playground-island\s*\{[\s\S]*?min-height:\s*clamp\(230px/);
  assert.match(css, /\.world-island\s*\{[\s\S]*?min-height:\s*clamp\(250px/);
  assert.match(css, /@media \(max-width: 360px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("playground artwork is contained in its own row and cannot cover card labels", () => {
  assert.match(guards, /grid-template-rows:\s*minmax\(0, 1fr\) auto/);
  assert.match(guards, /\.playground-island-art\s*\{[\s\S]*?overflow:\s*hidden/);
  assert.match(guards, /\.playground-island-art > \.art,[\s\S]*?max-height:\s*100%/);
  assert.match(guards, /\.playground-island h3\s*\{[\s\S]*?position:\s*relative[\s\S]*?z-index:\s*2/);
  assert.match(guards, /@media \(max-width: 620px\)[\s\S]*?grid-template-rows:\s*minmax\(125px, 1fr\) auto/);
});

test("playground stylesheet is part of the production entry", () => {
  assert.match(main, /import "\.\/app\/playground\.css";/);
  assert.match(main, /import "\.\/app\/playground-guards\.css";/);
});
