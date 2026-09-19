import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fixedNaturalVoiceClip } from "../src/audio/fixedNaturalVoicePlans.js";
import { helpVoiceClip } from "../src/audio/helpVoiceClips.js";

const screen = readFileSync(
  new URL("../src/worlds/WorldScreen.jsx", import.meta.url),
  "utf8",
);

test("free world discovery highlights the object for the real speech lifetime", () => {
  assert.match(
    screen,
    /const \[speakingId, setSpeakingId\] = useState\(null\)/,
  );
  assert.match(screen, /const speechRun = useRef\(0\)/);
  assert.match(screen, /async function speakItem\(item\)/);
  assert.match(
    screen,
    /await speak\(item\.labels\[lang\], lang, progress\.settings\)/,
  );
  assert.match(
    screen,
    /if \(run === speechRun\.current\) setSpeakingId\(null\)/,
  );
  assert.match(screen, /speakingId=\{speakingId\}/);
});

test("rapid word and mode changes cannot clear or retain a newer speech state", () => {
  assert.match(screen, /const run = \+\+speechRun\.current/);
  assert.match(screen, /speechRun\.current \+= 1/);
  assert.match(screen, /setSpeakingId\(null\)/);
  assert.match(screen, /stopSpeech\(\)/);
  assert.match(screen, /onClick=\{\(\) => selectView\(id\)\}/);
  assert.match(screen, /useEffect\([\s\S]*?\(\) => \(\) => \{/);
  assert.match(screen, /speechRun\.current \+= 1;[\s\S]*stopSpeech\(\)/);
  assert.match(screen, /\[lang\],[\s\S]*?\);/);
});

test("a quiet free world offers the recorded Mino discovery guidance aloud", () => {
  assert.match(screen, /FREE_WORLD_HELP_DELAY_MS = 11000/);
  assert.match(screen, /const \[activity, setActivity\] = useState\(0\)/);
  assert.match(screen, /setActivity\(\(a\) => a \+ 1\)/);
  assert.match(screen, /root\.addEventListener\("pointerdown", bump, \{ passive: true \}\)/);
  assert.match(screen, /root\.addEventListener\("keydown", bump\)/);
  assert.match(screen, /if \(view === "games" \|\| !settings\.autoHelp \|\| !settings\.audio\) return;/);
  assert.match(screen, /const timer = setTimeout\(\(\) => \{/);
  assert.match(screen, /if \(speakingId !== null\) return;/);
  assert.match(screen, /speak\([\s\S]{0,40}lang === "tr"[\s\S]*?Büyük resme dokun\. Sonra kaydır![\s\S]*?Tippe auf das große Bild\. Wische weiter!",/);
  assert.match(screen, /return \(\) => clearTimeout\(timer\)/);
  assert.match(screen, /\[view, lang, activity, speakingId, settings\.autoHelp, settings\.audio\]/);
  assert.match(screen, /ref=\{screenRef\}/);
});

test("the free-world Mino guidance phrase is a fixed narrator clip in both languages", () => {
  const de = "Tippe auf das große Bild. Wische weiter!";
  const tr = "Büyük resme dokun. Sonra kaydır!";
  assert.equal(fixedNaturalVoiceClip(de, "de"), helpVoiceClip(de, "de"));
  assert.equal(fixedNaturalVoiceClip(tr, "tr"), helpVoiceClip(tr, "tr"));
  assert.ok(fixedNaturalVoiceClip(de, "de"), "German free-world guidance must be a fixed clip");
  assert.ok(fixedNaturalVoiceClip(tr, "tr"), "Turkish free-world guidance must be a fixed clip");
});
