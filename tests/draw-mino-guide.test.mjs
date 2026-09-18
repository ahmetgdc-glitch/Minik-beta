import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const game = readFileSync(new URL("../src/games/DrawGame.jsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/games/draw-coloring.css", import.meta.url), "utf8");

test("drawing shows Mino as a visible studio companion with the chosen outfit", () => {
  assert.match(game, /import Visual, \{ assetUrl, MinoAvatar \} from "\.\.\/components\/Visual\.jsx";/);
  assert.match(game, /progress,/);
  assert.match(game, /className="draw-mino-guide"/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(game, /progress\?\.minoOutfit/);
  assert.match(css, /\.draw-template-strip>\.draw-mino-guide\{/);
  assert.match(css, /\.draw-mino-guide \.mino-avatar\{/);
  assert.match(css, /\.draw-mino-spark\{/);
  assert.match(css, /@media\(max-width:680px\)[\s\S]*?\.draw-mino-guide\{/);
});