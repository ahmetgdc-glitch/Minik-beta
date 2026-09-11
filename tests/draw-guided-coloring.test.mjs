import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/DrawGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/draw-coloring.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("drawing offers a spill-proof smart coloring mode for templates", () => {
  assert.match(game, /smartColor/);
  assert.match(game, /Zauber-Ausmalen/);
  assert.match(game, /Taşırmadan boya/);
  assert.match(game, /smartPaintSegment/);
  assert.match(game, /globalCompositeOperation = "source-in"/);
});

test("smart coloring reveals source artwork pixel-for-pixel instead of dragging one sampled color across regions", () => {
  assert.match(game, /getImageData/);
  assert.match(game, /guidedColorAt/);
  assert.match(game, /paintCtx\.drawImage\(guide\.canvas/);
  assert.match(game, /ctx\.drawImage\(paintCanvas/);
  assert.doesNotMatch(game, /destination-in/);
  assert.match(game, /if \(painted\) strokeDistance\.current \+= segment/);
  assert.match(game, /Renkler otomatik/);
  assert.match(game, /Farben automatisch/);
});

test("smart coloring mask follows the real visible guide bounds", () => {
  assert.ok(game.includes('w.querySelector(".draw-template.has-item")'));
  assert.match(game, /visibleGuide\?\.getBoundingClientRect\(\)/);
  assert.match(game, /guideRect\.left - rect\.left/);
  assert.match(game, /guideRect\.top - rect\.top/);
  assert.match(game, /boxX \+ \(boxW - drawW\) \/ 2/);
  assert.match(game, /boxY \+ \(boxH - drawH\) \/ 2/);
});

test("switching coloring templates resets incompatible old paint safely", () => {
  assert.match(game, /function selectTemplate/);
  assert.match(game, /resetCanvas\(\)/);
  assert.match(game, /setSmartColor\(Boolean\(item\)\)/);
});

test("guided coloring has dedicated mobile and reduced-motion styling", () => {
  assert.match(css, /smart-color-toggle/);
  assert.match(css, /smart-coloring/);
  assert.match(css, /grayscale\(1\)/);
  assert.match(css, /@media\(max-width:680px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(main, /\.\/games\/draw-coloring\.css/);
});

test("automatic coloring prioritizes the artwork over manual-palette clutter", () => {
  assert.ok(css.includes(".draw-colors.automatic{display:none}"));
  assert.ok(css.includes(".draw-toolbar:has(.smart-color-toggle.active) .draw-tool-label{display:none}"));
  assert.ok(css.includes("width:82%;height:82%;top:9%;left:9%"));
  assert.ok(css.includes("width:88%;height:88%;top:6%;left:6%"));
  assert.ok(css.includes("min-height:58dvh"));
});
