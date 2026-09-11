import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const explorer = readFileSync(new URL("../src/worlds/SceneExplorer.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/worlds/scene-themes.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

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
  ]) assert.ok(css.includes(selector), `${selector} should have a scene theme`);
  assert.match(css, /--world-overlay/);
  assert.match(css, /--world-accent/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(main, /\.\/worlds\/scene-themes\.css/);
});
