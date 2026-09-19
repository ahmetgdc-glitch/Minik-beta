import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const game = fs.readFileSync(new URL("../src/games/SpeakGame.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/games/speak-stage.css", import.meta.url), "utf8");

test("speaking keeps Mino as a floating companion beside the microphone", () => {
  assert.match(game, /import Visual, \{ MinoAvatar \} from "\.\.\/components\/Visual\.jsx";/);
  assert.match(game, /progress,/);
  assert.match(game, /className="speak-mino-guide"/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(game, /aria-hidden="true"/);
  assert.match(css, /\.speak-mino-guide \{/);
  assert.match(css, /\.speak-mino-guide \.mino-avatar \{/);
  assert.match(css, /@keyframes speakMinoFloat/);
  assert.match(css, /prefers-reduced-motion[\s\S]*?\.speak-mino-guide \{[\s\S]*?animation: none;/);
});