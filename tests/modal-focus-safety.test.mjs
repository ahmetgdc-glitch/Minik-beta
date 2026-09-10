import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const hook = fs.readFileSync("src/app/useModalSafety.js", "utf8");
const confirmDialog = fs.readFileSync("src/components/ConfirmDialog.jsx", "utf8");

test("shared modal safety traps keyboard focus inside the active modal", () => {
  assert.match(hook, /event\.key\s*!==\s*"Tab"/);
  assert.match(hook, /querySelectorAll\(FOCUSABLE\)/);
  assert.match(hook, /modal\.contains\(current\)/);
  assert.match(hook, /event\.shiftKey\s*&&\s*current\s*===\s*first/);
  assert.match(hook, /current\s*===\s*last/);
});

test("destructive confirmation dialog uses shared modal safety", () => {
  assert.match(confirmDialog, /useModalSafety\(open,\s*onCancel\)/);
  assert.doesNotMatch(confirmDialog, /document\.addEventListener\("keydown"/);
  assert.match(confirmDialog, /type="button"/);
});
