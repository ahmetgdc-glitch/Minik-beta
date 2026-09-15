import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const guide = readFileSync(new URL("../src/components/FishGuide.jsx", import.meta.url), "utf8");
const session = readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("game hint level reaches the visible Mino guide stage", () => {
  assert.match(session, /<FishGuide[\s\S]*?hint=\{hint\}/);
  assert.match(guide, /hint,/);
  assert.match(guide, /const visualStage = Number\.isFinite\(hint\) \? hint : stage/);
  assert.match(guide, /fish-guide stage-\$\{visualStage\}/);
});

test("blocked game transitions disable Mino help instead of relying only on outer inert", () => {
  assert.match(session, /<FishGuide[\s\S]*?disabled=\{interactionBlocked\(\)\}/);
  assert.match(guide, /disabled = false/);
  assert.match(guide, /disabled=\{disabled\}/);
});
