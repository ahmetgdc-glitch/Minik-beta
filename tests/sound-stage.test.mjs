import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/sound-stage.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/SoundsGame.jsx", import.meta.url), "utf8");

test("real-sound game uses an immersive sound stage", () => {
  assert.match(game, /sounds-playground/);
  assert.match(game, /sound-stage-scene/);
  assert.match(game, /sound-orb/);
  assert.match(css, /width:clamp\(210px,36vw,360px\)/);
  assert.match(css, /min-height:clamp\(190px,30svh,300px\)/);
  assert.match(css, /\.sound-stage-scene\{[^}]*min-height:clamp\(340px,52svh,560px\)/);
});

test("Mino stays visibly inside the listening world without stealing taps", () => {
  assert.match(game, /import \{ MinoAvatar \} from "\.\.\/components\/Visual\.jsx"/);
  assert.match(game, /progress,/);
  assert.match(game, /className="sound-mino-guide" aria-hidden="true"/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(css, /\.sound-mino-guide\{[^}]*pointer-events:none/);
  assert.match(css, /\.sound-stage-scene\.is-listening \.sound-mino-guide/);
});

test("real-sound choices stay visual-first until demonstration help", () => {
  assert.match(game, /hiddenLabels=\{hint < 3\}/);
  assert.match(game, /<OptionGrid/);
});

test("real-sound answer sizing targets the live Visual.jsx class", () => {
  assert.match(css, /\.sounds-playground \.answer-card \.item-visual\{/);
  assert.doesNotMatch(css, /\.sounds-playground \.answer-card \.visual\{/);
});

test("real-sound stage stops active effects when it unmounts", () => {
  assert.match(game, /useEffect\(\(\) => \(\) => \{/);
  assert.match(game, /stopSounds\(\)/);
  assert.match(game, /setPlaying\(false\)/);
});

test("real-sound stage keeps large answer choices on phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /\.sound-stage-scene\{min-height:300px;grid-template-columns:105px minmax\(0,1fr\)/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:clamp\(150px,24svh,220px\)/);
  assert.match(css, /\.sounds-playground \.answer-card \.item-visual\{width:min\(38vw,170px\);height:min\(38vw,170px\)\}/);
});

test("real-sound stage motion respects reduced-motion preference", () => {
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /sound-mino-guide/);
  assert.match(css, /sound-mino-wave/);
});

test("real-sound stage stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/sound-stage\.css/);
});
