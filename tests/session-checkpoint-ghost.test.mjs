import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("an untouched game never creates a resumable ghost checkpoint", () => {
  const source = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");
  assert.match(source, /phaseRef\.current === "done" \|\| playedRef\.current < 1/);
});
