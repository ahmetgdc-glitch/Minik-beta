import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/MatchGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/match-playground.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");

test("matching uses a large twin playground with progress", () => {
  assert.match(game, /match-playground/);
  assert.match(game, /match-stage-header/);
  assert.match(game, /match-progress/);
  assert.match(game, /matching-zone-grid/);
  assert.match(game, /Finde die Zwillinge/);
});

test("matching keeps Mino visible as an outfit-wearing helper", () => {
  assert.match(game, /import Visual, \{ MinoAvatar \} from "\.\.\/components\/Visual\.jsx";/);
  assert.match(game, /progress,/);
  assert.match(game, /className="match-mino-guide"/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(game, /progress\?\.minoOutfit/);
  assert.match(css, /\.match-mino-guide \{/);
  assert.match(css, /\.match-mino-guide \.mino-avatar \{/);
  assert.match(css, /@keyframes matchMinoFloat/);
  assert.match(css, /prefers-reduced-motion: reduce\)[\s\S]*?\.match-mino-guide,[\s\S]*?animation: none;/);
});

test("matching preserves safe drag and tap placement", () => {
  assert.match(game, /useDragPlacement/);
  assert.match(game, /placePair/);
  assert.match(game, /paused \|\| interactionBlocked\(\)/);
  assert.match(game, /data-drop-id/);
  assert.match(game, /onDragStart: setSelected/);
  assert.match(game, /onSelect: selectSource/);
  assert.doesNotMatch(game, /onDragStart: selectSource/);
});

test("matching speaks the exact visible learning label when a source is tapped", () => {
  assert.match(game, /function selectSource\(id\)/);
  assert.match(game, /const item = chosen\.find\(\(entry\) => entry\.id === id\)/);
  assert.match(game, /await speak\(item\.labels\[lang\], lang, settings\)/);
  assert.match(game, /onSelect: selectSource/);
});

test("matching lets the final tapped source word finish before solving", () => {
  assert.match(game, /const \[matched, setMatched\] = useState\(\[\]\),[\s\S]*?\[speakingSourceId, setSpeakingSourceId\] = useState\(null\),[\s\S]*?\[pendingSolve, setPendingSolve\] = useState\(null\)/);
  assert.match(game, /const run = \+\+speechRun\.current;[\s\S]*?setSpeakingSourceId\(id\);[\s\S]*?await speak\(item\.labels\[lang\], lang, settings\)/);
  assert.match(game, /if \(result\.matched\.length === chosen\.length\) \{[\s\S]*?if \(speakingSourceId !== null\) setPendingSolve\(solvedIds\);[\s\S]*?else onSolve\(solvedIds\)/);
  assert.match(game, /if \(!pendingSolve \|\| speakingSourceId !== null \|\| paused \|\| interactionBlocked\(\)\) return/);
  assert.match(game, /setPendingSolve\(null\);[\s\S]*?onSolve\(solvedIds\)/);
});

test("matching lets a child hear an unselected target without replacing its exact word", () => {
  assert.match(game, /function tapTarget\(item\)/);
  assert.match(game, /if \(selected\) \{[\s\S]*?drop\(selected, item\.id\);[\s\S]*?return;[\s\S]*?\}/);
  assert.match(game, /function tapTarget\(item\)[\s\S]*?speak\(item\.labels\[lang\], lang, settings\);/);
  assert.match(game, /onClick=\{\(\) => tapTarget\(item\)\}/);
});

test("matching makes artwork substantially larger and stays phone friendly", () => {
  assert.match(css, /min-height:\s*clamp\(500px,\s*58svh,\s*650px\)/);
  assert.match(css, /height:\s*clamp\(185px,\s*24svh,\s*270px\)/);
  assert.match(css, /@media\s*\(max-width:\s*620px\)/);
  assert.match(css, /min-height:\s*clamp\(116px,\s*32vw,\s*158px\)/);
  assert.match(css, /height:\s*clamp\(86px,\s*25vw,\s*122px\)/);
  assert.match(css, /@media\s*\(max-width:\s*520px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("matching can expand beyond the legacy narrow game area", () => {
  assert.match(css, /game-area:has\(> \.match-playground\)/);
  assert.match(css, /max-width:\s*1260px/);
});

test("matching playground stylesheet is loaded in production", () => {
  assert.match(main, /\.\/games\/match-playground\.css/);
});
