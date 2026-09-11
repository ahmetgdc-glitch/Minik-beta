import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");

test("MINIK never leaves a silent white screen before React mounts", () => {
  assert.match(html, /id="minik-boot"/);
  assert.match(html, /MINIK startet/);
  assert.match(html, /id="minik-boot-status"/);
  assert.match(html, /id="minik-boot-error"/);
});

test("startup shell surfaces module, asset and promise failures", () => {
  assert.match(html, /addEventListener\("error"/);
  assert.match(html, /addEventListener\("unhandledrejection"/);
  assert.match(html, /Datei konnte nicht geladen werden/);
  assert.match(html, /Zeitüberschreitung: React hat nach/);
  assert.match(html, /navigator\.userAgent/);
});
