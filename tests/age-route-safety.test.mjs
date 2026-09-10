import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { gameFitsAge } from "../src/learning/age.js";
import { gameById } from "../src/games/registry.js";

test("direct game routes cannot bypass the active child's age gate", () => {
  const source = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(source, /gameFitsAge\(game, progress\.activeProfile\?\.ageGroup\)/);
  assert.equal(gameFitsAge(gameById.lettertrace, "2-3"), false);
  assert.equal(gameFitsAge(gameById.listen, "2-3"), true);
});

test("resume cards re-check age after a profile age change", () => {
  const source = fs.readFileSync(new URL("../src/app/Home.jsx", import.meta.url), "utf8");
  assert.match(source, /gameFitsAge\(savedGame, progress\.activeProfile\?\.ageGroup\)/);
  assert.match(source, /progress\.activeProfile\?\.ageGroup/);
});
