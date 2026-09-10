import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");

test("invalid play URLs are never treated as active games", () => {
  assert.match(app, /const gameRoute = route === "play" \|\| route === "replay"/);
  assert.match(app, /const playing = gameRoute && Boolean\(validGame\)/);
  assert.match(app, /if \(playing && validGame\)/);
});

test("invalid play URLs cannot suppress profile chooser or PWA updates", () => {
  assert.match(app, /progress\.profiles\.length > 1[\s\S]*!playing/);
  assert.match(app, /updateReady && !playing/);
});

const session = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("game session never dereferences an invalid game's round count before route fallback", () => {
  assert.match(session, /totalRounds = Math\.max\(1, Number\(spec\?\.rounds\) \|\| 1\)/);
  assert.doesNotMatch(session, /spec\.rounds/);
  assert.match(session, /if \(!world \|\| !spec \|\| !Component\) return null/);
});
