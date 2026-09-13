import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/games/SoundsGame.jsx", import.meta.url), "utf8");

test("SoundsGame treats the target sound as learning audio, not a reward effect", () => {
  assert.match(source, /playSound\(target\.sound,\s*\{[\s\S]*\.\.\.settings,[\s\S]*sfx: settings\?\.audio !== false,[\s\S]*\}\)/);
  assert.doesNotMatch(source, /playSound\(target\.sound, settings\)/);
});

test("SoundsGame still respects the main audio switch", () => {
  assert.match(source, /sfx: settings\?\.audio !== false/);
});
