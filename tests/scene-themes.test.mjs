import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const explorer = readFileSync(
  new URL("../src/worlds/SceneExplorer.jsx", import.meta.url),
  "utf8",
);
const exploreGame = readFileSync(
  new URL("../src/games/ExploreGame.jsx", import.meta.url),
  "utf8",
);
const scenery = readFileSync(
  new URL("../src/worlds/WorldScenery.jsx", import.meta.url),
  "utf8",
);
const sceneData = readFileSync(
  new URL("../src/worlds/scenes.js", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../src/worlds/scene-themes.css", import.meta.url),
  "utf8",
);
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

const worldIds = [
  "animals",
  "nature",
  "food",
  "weather",
  "sports",
  "colors",
  "shapes",
  "numbers",
  "letters",
  "school",
  "vehicles",
  "places",
  "jobs",
  "safety",
  "home",
  "body",
  "feelings",
  "clothes",
  "people",
  "routines",
  "space",
  "music",
  "sounds",
  "actions",
  "toys",
];

test("discovery scenes expose the active world for visual theming without changing world ids", () => {
  assert.match(explorer, /world-\$\{worldId\}/);
  assert.match(explorer, /data-world=\{worldId\}/);
  assert.match(explorer, /const scene = sceneForWorld\(worldId\)/);
  assert.match(explorer, /assets\/scenes\/\$\{scene\}\.webp/);
});

test("major preschool world families receive distinct visual moods", () => {
  for (const selector of [
    ".world-animals",
    ".world-vehicles",
    ".world-colors",
    ".world-numbers",
    ".world-letters",
    ".world-home",
    ".world-body",
    ".world-feelings",
    ".world-music",
    ".world-space",
  ])
    assert.ok(css.includes(selector), `${selector} should have a scene theme`);
  assert.match(css, /--world-overlay/);
  assert.match(css, /--world-accent/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(main, /\.\/worlds\/scene-themes\.css/);
});

test("discovery scenes render non-interactive world landmarks behind the learning object", () => {
  assert.match(
    explorer,
    /<WorldScenery worldId=\{worldId\} active=\{Boolean\(speakingId\)\}/,
  );
  assert.match(scenery, /decorationsForWorld\(worldId\)/);
  assert.match(scenery, /aria-hidden="true"/);
  assert.match(css, /\.world-scenery\s*\{[^}]*pointer-events:\s*none/);
  assert.match(css, /\.world-scenery \.scene-landmark/);
  assert.match(css, /contain:\s*layout paint/);
});

test("all 25 worlds receive a characteristic listening moment without touching learning ids", () => {
  assert.match(sceneData, /export const sceneMoments = Object\.freeze\(\{/);
  assert.match(sceneData, /export function sceneMomentForWorld\(worldId\)/);
  for (const id of worldIds) {
    assert.match(
      sceneData,
      new RegExp(`${id}: "(?:bounce|drift|spark|calm|drive|pulse|float|tick|orbit)"`),
      `${id} should have a discovery moment`,
    );
  }
  const moments = new Set(
    [...sceneData.matchAll(/:\s*"(bounce|drift|spark|calm|drive|pulse|float|tick|orbit)"/g)].map(
      (match) => match[1],
    ),
  );
  assert.ok(moments.size >= 8, "discovery should use several distinct motion characters");
  assert.match(scenery, /sceneMomentForWorld\(worldId\)/);
  assert.match(scenery, /moment-\$\{moment\}/);
});

test("world landmarks wake only while the matching object is speaking", () => {
  assert.match(scenery, /active \? "is-listening" : ""/);
  assert.match(css, /\.world-scenery\.is-listening \.landmark-1/);
  assert.match(css, /@keyframes landmarkWakeLeft/);
  assert.match(css, /@keyframes landmarkWakeRight/);
  assert.match(css, /@keyframes landmarkWakeSmall/);
  assert.match(css, /moment-bounce\.is-listening/);
  assert.match(css, /moment-drift\.is-listening/);
  assert.match(css, /moment-pulse\.is-listening/);
  assert.match(css, /moment-orbit\.is-listening/);
  assert.match(
    css,
    /prefers-reduced-motion[\s\S]*\.world-scenery\[class\*="moment-"\]\.is-listening \.scene-landmark[\s\S]*animation: none/,
  );
});

test("spoken discovery words keep the matching object highlighted for the real speech lifetime", () => {
  assert.match(
    exploreGame,
    /const \[speakingId, setSpeakingId\] = useState\(null\)/,
  );
  assert.match(exploreGame, /async function speakItem/);
  assert.match(exploreGame, /await speak\(item\.labels\[lang\]/);
  assert.match(
    exploreGame,
    /if \(run === speechRun\.current\) setSpeakingId\(null\)/,
  );
  assert.match(explorer, /const speaking = item\.id === speakingId/);
  assert.match(explorer, /speaking \? "speaking" : ""/);
  assert.match(explorer, /data-speaking=\{speaking \|\| undefined\}/);
  assert.match(css, /discovery-object\.speaking/);
  assert.match(css, /@keyframes discovery-speaking/);
});
