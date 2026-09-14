import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const guards = fs.readFileSync(new URL("../src/app/child-touch-guards.css", import.meta.url), "utf8");
const session = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("narrow game header keeps Turkish and German titles inside their own lane", () => {
  assert.match(session, /className="game-title"/);
  assert.match(session, /className="icon-button game-back-button"/);
  assert.match(session, /className="icon-button pause-button"/);
  assert.match(session, /className="icon-button replay-button"/);
  assert.match(guards, /@media \(max-width: 540px\)[\s\S]*?\.game-header \.game-title[\s\S]*?flex: 1 1 auto[\s\S]*?min-width: 0[\s\S]*?overflow: hidden/);
  assert.match(guards, /\.game-header \.game-title > b,[\s\S]*?\.game-header \.game-title > span[\s\S]*?text-overflow: ellipsis[\s\S]*?white-space: nowrap/);
  assert.match(guards, /@media \(max-width: 375px\)[\s\S]*?\.game-session \.game-header[\s\S]*?gap: 8px[\s\S]*?max\(8px, env\(safe-area-inset-left\)\)[\s\S]*?max\(8px, env\(safe-area-inset-right\)\)/);
});
