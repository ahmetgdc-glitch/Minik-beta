import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/games/letter-playground.css", import.meta.url), "utf8");
const entry = readFileSync(new URL("../src/gameStyles.js", import.meta.url), "utf8");
const game = readFileSync(new URL("../src/games/InitialLetterGame.jsx", import.meta.url), "utf8");

test("initial-letter game keeps a large visual target and toy-like letter choices", () => {
  assert.match(game, /initial-letter-target/);
  assert.match(game, /letter-choice-grid/);
  assert.match(css, /min-height:clamp\(280px,48svh,500px\)/);
  assert.match(css, /\.initial-letter-target \.item-visual\{/);
  assert.doesNotMatch(css, /\.initial-letter-target \.visual\{/);
  assert.match(css, /font:900 clamp\(2\.8rem,9vw,5\.4rem\)/);
});

test("Mino and a visible listening cue show children that the large target can replay", () => {
  assert.match(game, /import \{ Volume2 \} from "lucide-react"/);
  assert.match(game, /import Visual, \{ MinoAvatar \}/);
  assert.match(game, /progress,/);
  assert.match(game, /className="initial-letter-mino-guide" aria-hidden="true"/);
  assert.match(game, /<MinoAvatar outfit=\{progress\?\.minoOutfit \|\| "classic"\} \/>/);
  assert.match(game, /className="initial-letter-hear-cue"><Volume2 size=\{24\} \/>/);
  assert.match(css, /\.initial-letter-mino-guide\{[^}]*pointer-events:none/);
  assert.match(css, /@keyframes letterHearPulse/);
});

test("initial-letter keeps the answer hidden until Mino gives demonstration help", () => {
  assert.match(game, /const displayPrompt =/);
  assert.match(game, /"Bu kelime hangi harfle başlıyor\?"/);
  assert.match(game, /"Mit welchem Buchstaben beginnt das Wort\?"/);
  assert.match(game, /function playPrompt\(\) \{[\s\S]*?return speakLocked\(prompt\)/);
  assert.match(game, /useLesson\(\s*onReady,\s*displayPrompt,\s*playPrompt/);
  assert.match(game, /hint >= 3 && <strong className="initial-letter-word-hint">\{target\.labels\[lang\]\}<\/strong>/);
  assert.doesNotMatch(game, /hint >= 2 && <strong className="initial-letter-word-hint"/);
  assert.doesNotMatch(game, /<strong>\{target\.labels\[lang\]\}<\/strong>/);
});

test("initial-letter target always replays the exact spoken learning word", () => {
  assert.match(
    game,
    /function hearTarget\(\)\s*\{[\s\S]*?if \(controlsDisabled \|\| hearingTarget\) return;[\s\S]*?return speakLocked\(target\.labels\[lang\]\);[\s\S]*?\}/,
  );
  assert.match(game, /`\$\{target\.labels\.tr\} hangi harfle başlıyor\?`/);
  assert.match(game, /`Mit welchem Buchstaben beginnt \$\{target\.labels\.de\}\?`/);
  assert.doesNotMatch(game, /fixedNaturalVoicePlan/);
  assert.match(game, /onClick=\{hearTarget\}/);
  assert.match(game, /onKeyDown=\{handleTargetKeyDown\}/);
  assert.match(game, /aria-label=\{replayLabel\}/);
});

test("initial-letter replay and letter choices respect lifecycle and active narration locks", () => {
  assert.match(game, /const controlsDisabled = paused \|\| interactionBlocked\(\);/);
  assert.match(game, /const answersDisabled = controlsDisabled \|\| hearingTarget/);
  assert.match(game, /function blocked\(\)/);
  assert.match(game, /return paused \|\| interactionBlocked\(\)/);
  assert.match(game, /if \(answersDisabled\) return/);
  assert.match(game, /tabIndex=\{controlsDisabled \|\| hearingTarget \? -1 : 0\}/);
  assert.match(game, /aria-disabled=\{controlsDisabled \|\| hearingTarget \|\| undefined\}/);
  assert.match(game, /disabled=\{answersDisabled\}/);
  assert.match(game, /if \(!controlsDisabled\) return;[\s\S]*?voiceRun\.current \+= 1;[\s\S]*?setHearingTarget\(false\)/);
});

test("initial-letter waits for the concrete spoken target before accepting an answer", () => {
  assert.match(game, /const \[hearingTarget, setHearingTarget\] = useState\(false\)/);
  assert.match(game, /const run = \+\+voiceRun\.current;[\s\S]*?setHearingTarget\(true\);[\s\S]*?await speak\(spokenText, lang, settings\)/);
  assert.match(game, /if \(run === voiceRun\.current\) setHearingTarget\(false\)/);
  assert.match(game, /disabled=\{answersDisabled\}/);
});

test("initial-letter playground adapts to narrow phones", () => {
  assert.match(css, /@media\(max-width:700px\)/);
  assert.match(css, /\.initial-letter-mino-guide\{width:72px;height:84px/);
  assert.match(css, /\.initial-letter-target \.item-visual\{width:min\(62vw,250px\);height:min\(62vw,250px\)\}/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /min-height:112px/);
});

test("initial-letter playground stylesheet is loaded in production", () => {
  assert.match(entry, /\.\/games\/letter-playground\.css/);
});
