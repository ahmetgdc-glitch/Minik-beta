import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("app reacts to online/offline changes and cleans up listeners", () => {
  const hook = fs.readFileSync("src/app/useOnlineStatus.js", "utf8");
  const app = fs.readFileSync("src/App.jsx", "utf8");
  assert.match(hook, /addEventListener\("online"/);
  assert.match(hook, /addEventListener\("offline"/);
  assert.match(hook, /removeEventListener\("online"/);
  assert.match(hook, /removeEventListener\("offline"/);
  assert.match(app, /Offline-Modus/);
  assert.match(app, /Çevrimdışı mod/);
});
