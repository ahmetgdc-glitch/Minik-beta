import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const app = fs.readFileSync("src/App.jsx", "utf8");

test("multiple child profiles must be confirmed before direct play or replay routes", () => {
  assert.match(
    app,
    /if \(!profileReady && progress\.profiles\.length > 1 && route !== "profiles"\)/,
  );
  assert.doesNotMatch(
    app,
    /progress\.profiles\.length > 1 && route !== "profiles" && !playing/,
  );
  assert.match(app, /<Profiles progress=\{progress\} onChoose=\{confirmProfile\} chooserOnly \/>/);
});

test("profile confirmation preserves the current route instead of silently redirecting the direct game link", () => {
  const confirmStart = app.indexOf("function confirmProfile()");
  const goStart = app.indexOf("function go(path)");
  assert.ok(confirmStart >= 0 && goStart > confirmStart);
  const confirmBlock = app.slice(confirmStart, goStart);
  assert.match(confirmBlock, /sessionStorage\.setItem\("minik_profile_ready", "1"\)/);
  assert.match(confirmBlock, /setProfileReady\(true\)/);
  assert.doesNotMatch(confirmBlock, /navigate\(|go\(/);
});
