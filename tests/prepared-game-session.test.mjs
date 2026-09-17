import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const wrapper = await fs.readFile("src/games/PreparedGameSession.jsx", "utf8");
const app = await fs.readFile("src/App.jsx", "utf8");
const styles = await fs.readFile("src/games/prepared-game-session.css", "utf8");

test("game route waits for bundle and world assets before mounting GameSession", () => {
  assert.match(app, /PreparedGameSession from "\.\/games\/PreparedGameSession\.jsx"/);
  assert.match(app, /<PreparedGameSession/);
  assert.doesNotMatch(app, /<GameSession/);
  assert.match(wrapper, /await Promise\.all\(\[\s*preloadGameBundle\(gameId\),\s*preloadTasks\(tasks,/);
  assert.match(wrapper, /if \(!status\.ready\)/);
  assert.match(wrapper, /return <GameSession \{\.\.\.props\} \/>/);
});

test("preloader warms code, styles, scene, visuals and exact fixed voice clips", () => {
  const dynamicGames = [...wrapper.matchAll(/:\s*\(\)\s*=>\s*import\("\.\/(\w+Game\.jsx)"\)/g)];
  assert.equal(dynamicGames.length, 23);
  assert.equal(new Set(dynamicGames.map((match) => match[1])).size, 22);
  assert.match(wrapper, /gameStyles\[gameId\]/);
  assert.match(wrapper, /assets\/scenes\/\$\{sceneForWorld\(worldId\)\}\.webp/);
  assert.match(wrapper, /assets\/illustrations\/\$\{item\.asset\}\.svg/);
  assert.match(wrapper, /item\.variants\?\.photo/);
  assert.match(wrapper, /fixedNaturalVoicePlan\(text, lang\)/);
  assert.match(wrapper, /assets\/voice\/\$\{filename\}/);
  assert.match(wrapper, /cache: "force-cache"/);
  assert.match(wrapper, /image\.decode/);
});

test("failed assets keep the child behind the loader instead of starting half-loaded", () => {
  assert.match(wrapper, /if \(!ok\) failed \+= 1/);
  assert.match(wrapper, /if \(failed\) throw new Error\(`failed to preload \$\{failed\} game assets`\)/);
  assert.match(wrapper, /setStatus\(\(current\) => \(\{ \.\.\.current, failed: true \}\)\)/);
  assert.match(wrapper, /Tekrar dene/);
  assert.match(wrapper, /Noch einmal versuchen/);
});

test("loading screen is Turkish-first capable, progressive and motion-safe", () => {
  assert.match(wrapper, /Oyun hazırlanıyor/);
  assert.match(wrapper, /Resimler, sesler ve oyun alanı yükleniyor/);
  assert.match(wrapper, /role="progressbar"/);
  assert.match(wrapper, /aria-valuenow=\{percent\}/);
  assert.match(wrapper, /MIN_LOADING_MS = 450/);
  assert.match(styles, /\.game-preload-screen/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
});
