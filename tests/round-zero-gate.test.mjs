import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fixedNaturalVoicePlan } from "../src/audio/fixedNaturalVoicePlans.js";

const wrapper = await fs.readFile("src/games/PreparedGameSession.jsx", "utf8");

// Every static round-0 instruction the session preloader declares, keyed by
// game family. Games that compose their opening sentence at runtime from the
// target word or letter stay out of this set by design (see introText comment).
const STATIC_INSTRUCTIONS = new Set([
  "explore", "different", "memory", "match", "sort", "count", "sounds",
  "puzzle", "shadow", "missing", "pattern", "story", "initialletter", "draw",
  "rhythm",
]);

const RUNTIME_COMPOSED = new Set([
  "speak", "trace", "lettertrace", "dailyorder", "opposites", "review",
  "listen", "socialsteps",
]);

function extractIntroText(source) {
  const lines = source.split("\n");
  const start = lines.findIndex((line) => line.trim().startsWith("const introText = {"));
  assert.ok(start >= 0, "introText literal must exist");
  let end = start;
  while (end < lines.length && lines[end].trim() !== "};") end += 1;
  assert.ok(end < lines.length, "introText literal must be closed");
  return lines.slice(start, end + 1).join("\n");
}

function introEntries(block) {
  const entries = {};
  const pattern = /^\s*(\w+): \{ de: "((?:[^"\\]|\\.)*)", tr: "((?:[^"\\]|\\.)*)" \},$/gm;
  let match;
  while ((match = pattern.exec(block))) entries[match[1]] = { de: match[2], tr: match[3] };
  return entries;
}

const block = extractIntroText(wrapper);
const entries = introEntries(block);

test("round-0 instruction set covers every statically spoken lesson line", () => {
  assert.deepEqual(
    Object.keys(entries).sort(),
    [...STATIC_INSTRUCTIONS].sort(),
    "introText must match the static round-0 instruction set exactly",
  );
  for (const game of RUNTIME_COMPOSED) {
    assert.equal(
      entries[game],
      undefined,
      `${game} assembles its opening sentence at runtime and must not pretend a static round-0 clip`,
    );
  }
});

test("recorded static instructions resolve to a fixed voiced clip in both languages", () => {
  const recorded = Object.keys(entries).filter((game) => game !== "puzzle");
  assert.ok(recorded.length > 10, "most static instructions must already be recorded");
  for (const game of recorded) {
    const { de, tr } = entries[game];
    assert.ok(
      fixedNaturalVoicePlan(de, "de").length >= 1,
      `${game} de must resolve to a fixed clip: ${de}`,
    );
    assert.ok(
      fixedNaturalVoicePlan(tr, "tr").length >= 1,
      `${game} tr must resolve to a fixed clip: ${tr}`,
    );
  }
});

test("puzzle declares the real spoken instruction and drops the fabricated one", () => {
  assert.equal(entries.puzzle.de, "Ziehe die Puzzleteile an die richtige Stelle.");
  assert.equal(entries.puzzle.tr, "Puzzle parçalarını doğru yere sürükle.");
  const stale = [
    /Tippe zwei Teile an und tausche sie\./,
    /İki parçaya dokun, yerlerini değiştir\./,
  ];
  for (const pattern of stale) {
    assert.doesNotMatch(wrapper, pattern, "an instruction the games no longer speak must not be preloaded");
  }
});

test("the round-0 opener is re-warmed last so its first utterance is media-ready", () => {
  const rePrime = wrapper.indexOf("const openerText = introText[gameId]?.[lang];");
  const gate = wrapper.indexOf("voiceUrls.every((url) => preloadedVoiceReady(url))");
  assert.ok(rePrime >= 0, "the opener re-warm step must exist");
  assert.match(wrapper, /const openerUrls = openerText \? fixedVoiceUrls\(\[openerText\], lang\) : \[\];/);
  assert.match(wrapper, /if \(openerUrls\[0\]\) await preloadVoiceClip\(openerUrls\[0\]\);/);
  assert.ok(
    rePrime < gate,
    "the opener must be warmed before the playback-ready verdict is read",
  );
  assert.match(
    wrapper,
    /The shared media player buffers exactly one clip\. Warm the round-0/,
    "the re-warm rationale must stay documented",
  );
});