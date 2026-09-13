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

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("core documentation preserves the fixed natural MINIK narrator as primary", () => {
  assert.match(docs["README.md"], /feste natürliche MINIK-Stimme ist der primäre DE\/TR-Erzähler/i);
  assert.match(docs["docs/TECH_SPEC.md"], /feste natürliche MINIK-Stimme als primären Erzähler/i);
  assert.match(docs["docs/HANDOFF_SUMMARY.md"], /feste natürliche DE\/TR-MINIK-Stimme als primäre Erzählstimme/i);
  assert.match(docs["docs/MASTER_PROMPT_FOR_WORK.md"], /Feste natürliche MINIK-Stimme zuerst/i);
});

test("core documentation keeps Voice 4 secondary and forbids automatic personal narration", () => {
  const combined = Object.values(docs).join("\n");
  assert.match(combined, /Voice 4[^\n]*(?:Notfall-Fallback|Notfallpfad)/i);
  assert.match(combined, /persönliche\/gekloonte Nutzerstimme[^\n]*nicht automatisch/i);
  assert.doesNotMatch(combined, /Voice 4 zuerst/i);
  assert.doesNotMatch(combined, /Stimme 4 als primäre/i);
  assert.doesNotMatch(combined, /Persönliche Stimme zuerst/i);
});

test("fallback contract excludes arbitrary robotic system voices", () => {
  assert.match(docs["README.md"], /Roboterstimmen werden nicht als Ersatz akzeptiert/i);
  assert.match(docs["docs/TECH_SPEC.md"], /Roboterstimmen werden nicht als Ersatz gewählt/i);
  assert.match(docs["docs/MASTER_PROMPT_FOR_WORK.md"], /Default-\/Browser-\/Roboterstimmen sind verboten/i);
});

test("runtime source enforces fixed natural narration before Voice 4", () => {
  const naturalIndex = voice.indexOf("fixedNaturalVoicePlan(text, lang)");
  const playbackIndex = voice.indexOf("speakNaturalPlan(plan, token)");
  const systemIndex = voice.indexOf("speakWithVoice4(");
  assert.ok(naturalIndex > 0);
  assert.ok(playbackIndex > naturalIndex);
  assert.ok(systemIndex > playbackIndex);
  assert.doesNotMatch(voice, /personalVoiceClip/);
});
