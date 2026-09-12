import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const files = [
  "README.md",
  "docs/TECH_SPEC.md",
  "docs/HANDOFF_SUMMARY.md",
  "docs/MASTER_PROMPT_FOR_WORK.md",
];

const docs = Object.fromEntries(
  files.map((file) => [file, fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8")]),
);

test("core documentation preserves Voice 4 as the primary narrator contract", () => {
  for (const [file, text] of Object.entries(docs)) {
    assert.match(text, /(?:Voice 4|Stimme 4)/i, `${file} must mention Voice 4`);
  }
  assert.match(docs["docs/MASTER_PROMPT_FOR_WORK.md"], /Voice 4 zuerst/i);
  assert.match(docs["docs/TECH_SPEC.md"], /primären Erzähler/i);
  assert.match(docs["docs/HANDOFF_SUMMARY.md"], /feste primäre Sprecher/i);
});

test("core documentation does not reintroduce obsolete personal-first or system-voice-disabled guidance", () => {
  const combined = Object.values(docs).join("\n");
  assert.doesNotMatch(combined, /Persönliche Stimme zuerst/i);
  assert.doesNotMatch(combined, /Systemstimme ist hart deaktiviert/i);
  assert.doesNotMatch(combined, /Systemstimme bleibt standardmäßig aus/i);
});

test("Voice 4 fallback contract excludes arbitrary robotic voices", () => {
  assert.match(docs["README.md"], /Roboterstimmen werden nicht als Ersatz akzeptiert/i);
  assert.match(docs["docs/TECH_SPEC.md"], /Roboterstimmen werden nicht als Ersatz gewählt/i);
  assert.match(docs["docs/MASTER_PROMPT_FOR_WORK.md"], /Roboterstimmen sind kein zulässiger Ersatz/i);
});
