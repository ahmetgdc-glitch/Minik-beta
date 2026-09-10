import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const hook = fs.readFileSync("src/app/useModalSafety.js", "utf8");
const profiles = fs.readFileSync("src/parent/Profiles.jsx", "utf8");
const gameSession = fs.readFileSync("src/games/GameSession.jsx", "utf8");
const aquarium = fs.readFileSync("src/rewards/Aquarium.jsx", "utf8");
const parents = fs.readFileSync("src/parent/Parents.jsx", "utf8");

test("modal safety closes on Escape, blocks background scroll and restores focus", () => {
  assert.match(hook, /event\.key\s*===\s*"Escape"/);
  assert.match(hook, /document\.body\.style\.overflow\s*=\s*"hidden"/);
  assert.match(hook, /overscrollBehavior\s*=\s*"none"/);
  assert.match(hook, /previousActive\?\.focus/);
  assert.match(hook, /removeEventListener\("keydown"/);
});

test("major custom overlays use shared modal safety", () => {
  assert.match(profiles, /useModalSafety\(creating/);
  assert.match(gameSession, /useModalSafety\(paused/);
  assert.match(aquarium, /useModalSafety\(Boolean\(revealed\)/);
  assert.match(parents, /useModalSafety\(reset/);
});

test("profile creation overlay exposes real dialog semantics", () => {
  assert.match(profiles, /role="dialog"/);
  assert.match(profiles, /aria-modal="true"/);
  assert.match(profiles, /aria-labelledby="create-profile-title"/);
  assert.match(profiles, /id="create-profile-title"/);
});
