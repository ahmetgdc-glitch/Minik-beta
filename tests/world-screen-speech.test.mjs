import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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
