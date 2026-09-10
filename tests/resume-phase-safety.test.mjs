import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("resumed solved/demo phases start interaction-locked", () => {
  assert.match(source, /useRef\(checkpoint\?\.phase === "success" \|\| checkpoint\?\.phase === "demo"\)/);
});

test("resume checkpoints preserve help level", () => {
  assert.match(source, /hint: hintRef\.current/);
  assert.match(source, /checkpoint\?\.hint/);
});
