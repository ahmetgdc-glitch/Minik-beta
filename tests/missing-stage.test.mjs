import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/MissingGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/missing-stage.css", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("missing-object game uses an immersive memory stage instead of the legacy remember row", () => {
  assert.match(game, /missing-stage-game/);
  assert.match(game, /missing-object-row/);
  assert.match(game, /missing-choice-grid/);
  assert.doesNotMatch(game, /className="remember-row"/);
  assert.doesNotMatch(game, /<OptionGrid/);
});

test("missing-object stage preserves a visible vanished slot and large child-first controls", () => {
  assert.match(game, /missing-object-slot/);
  assert.match(game, /vanished/);
  assert.match(css, /min-height:\s*clamp\(330px, 56vh, 560px\)/);
  assert.match(css, /touch-action:\s*manipulation/);
  assert.match(css, /@media \(max-width: 680px\)/);
  assert.match(css, /prefers-reduced-motion/);
});

test("missing-object stage stylesheet is part of the production entry", () => {
  assert.match(main, /\.\/games\/missing-stage\.css/);
});
