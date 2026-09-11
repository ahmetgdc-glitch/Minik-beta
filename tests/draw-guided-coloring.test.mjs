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
  assert.match(game, /smartFillSegment/);
  assert.match(game, /regionCanvasFor/);
});

test("smart coloring fills clean source-art regions instead of leaving brush-shaped blobs", () => {
  assert.match(game, /sourceData/);
  assert.match(game, /paletteFrom/);
  assert.match(game, /SMART_REGION_DISTANCE/);
  assert.match(game, /regionCache: new Map\(\)/);
  assert.match(game, /regionCtx\.putImageData\(output, 0, 0\)/);
  assert.match(game, /ctx\.drawImage\(region, 0, 0, guide\.width, guide\.height\)/);
  assert.doesNotMatch(game, /globalCompositeOperation = "source-in"/);
  assert.doesNotMatch(game, /paintCtx\.arc/);
});

test("smart coloring responds to a simple child tap and samples quick swipes", () => {
  assert.match(game, /MIN_STROKE_DISTANCE/);
  assert.match(game, /Math\.ceil\(distance \/ 10\)/);
  assert.match(game, /samplePoint/);
  assert.match(game, /smartFillSegment\(ctx, p, p\)/);
  assert.match(game, /strokeDistance\.current = MIN_STROKE_DISTANCE/);
});

test("smart coloring mask follows the real visible guide bounds", () => {
  assert.ok(game.includes('w.querySelector(".draw-template.has-item")'));
  assert.match(game, /visibleGuide\?\.getBoundingClientRect\(\)/);
  assert.match(game, /guideRect\.left - rect\.left/);
  assert.match(game, /guideRect\.top - rect\.top/);
  assert.match(game, /boxX \+ \(boxW - drawW\) \/ 2/);
  assert.match(game, /boxY \+ \(boxH - drawH\) \/ 2/);
  assert.ok(css.includes(".draw-canvas-wrap .draw-guide-image{width:100%;height:100%;object-fit:contain"));
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

test("automatic coloring removes controls that no longer affect region filling", () => {
  assert.ok(css.includes(".draw-colors.automatic{display:none}"));
  assert.match(css, /smart-color-toggle\.active\) \.draw-sizes/);
  assert.match(css, /smart-color-toggle\.active\) \.draw-eraser/);
  assert.match(game, /disabled=\{controlsDisabled \|\| automaticColors\}/);
  assert.ok(css.includes("width:82%;height:82%;top:9%;left:9%"));
  assert.ok(css.includes("width:88%;height:88%;top:6%;left:6%"));
  assert.ok(css.includes("min-height:58dvh"));
});
