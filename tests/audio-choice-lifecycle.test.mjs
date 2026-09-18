import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

for (const name of ["ShadowGame.jsx", "SoundsGame.jsx"]) {
  const source = readFileSync(new URL(`../src/games/${name}`, import.meta.url), "utf8");
  test(`${name} blocks paused and stale lifecycle input`, () => {
    assert.match(source, /interactionBlocked = \(\) => false/);
    assert.match(source, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
    assert.match(source, /if \(controlsDisabled\) return/);
    assert.match(source, /disabled=\{controlsDisabled\}/);
  });
}

test("ReviewGame blocks paused, stale lifecycle and active narration input", () => {
  const source = readFileSync(new URL("../src/games/ReviewGame.jsx", import.meta.url), "utf8");
  assert.match(source, /interactionBlocked = \(\) => false/);
  assert.match(source, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(source, /const answersDisabled = controlsDisabled \|\| hearingTarget;/);
  assert.match(source, /if \(controlsDisabled \|\| hearingTarget\) return/);
  assert.match(source, /disabled=\{answersDisabled\}/);
});

test("SoundsGame also stops replay when the shared session becomes locked", () => {
  const source = readFileSync(new URL("../src/games/SoundsGame.jsx", import.meta.url), "utf8");
  assert.match(source, /if \(controlsDisabled\) \{[\s\S]*?stopSounds\(\)/);
  assert.match(source, /disabled=\{controlsDisabled\}/);
});

test("SoundsGame ignores a stale async replay after pause, lock or unmount", () => {
  const source = readFileSync(new URL("../src/games/SoundsGame.jsx", import.meta.url), "utf8");
  assert.match(source, /const run = \+\+replayRun\.current;[\s\S]*await prepareSoundPlayback\(\);[\s\S]*run !== replayRun\.current/);
  assert.match(source, /if \(run !== replayRun\.current\) return;[\s\S]*if \(!context \|\| paused \|\| interactionBlocked\(\)\) \{[\s\S]*setPlaying\(false\)/);
  assert.match(source, /if \(controlsDisabled\) \{[\s\S]*replayRun\.current \+= 1[\s\S]*stopSounds\(\)/);
  assert.match(source, /useEffect\(\(\) => \(\) => \{[\s\S]*replayRun\.current \+= 1[\s\S]*stopSounds\(\)/);
});
