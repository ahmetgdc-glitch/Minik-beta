import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("Safari lifecycle checkpoint uses synchronous phase and round refs", () => {
  assert.match(source, /const phaseRef = useRef\(/);
  assert.match(source, /const roundRef = useRef\(/);
  assert.match(source, /if \(phaseRef\.current === "done" \|\| playedRef\.current < 1\) return/);
  assert.match(source, /round: roundRef\.current/);
  assert.match(source, /phase: phaseRef\.current/);
});

test("solve and demo decisions update checkpoint phase before React render", () => {
  const successRef = source.indexOf('phaseRef.current = "success"');
  const successState = source.indexOf('setPhase("success")', successRef);
  const demoRef = source.indexOf('phaseRef.current = "demo"');
  const demoState = source.indexOf('setPhase("demo")', demoRef);
  assert.ok(successRef >= 0 && successState > successRef);
  assert.ok(demoRef >= 0 && demoState > demoRef);
});

test("round advance and finish update lifecycle refs synchronously", () => {
  assert.match(source, /roundRef\.current = nextRound;\s*phaseRef\.current = "active";\s*setRound\(nextRound\);\s*setPhase\("active"\)/s);
  assert.match(source, /phaseRef\.current = "done";\s*setPhase\("done"\)/s);
});
