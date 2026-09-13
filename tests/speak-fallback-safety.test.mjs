import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("speech fallback is recorded as assisted instead of independent mastery", () => {
  const source = fs.readFileSync(new URL("../src/games/SpeakGame.jsx", import.meta.url), "utf8");
  assert.match(source, /const blocked = interactionBlocked\(\);/);
  assert.match(source, /function assistedSolve\(\) \{/);
  assert.match(source, /if \(paused \|\| blocked\) return;/);
  assert.match(source, /onSolve\(\[target\.id\], \{ assisted: true \}\);/);
  const assistedButtons = source.match(/onClick=\{assistedSolve\}/g) || [];
  assert.ok(assistedButtons.length >= 2, "unsupported and recognition-failure paths must use the guarded assisted solve helper");
});

test("recognition service failures cannot trap a child in SpeakGame", () => {
  const source = fs.readFileSync(new URL("../src/games/SpeakGame.jsx", import.meta.url), "utf8");
  assert.match(source, /const showAssistedFallback = Boolean\(issue && issue\.kind !== "silence"\);/);
  assert.match(source, /\{showAssistedFallback && \(/);
  assert.doesNotMatch(source, /issue\?\.kind === "permission" &&/);
});

test("game session accepts an explicit assisted solve flag", () => {
  const source = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");
  assert.match(source, /Boolean\(meta\.assisted\) \|\| hintRef\.current >= 2/);
  assert.match(source, /record\(true, ids, meta\)/);
});
