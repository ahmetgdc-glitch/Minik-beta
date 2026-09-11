import test from "node:test";
import assert from "node:assert/strict";
import { createDragSession, placePair } from "../src/games/dragSession.js";

const start = { pointerId: 1, id: "dog", x: 50, y: 80 };
test("a tiny finger movement remains a tap, while a real drag keeps its source", () => {
  const session = createDragSession();
  assert.equal(session.begin(start), true);
  assert.equal(session.move({ pointerId: 1, x: 55, y: 84 }).moved, false);
  const drop = session.finish({ pointerId: 1, x: 150, y: 220 });
  assert.equal(drop.moved, true);
  assert.equal(drop.id, "dog");
  assert.equal(session.finish({ pointerId: 1, x: 150, y: 220 }), null);
});
test("a second finger cannot steal, move, finish or cancel the first placement", () => {
  const session = createDragSession();
  session.begin(start);
  assert.equal(session.begin({ ...start, pointerId: 2, id: "cat" }), false);
  assert.equal(session.move({ pointerId: 2, x: 250, y: 200 }), null);
  assert.equal(session.finish({ pointerId: 2, x: 250, y: 200 }), null);
  assert.equal(session.cancel(2), false);
  assert.equal(session.finish({ pointerId: 1, x: 250, y: 200 }).id, "dog");
});
test("pause or lost capture discards stale completion and permits a fresh gesture", () => {
  const session = createDragSession();
  session.begin(start);
  session.move({ pointerId: 1, x: 220, y: 200 });
  assert.equal(session.cancel(), true);
  assert.equal(session.finish({ pointerId: 1, x: 220, y: 200 }), null);
  assert.equal(session.begin({ ...start, pointerId: 3 }), true);
  assert.equal(session.finish({ pointerId: 3, x: 220, y: 200 }).moved, true);
});
test("secondary mouse buttons, nonprimary touches and invalid coordinates never start a drag", () => {
  const session = createDragSession();
  for (const invalid of [{ button: 2 }, { isPrimary: false }, { id: null }, { x: Infinity }, { y: NaN }]) {
    assert.equal(session.begin({ ...start, ...invalid }), false);
  }
  assert.equal(session.begin(start), true);
  assert.equal(session.move({ pointerId: 1, x: NaN, y: 100 }), null);
});
test("moving back over the source still consumes a drag instead of producing a second tap", () => {
  const session = createDragSession();
  session.begin(start);
  session.move({ pointerId: 1, x: 250, y: 200 });
  assert.equal(session.finish({ pointerId: 1, x: 50, y: 80 }).moved, true);
});
test("matching scores each pair once and ignores invalid or already filled destinations", () => {
  const ids = ["dog", "cat"];
  let result = placePair([], "dog", "dog", ids);
  assert.equal(result.outcome, "match");
  assert.deepEqual(result.matched, ["dog"]);
  for (const [source, target] of [["dog", "dog"], ["cat", "dog"], [null, "cat"], ["cat", "outside"]]) {
    const duplicate = placePair(result.matched, source, target, ids);
    assert.equal(duplicate.outcome, "ignore");
    assert.equal(duplicate.matched, result.matched);
  }
  result = placePair(result.matched, "cat", "cat", ids);
  assert.deepEqual(result.matched, ids);
});
test("an incorrect pair asks for another try without mutating progress", () => {
  const matched = [];
  const result = placePair(matched, "dog", "cat", ["dog", "cat"]);
  assert.equal(result.outcome, "retry");
  assert.equal(result.matched, matched);
});
