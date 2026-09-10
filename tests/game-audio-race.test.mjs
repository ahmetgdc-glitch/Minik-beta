import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../src/games/GameSession.jsx", import.meta.url), "utf8");

test("delayed lesson audio cannot speak after solve or Safari pause", () => {
  assert.match(
    source,
    /setTimeout\(\(\) => \{[\s\S]*?phaseRef\.current !== "active"[\s\S]*?manualPauseRef\.current[\s\S]*?lifecyclePauseRef\.current[\s\S]*?document\.hidden[\s\S]*?lesson\.repeat\?\.\(\);[\s\S]*?\}, 200\)/,
  );
  assert.match(source, /\}, \[lesson, paused, phase, settings\.audio\]\);/);
});

test("automatic Mino help is cancelled by synchronous game lifecycle state", () => {
  assert.match(source, /const stillInteractive = \(\) =>[\s\S]*?phaseRef\.current === "active"[\s\S]*?!manualPauseRef\.current[\s\S]*?!lifecyclePauseRef\.current/);
  assert.match(source, /const move = setTimeout\(\(\) => \{[\s\S]*?if \(!stillInteractive\(\)\) return;[\s\S]*?setHint/);
  assert.match(source, /const help = setTimeout\(\(\) => \{[\s\S]*?if \(!stillInteractive\(\)\) return;[\s\S]*?setMessage/);
  assert.match(source, /settings\.autoHelp, settings\.audio, lang/);
});


test("lesson replay always forwards to the newest voice settings render", () => {
  const shared = fs.readFileSync(new URL("../src/games/shared.jsx", import.meta.url), "utf8");
  assert.match(shared, /const repeatRef = useRef\(repeat\)/);
  assert.match(shared, /repeatRef\.current = repeat/);
  assert.match(shared, /repeat: \(\.\.\.args\) => repeatRef\.current\?\.\(\.\.\.args\)/);
});

test("disabling narration immediately cancels an utterance already in progress", () => {
  assert.match(source, /if \(!settings\.audio\) stopSpeech\(\);[\s\S]*?\}, \[settings\.audio\]\);/);
});
