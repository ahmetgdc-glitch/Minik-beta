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
  assert.match(docs["docs/HANDOFF_SUMMARY.md"], /(?:primäre MINIK-Erzählstimme|primäre(?:r|n)? Sprecher)/i);
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
  assert.match(
    docs["docs/MASTER_PROMPT_FOR_WORK.md"],
    /(?:Roboterstimmen[^\n]*(?:kein zulässiger Ersatz|verboten)|keinem Wechsel auf beliebige Browser-\/Default-\/Roboterstimmen)/i,
  );
});

test("Voice 4 documentation keeps an audible local emergency path", () => {
  const master = docs["docs/MASTER_PROMPT_FOR_WORK.md"];
  const handoff = docs["docs/HANDOFF_SUMMARY.md"];

  assert.match(master, /komplette Stille ist kein zulässiger Dauer-Fallback/i);
  assert.match(master, /DE\/TR-Clips als hörbarem Notfall-Fallback/i);
  assert.match(handoff, /Kein Dauer-Stumm-Fallback/i);
  assert.match(handoff, /lokale(?:r)? DE\/TR-(?:Notfallclip|Clip)/i);
});
