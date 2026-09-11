import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const aquarium = fs.readFileSync(new URL("../src/rewards/Aquarium.jsx", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/rewards/immersive-rewards.css", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("aquarium presents rewards as a treasure reef instead of the legacy reward card grid", () => {
  assert.match(aquarium, /className="treasure-reef"/);
  assert.match(aquarium, /className="treasure-objects"/);
  assert.match(aquarium, /className={`treasure-object/);
  assert.doesNotMatch(aquarium, /className="rewards-grid"/);
  assert.doesNotMatch(aquarium, /reward-card/);
});

test("Mino outfits use a swipeable character parade", () => {
  assert.match(aquarium, /className="outfit-parade"/);
  assert.match(aquarium, /className="outfit-parade-track"/);
  assert.match(aquarium, /className={`outfit-character/);
  assert.doesNotMatch(aquarium, /className="outfit-grid"/);
  assert.doesNotMatch(aquarium, /outfit-card/);
});

test("reward reef keeps large touch scenes and mobile/reduced-motion handling", () => {
  assert.match(css, /\.treasure-object\s*\{[\s\S]*?min-height:\s*clamp\(245px/);
  assert.match(css, /scroll-snap-type:\s*x mandatory/);
  assert.match(css, /@media \(max-width: 390px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("immersive reward stylesheet is part of the production entry", () => {
  assert.match(main, /import "\.\/rewards\/immersive-rewards\.css";/);
});
