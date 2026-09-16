import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const session = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");
const pauseCss = fs.readFileSync(new URL("../src/games/pause-overlay.css", import.meta.url), "utf8");
const main = fs.readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");

test("game pause renders only two clear child choices", () => {
  assert.match(session, /className="pause-overlay" role="dialog" aria-modal="true"/);
  assert.match(session, /"Mola zamanı"/);
  assert.match(session, /"Devam et"/);
  assert.match(session, /"Dünyama dön"/);
});

test("pause state is a real safe-area full-screen overlay", () => {
  assert.match(pauseCss, /\.game-session \.pause-overlay\s*\{[\s\S]*?position: fixed[\s\S]*?inset: 0[\s\S]*?z-index: 200/);
  assert.match(pauseCss, /min-height: 100dvh/);
  assert.match(pauseCss, /overflow-y: auto/);
  assert.match(pauseCss, /overscroll-behavior: contain/);
  assert.match(pauseCss, /env\(safe-area-inset-top\)/);
  assert.match(pauseCss, /env\(safe-area-inset-right\)/);
  assert.match(pauseCss, /env\(safe-area-inset-bottom\)/);
  assert.match(pauseCss, /env\(safe-area-inset-left\)/);
});

test("pause actions stay large instead of shrinking around translated labels", () => {
  assert.match(
    pauseCss,
    /\.game-session \.pause-overlay > \.primary,[\s\S]*?\.game-session \.pause-overlay > \.secondary[\s\S]*?width: min\(320px, 100%\)[\s\S]*?min-width: 0[\s\S]*?min-height: 56px/,
  );
  assert.match(pauseCss, /@media \(max-width: 430px\)[\s\S]*?\.pause-overlay > \.primary,[\s\S]*?\.pause-overlay > \.secondary[\s\S]*?width: 100%/);
});

test("short phones keep pause controls reachable without shrinking targets", () => {
  const shortPhone = pauseCss.slice(pauseCss.indexOf("@media (max-height: 620px)"));
  assert.match(shortPhone, /justify-content: flex-start/);
  assert.match(shortPhone, /width: 110px/);
  assert.match(shortPhone, /height: 105px/);
  assert.doesNotMatch(shortPhone, /min-height:\s*(?:[0-4]?\d)px/);
});

test("pause styling is globally loaded after immersive game styles", () => {
  const immersive = main.indexOf('import "./games/immersive.css";');
  const pause = main.indexOf('import "./games/pause-overlay.css";');
  const guards = main.indexOf('import "./app/child-touch-guards.css";');
  assert.ok(immersive >= 0 && pause > immersive && guards > pause);
});
