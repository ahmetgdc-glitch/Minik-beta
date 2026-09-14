import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const workflow = fs.readFileSync(
  new URL("../.github/workflows/deploy.yml", import.meta.url),
  "utf8",
);

test("published Pages smoke test parses the Vite entry without a pipefail-prone grep/head chain", () => {
  assert.match(workflow, /asset_re='src=/);
  assert.match(workflow, /if \[\[ \$html =~ \$asset_re \]\]; then/);
  assert.match(workflow, /BASH_REMATCH\[1\]/);
  assert.doesNotMatch(workflow, /asset="\$\(echo "\$html" \| grep -oE/);
});

test("published Pages smoke test checks the actual production entry and offline essentials", () => {
  assert.match(workflow, /src\/main/);
  assert.match(workflow, /\$\{base\}\$\{asset\}/);
  assert.match(workflow, /manifest\.webmanifest/);
  assert.match(workflow, /sw\.js/);
  assert.match(workflow, /Published MINIK Pages smoke test passed/);
});
