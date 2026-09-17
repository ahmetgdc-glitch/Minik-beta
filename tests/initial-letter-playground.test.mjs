import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/letter-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/InitialLetterGame.jsx", import.meta.url), "utf8");

test("initial-letter game keeps a large visual target and toy-like letter choices", () => {
  assert.match(game, /initial-letter-target/);
  assert.match(game, /letter-choice-grid/);
  assert.match(css, /min-height:clamp\(280px,48svh,500px\)/);
  assert.match(css, /\.initial-letter-target \.item-visual\{/);
  assert.doesNotMatch(css, /\.initial-letter-target \.visual\{/);
  assert.match(css, /font:900 clamp\(2\.8rem,9vw,5\.4rem\)/);
});

test("initial-letter keeps the answer hidden until Mino gives stronger help", () => {
  assert.match(game, /const displayPrompt =/);
  assert.match(game, /"Bu kelime hangi harfle başlıyor\?"/);
  assert.match(game, /"Mit welchem Buchstaben beginnt das Wort\?"/);
  assert.match(game, /useLesson\(\s*onReady,\s*displayPrompt,\s*\(\) => speak\(prompt, lang, settings\)/);
  assert.match(game, /hint >= 2 && <strong className="initial-letter-word-hint">\{target\.labels\[lang\]\}<\/strong>/);
  assert.doesNotMatch(game, /<strong>\{target\.labels\[lang\]\}<\/strong>/);
});

test("initial-letter target always replays the exact spoken learning word", () => {
  assert.match(
    game,
    /function hearTarget\(\)\s*\{[\s\S]*?if \(blocked\(\)\) return;[\s\S]*?speak\(target\.labels\[lang\], lang, settings\);[\s\S]*?\}/,
  );
  assert.match(game, /`${target\.labels\.tr} hangi harfle başlıyor\?`/);
  assert.match(game, /`Mit welchem Buchstaben beginnt \${target\.labels\.de}\?`/);
  assert.doesNotMatch(game, /fixedNaturalVoicePlan/);
  assert.match(game, /onClick=\{hearTarget\}/);
  assert.match(game, /onKeyDown=\{handleTargetKeyDown\}/);
  assert.match(game, /aria-label=\{replayLabel\}/);
});

test("initial-letter replay and letter choices respect paused and stale interaction guards", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(game, /function blocked\(\)/);
  assert.match(game, /return paused \|\| interactionBlocked\(\)/);
  assert.match(game, /if \(blocked\(\)\) return/);
  assert.match(game, /tabIndex=\{controlsDisabled \? -1 : 0\}/);
  assert.match(game, /aria-disabled=\{controlsDisabled \|\| undefined\}/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
});

test("initial-letter playground adapts to narrow phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /\.initial-letter-target \.item-visual\{width:min\(62vw,250px\);height:min\(62vw,250px\)\}/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:112px/);
});

test("initial-letter playground stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/letter-playground\.css/);
});
