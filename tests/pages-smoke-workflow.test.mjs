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

test("published Pages smoke test waits through a stale legacy response before failing", () => {
  const retryStart = workflow.indexOf("for attempt in {1..12}");
  const retryEnd = workflow.indexOf("          done", retryStart);
  const terminalSourceError = workflow.indexOf(
    "still serving the Vite source entry after the propagation window",
  );
  assert.ok(retryStart > 0, "A bounded propagation retry loop is required");
  assert.ok(retryEnd > retryStart, "The propagation retry loop must close");
  assert.ok(
    terminalSourceError > retryEnd,
    "A valid but stale legacy page must not fail before the retry window ends",
  );
  assert.match(workflow, /minik_sha=\$\{GITHUB_SHA\}&attempt=\$\{attempt\}/);
  assert.match(workflow.slice(retryStart, retryEnd), /sleep 5/);
  assert.match(workflow.slice(retryStart, retryEnd), /\[ "\$attempt" -lt 12 \]/);
});

test("legacy Pages is drained even when the candidate build fails", () => {
  const drainStart = workflow.indexOf("  drain-legacy-pages:");
  const deployStart = workflow.indexOf("  deploy:", drainStart);
  assert.ok(drainStart > 0 && deployStart > drainStart);
  const drainBlock = workflow.slice(drainStart, deployStart);
  assert.match(drainBlock, /needs: build/);
  assert.match(drainBlock, /if: \$\{\{ always\(\) \}\}/);
  assert.match(drainBlock, /dynamic\/pages\/pages-build-deployment/);
});

test("failed candidates republish a previous verified production artifact instead of source", () => {
  const recoveryStart = workflow.indexOf("  recover-last-good-pages:");
  assert.ok(recoveryStart > 0, "A last-known-good recovery job is required");
  const recovery = workflow.slice(recoveryStart);

  assert.match(recovery, /needs: \[build, drain-legacy-pages\]/);
  assert.match(recovery, /needs\.build\.result == 'failure'/);
  assert.match(recovery, /needs\['drain-legacy-pages'\]\.result == 'success'/);
  assert.match(recovery, /actions\/workflows\/deploy\.yml\/runs\?branch=\$\{GITHUB_REF_NAME\}&status=success/);
  assert.match(recovery, /minik-production-build/);
  assert.match(recovery, /\.expired == false/);
  assert.match(recovery, /gh run download/);
  assert.match(recovery, /test -s dist\/index\.html/);
  assert.match(recovery, /test -s dist\/manifest\.webmanifest/);
  assert.match(recovery, /test -s dist\/sw\.js/);
  assert.match(recovery, /Recovery artifact unexpectedly contains the Vite source entry/);
  assert.match(recovery, /expected hashed Vite JavaScript entry/);
});

test("recovery path republishes and smoke-checks the restored build", () => {
  const recoveryStart = workflow.indexOf("  recover-last-good-pages:");
  const recovery = workflow.slice(recoveryStart);
  assert.match(recovery, /actions\/configure-pages@v5/);
  assert.match(recovery, /actions\/upload-pages-artifact@v4/);
  assert.match(recovery, /id: recovery_deployment/);
  assert.match(recovery, /actions\/deploy-pages@v4/);
  assert.match(recovery, /PAGE_URL: \$\{\{ steps\.recovery_deployment\.outputs\.page_url \}\}/);
  assert.match(recovery, /Emergency republish did not restore a production Vite entry/);
  assert.match(recovery, /Recovered MINIK Pages from the last verified production build/);
});
