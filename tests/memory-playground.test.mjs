import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/MemoryGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/memory-playground.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");

test("memory renders inside the immersive playground shell", () => {
  assert.match(game, /memory-playground/);
  assert.match(game, /memory-playground-status/);
  assert.match(game, /memory-grid/);
});

test("memory keeps the visible card linked to its spoken word", () => {
  assert.match(game, /const \[speakingCardId, setSpeakingCardId\] = useState\(null\)/);
  assert.match(game, /async function speakCard\(card\)/);
  assert.match(game, /await speak\(card\.item\.labels\[lang\], lang, settings\)/);
  assert.match(game, /speakingCardId === card\.id \? "speaking" : ""/);
  assert.match(game, /setOpen\(next\);[\s\S]*?speakCard\(card\);/);
  assert.doesNotMatch(game, /setMatched\(next\);\s*speak\(a\.item\.labels\[lang\], lang, settings\)/);
  assert.match(css, /\.memory-playground \.memory-card\.speaking\s*\{/);
  assert.match(css, /\.memory-playground \.memory-card\.speaking \.item-visual\s*\{[\s\S]*?animation:\s*memory-speaking/);
  assert.match(css, /@keyframes memory-speaking/);
});

test("memory lets the final learning word finish before the session solves", () => {
  assert.match(game, /const completingGame =\s*ok && matchedRef\.current\.length \+ 1 === chosen\.length/);
  assert.match(game, /if \(completingGame && speakingCardId !== null\) return/);
  assert.match(
    game,
    /\[open, paused, cards, chosen, speakingCardId, onSolve, onWrong, interactionBlocked, profile\.wrongRevealMs\]/,
  );
  assert.match(
    game,
    /if \(next\.length === chosen\.length\) onSolve\(chosen\.map\(\(i\) => i\.id\)\)/,
  );
});

test("memory playground keeps large touch targets and responsive layouts", () => {
  assert.match(css, /min-height:\s*clamp\(170px, 24vw, 280px\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /prefers-reduced-motion:[\s\S]*?memory-card\.speaking \.item-visual/);
});

test("memory playground stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/memory-playground\.css/);
});
