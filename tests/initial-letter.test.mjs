import test from "node:test";
import assert from "node:assert/strict";
import { initialLetter } from "../src/games/initialLetter.js";

test("initial letters handle German and Turkish casing", () => {
  assert.equal(initialLetter("Apfel", "de"), "A");
  assert.equal(initialLetter("äpfel", "de"), "Ä");
  assert.equal(initialLetter("inek", "tr"), "İ");
  assert.equal(initialLetter("şemsiye", "tr"), "Ş");
});

test("initial letters tolerate whitespace and empty labels", () => {
  assert.equal(initialLetter("  Katze", "de"), "K");
  assert.equal(initialLetter("", "de"), "");
});
