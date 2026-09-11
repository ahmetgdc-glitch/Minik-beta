import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("Safari lifecycle pause blocks answer handlers synchronously before React rerenders", () => {
  assert.match(source, /const pausedRef = useRef\(false\)/);
  assert.match(source, /const onPageHide = \(event\) => \{[\s\S]*?pausedRef\.current = true;[\s\S]*?setPaused\(true\)/);
  assert.match(source, /if \(document\.hidden\) \{[\s\S]*?pausedRef\.current = true;[\s\S]*?setPaused\(true\)/);

  assert.match(source, /const interactionBlocked = useCallback/);
  const guardedAnswers = source.match(/if \(interactionBlocked\(\)\) return;/g) || [];
  assert.ok(guardedAnswers.length >= 4, "answer, help and replay paths must use the combined synchronous guard");
});

test("manual pause and lifecycle resume keep the synchronous pause guard in sync", () => {
  assert.match(source, /const pauseManually = useCallback\(\(\) => \{[\s\S]*manualPauseRef\.current = true;[\s\S]*pausedRef\.current = true;[\s\S]*setPaused\(true\)/);
  assert.equal((source.match(/onClick=\{pauseManually\}/g) || []).length, 1, "the visible pause control must share the synchronous pause helper");
  assert.match(source, /className="icon-button game-back-button"[\s\S]*onClick=\{exit\}/);
  assert.match(source, /lifecyclePauseRef\.current = false;[\s\S]{0,100}?pausedRef\.current = false;[\s\S]{0,60}?setPaused\(false\)/);
});
