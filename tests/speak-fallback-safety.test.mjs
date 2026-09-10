import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("speech fallback is recorded as assisted instead of independent mastery", () => {
  const source = fs.readFileSync(new URL("../src/games/SpeakGame.jsx", import.meta.url), "utf8");
  const assistedCalls = source.match(/onSolve\(\[target\.id\], \{ assisted: true \}\)/g) || [];
  assert.ok(assistedCalls.length >= 2, "unsupported and permission-blocked speech paths must be assisted");
});

test("game session accepts an explicit assisted solve flag", () => {
  const source = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");
  assert.match(source, /Boolean\(meta\.assisted\) \|\| hintRef\.current >= 2/);
  assert.match(source, /record\(true, ids, meta\)/);
});
