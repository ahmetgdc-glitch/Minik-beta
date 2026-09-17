import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hook = readFileSync(new URL("../src/games/useDragPlacement.js", import.meta.url), "utf8");
const match = readFileSync(new URL("../src/games/MatchGame.jsx", import.meta.url), "utf8");
const sort = readFileSync(new URL("../src/games/SortGame.jsx", import.meta.url), "utf8");
const puzzle = readFileSync(new URL("../src/games/PuzzleGame.jsx", import.meta.url), "utf8");

function between(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `missing source section: ${start}`);
  return source.slice(from, to);
}

test("drag placement separates pointer-start feedback from tap selection", () => {
  assert.match(hook, /onDragStart, onSelect, onDrop/);
  const begin = between(hook, "function begin", "function move");
  const end = between(hook, "function end", "useEffect");
  assert.match(begin, /latest\.current\.onDragStart\?\.\(id\)/);
  assert.doesNotMatch(begin, /onSelect/);
  assert.match(end, /if \(!next\.moved\) \{[\s\S]*?latest\.current\.onSelect\?\.\(next\.id\)/);
  assert.match(end, /if \(target\) latest\.current\.onDrop\(next\.id, target\)/);
});

test("cancelled visual drags clear stale tap selection without narrating sort", () => {
  const clear = between(hook, "function clearDragSelection", "function cancel");
  const cancel = between(hook, "function cancel", "function dropTarget");
  const begin = between(hook, "function begin", "function move");
  assert.match(clear, /if \(latest\.current\.onDragStart\) latest\.current\.onSelect\?\.\(null\)/);
  assert.match(cancel, /clearDragSelection\(\)/);
  assert.match(begin, /catch \{[\s\S]*?session\.current\.cancel\(\)[\s\S]*?clearDragSelection\(\)/);
  assert.match(match, /onDragStart: setSelected/);
  assert.match(puzzle, /onDragStart: setSelected/);
  assert.doesNotMatch(sort, /onDragStart:/);
});

test("pointer-generated click is suppressed while keyboard click keeps the tap callback", () => {
  assert.match(hook, /event\.detail !== 0 && suppressClick\.current/);
  assert.match(hook, /latest\.current\.onSelect\?\.\(id\)/);
});

test("every drag source owns its touch gesture before pointerdown", () => {
  const props = between(hook, "sourceProps: (id)", "onPointerDown:");
  assert.match(props, /touchAction: "none"/);
});

test("matching highlights on pointer start but only speaks through the tap callback", () => {
  assert.match(match, /onDragStart: setSelected/);
  assert.match(match, /onSelect: selectSource/);
  assert.doesNotMatch(match, /onDragStart: selectSource/);
  assert.match(match, /speak\(item\.labels\[lang\], lang, settings\)/);
});

test("matching clears a stale source after a wrong pair", () => {
  const drop = between(match, "function drop", "function tapTarget");
  assert.match(drop, /result\.outcome === "retry"[\s\S]*?setSelected\(null\)[\s\S]*?onWrong\(\[source\]\)/);
});

test("matching keeps its explicit iOS drag guard as defense in depth", () => {
  const sourceButton = between(match, "className={`match-source", "aria-pressed={selected === item.id}");
  assert.match(sourceButton, /style=\{\{ touchAction: "none" \}\}/);
});

test("sorting no longer narrates just because a child starts dragging", () => {
  assert.match(sort, /onSelect: \(\) => speak\(lessonText, lang, settings\)/);
  assert.doesNotMatch(sort, /onDragStart:/);
  assert.match(sort, /\.\.\.placement\.sourceProps\(target\.id\)/);
});

test("puzzle keeps immediate visual piece selection without adding narration", () => {
  assert.match(puzzle, /onDragStart: setSelected/);
  assert.match(puzzle, /onSelect: setSelected/);
  assert.match(puzzle, /\.\.\.placement\.sourceProps\(id\)/);
});
