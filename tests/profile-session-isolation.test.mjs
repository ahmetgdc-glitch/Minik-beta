import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("game session remount key isolates active child profiles", () => {
  const source = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  assert.match(
    source,
    /key=\{`\$\{progress\.activeProfileId\}-\$\{progress\.activeProfile\?\.ageGroup\}-/,
    "GameSession must remount when the active child changes, including cross-tab storage changes",
  );
});
