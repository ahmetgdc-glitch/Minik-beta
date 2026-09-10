import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/parent/Parents.jsx", import.meta.url), "utf8");
const meta = fs.readFileSync(new URL("../src/app/meta.js", import.meta.url), "utf8");

test("parent controls auto-lock after inactivity and when app is hidden", () => {
  assert.match(source, /5 \* 60 \* 1000/);
  assert.match(source, /document\.hidden/);
  assert.match(source, /setUnlocked\(false\)/);
  assert.match(source, /visibilitychange/);
});

test("release metadata is no longer stale", () => {
  const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(meta, new RegExp(pkg.version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(meta, /1\.16\.0-beta\.17/);
});
