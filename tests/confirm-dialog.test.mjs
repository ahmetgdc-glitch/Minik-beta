import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const files = [
  "src/parent/Profiles.jsx",
  "src/parent/Parents.jsx",
  "src/games/DrawGame.jsx",
];

test("destructive child and parent actions avoid native browser confirm dialogs", () => {
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /(?:window\.)?confirm\s*\(/, `${file} must use the MINIK dialog instead of browser confirm()`);
    assert.match(source, /ConfirmDialog/, `${file} must use the shared confirmation dialog`);
  }
});

test("shared confirmation dialog is modal, cancellable and keyboard-safe", () => {
  const source = fs.readFileSync("src/components/ConfirmDialog.jsx", "utf8");
  assert.match(source, /role="alertdialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /useModalSafety\(open,\s*onCancel\)/);
  const hook = fs.readFileSync("src/app/useModalSafety.js", "utf8");
  assert.match(hook, /event\.key === "Escape"/);
  assert.match(hook, /previousActive\?\.focus/);
  assert.match(source, /danger \? cancelRef\.current : confirmRef\.current/);
  assert.match(source, /onCancel/);
});
