import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("background lifecycle pauses automatically and resumes on visibility return", () => {
  assert.match(source, /const lifecyclePauseRef = useRef\(false\)/);
  assert.match(source, /if \(!manualPauseRef\.current\) lifecyclePauseRef\.current = true/);
  assert.match(source, /if \(lifecyclePauseRef\.current && !manualPauseRef\.current\) \{/);
  assert.match(source, /lifecyclePauseRef\.current = false;\s*pausedRef\.current = false;\s*setPaused\(false\);\s*unlockAudio\(\)/s);
});

test("manual child pause cannot be auto-resumed by lifecycle events", () => {
  assert.match(source, /const pauseManually = useCallback\(\(\) => \{[\s\S]*manualPauseRef\.current = true;[\s\S]*pausedRef\.current = true;[\s\S]*setPaused\(true\)/);
  assert.ok((source.match(/onClick=\{pauseManually\}/g) || []).length >= 2);
  assert.match(source, /if \(!event\.persisted \|\| manualPauseRef\.current \|\| !lifecyclePauseRef\.current\) return/);
});
