import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const home = await fs.readFile("src/app/Home.jsx", "utf8");
const app = await fs.readFile("src/App.jsx", "utf8");

test("a resumed session re-enters the gated /play route, never a direct GameSession", () => {
  // The "Weiter!" resume card must navigate into the exclusive gated path the
  // same way a fresh game tap does: /play/:gameId/:worldId → PreparedGameSession.
  assert.match(home, /const resume = useMemo/);
  assert.match(home, /peekCheckpoint\(window\.localStorage, progress\.activeProfileId\)/);
  assert.match(home, /onNavigate\(`\/play\/\$\{resume\.game\.id\}\/\$\{resume\.world\.id\}`\)/);
  // No resume shortcut may bypass the gate.
  assert.doesNotMatch(home, /\/resume\//);
  assert.doesNotMatch(home, /<GameSession/);
});

test("both play and replay routes mount exclusively the playback-ready wrapper", () => {
  assert.match(app, /const gameRoute = route === "play" \|\| route === "replay";/);
  assert.match(app, /<PreparedGameSession\n?/);
  assert.doesNotMatch(app, /<GameSession/);
  assert.match(app, /key=\{`\$\{progress\.activeProfileId\}-/);
  // A leftover checkpoint must not be able to start a half-loaded session on a
  // page refresh: a cold boot at /play must land home first.
  assert.match(app, /go\(path\) \{[\s\S]*?navigate\(path\);/);
});

test("GameSession is unreachable outside the gate wrapper", async () => {
  const gamesDir = await fs.readdir("src/games");
  const jsxFiles = gamesDir.filter((file) => file.endsWith(".jsx"));
  const offenders = [];
  for (const file of jsxFiles) {
    const source = await fs.readFile(`src/games/${file}`, "utf8");
    if (source.includes('from "./GameSession.jsx"') && file !== "PreparedGameSession.jsx") {
      offenders.push(file);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    "only PreparedGameSession may import GameSession; the playback gate must be the single door",
  );
});