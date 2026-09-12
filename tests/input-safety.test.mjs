import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { shouldAcceptWrongTap } from "../src/games/inputGuard.js";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("rapid duplicate wrong taps count only once inside the cooldown", () => {
  const first = shouldAcceptWrongTap(null, "animals.cat", 1000, 420);
  assert.equal(first.accept, true);
  const duplicate = shouldAcceptWrongTap(first.next, "animals.cat", 1150, 420);
  assert.equal(duplicate.accept, false);
  const later = shouldAcceptWrongTap(duplicate.next, "animals.cat", 1450, 420);
  assert.equal(later.accept, true);
});

test("a different wrong choice is not blocked by the duplicate-tap guard", () => {
  const first = shouldAcceptWrongTap(null, "animals.cat", 1000, 420);
  const other = shouldAcceptWrongTap(first.next, "animals.dog", 1100, 420);
  assert.equal(other.accept, true);
});

test("explore completion is cancellable when the game is paused or lifecycle-stale", () => {
  const source = read("src/games/ExploreGame.jsx");
  assert.match(source, /const sessionDisabled = paused \|\| interactionBlocked\(\)/);
  assert.match(source, /if \(sessionDisabled \|\| targetCount === 0 \|\| found\.length < targetCount\) return/);
  assert.match(source, /if \(!interactionBlocked\(\)\) onSolve\(found\)/);
  assert.match(source, /return \(\) => clearTimeout\(timer\)/);
  assert.doesNotMatch(source, /if \(next\.length >= targetCount\) setTimeout/);
});

test("router uses a standard scroll behavior", () => {
  const source = read("src/app/router.js");
  assert.match(source, /behavior: "auto"/);
  assert.doesNotMatch(source, /behavior: "instant"/);
});
