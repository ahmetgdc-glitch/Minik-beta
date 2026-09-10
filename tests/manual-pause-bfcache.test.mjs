import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("Safari BFCache never resumes a game the child manually paused", () => {
  assert.match(source, /manualPauseRef\s*=\s*useRef\(false\)/);
  assert.match(source, /if \(!event\.persisted \|\| manualPauseRef\.current \|\| !lifecyclePauseRef\.current\) return;/);
});

test("manual pause intent is set by pause controls and cleared by explicit resume", () => {
  assert.match(source, /const pauseManually = useCallback\(\(\) => \{[\s\S]*manualPauseRef\.current\s*=\s*true/);
  assert.ok((source.match(/onClick=\{pauseManually\}/g) || []).length >= 2, "both game pause controls should use the guarded manual pause helper");
  assert.match(source, /manualPauseRef\.current\s*=\s*false;\s*\n\s*lifecyclePauseRef\.current\s*=\s*false;\s*\n\s*pausedRef\.current\s*=\s*false;\s*\n\s*setPaused\(false\);\s*\n\s*unlockAudio\(\);/);
});
