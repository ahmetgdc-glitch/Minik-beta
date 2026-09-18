import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/trace-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/TraceGame.jsx", import.meta.url), "utf8");

test("tracing uses a large touch-first playground", () => {
  assert.match(game, /trace-board/);
  assert.match(css, /width: min\(78vw, 620px\)/);
  assert.match(css, /touch-action: none/);
  assert.match(css, /max-height: min\(70svh, 620px\)/);
});

test("tracing disables drawing and restart controls during stale transitions", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(game, /aria-disabled=\{controlsDisabled \|\| undefined\}/);
  assert.match(game, /pointerEvents: controlsDisabled \? "none" : undefined/);
  assert.match(game, /disabled=\{controlsDisabled\}/);
});

test("tracing expands for phones", () => {
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /width: min\(94vw, 560px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
});

test("tracing shows Mino as a visible target coach with the picked outfit", () => {
  assert.match(game, /import \{ MinoAvatar \} from "\.\.\/components\/Visual\.jsx";/);
  assert.match(game, /progress,/);
  assert.match(game, /className="trace-mino-guide"/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(game, /progress\?\.minoOutfit/);
  assert.match(game, /className="trace-target-bubble">\{target\}<\/span>/);
  assert.match(css, /\.trace-mino-guide \{/);
  assert.match(css, /\.trace-mino-guide \.mino-avatar \{/);
  assert.match(css, /\.trace-target-bubble \{/);
  assert.match(css, /@keyframes traceMinoFloat/);
  assert.match(css, /prefers-reduced-motion: reduce\)[\s\S]*?\.trace-mino-guide \{[\s\S]*?animation: none;/);
});

test("tracing playground stylesheet is loaded", () => {
  assert.match(entry, /\.\/games\/trace-playground\.css/);
});
