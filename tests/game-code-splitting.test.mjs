import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const source = await fs.readFile("src/games/GameSession.jsx", "utf8");
const styles = await fs.readFile("src/games/immersive.css", "utf8");
const styleLoaders = await fs.readFile("src/gameStyles.js", "utf8");
const entry = await fs.readFile("src/main.jsx", "utf8");

test("game modules load on demand instead of delaying app startup", () => {
  const staticGameImports = [...source.matchAll(/import\s+\w+Game\s+from\s+["']\.\/\w+Game\.jsx["']/g)];
  const lazyGameImports = [...source.matchAll(/lazyGame\(\(\)\s*=>\s*import\(["']\.\/(\w+Game\.jsx)["']/g)];

  assert.equal(staticGameImports.length, 0);
  assert.equal(lazyGameImports.length, 23);
  assert.equal(new Set(lazyGameImports.map((match) => match[1])).size, 22);
  assert.match(source, /<Suspense fallback=\{<GameLoading lang=\{lang\} \/>\}>/);
});

test("game presentation styles load with their matching module", () => {
  const dynamicStyles = [...styleLoaders.matchAll(/import\(["']\.\/games\/([^"']+\.css)["']\)/g)];
  assert.equal(dynamicStyles.length, 22);
  assert.equal(new Set(dynamicStyles.map((match) => match[1])).size, 21);
  assert.doesNotMatch(entry, /import ["']\.\/games\/(?:story-journey|listen-playground|draw-coloring)\.css["']/);
  assert.match(source, /Promise\.all\(\[component\(\), styles\(\)\]\)/);
});

test("the loading state is child-friendly, bilingual and motion-safe", () => {
  assert.match(source, /role="status" aria-live="polite"/);
  assert.match(source, /Oyun hazırlanıyor…/);
  assert.match(source, /Spiel wird vorbereitet…/);
  assert.match(styles, /\.game-loading \{/);
  assert.match(styles, /@media\(prefers-reduced-motion:reduce\) \{ \.game-loading \.mino \{ animation:none; \} \}/);
});
