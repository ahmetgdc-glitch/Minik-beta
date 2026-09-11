import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { worlds, allItems } from "../src/data/content.js";
import { gameCatalog } from "../src/games/registry.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const exists = (name) => fs.existsSync(path.join(root, name));
const problems = [];
const check = (condition, message) => {
  if (!condition) problems.push(message);
};

function walkFiles(dir, predicate) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, predicate));
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function resolveLocalImport(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.json`,
    `${base}.css`,
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

const pkg = JSON.parse(read("package.json"));
const lock = JSON.parse(read("package-lock.json"));
const meta = read("src/app/meta.js");
const manifest = JSON.parse(read("public/manifest.webmanifest"));
const workflow = read(".github/workflows/deploy.yml");
const docs = {
  README: read("README.md"),
  START_HIER: read("START_HIER.md"),
  ROADMAP: read("docs/ROADMAP.md"),
  QA: read("docs/QA_CHECKLIST.md"),
  HANDOFF: read("docs/HANDOFF_SUMMARY.md"),
};

const beta = pkg.version.match(/^(\d+)\.(\d+)\.0-beta\.(\d+)$/);
check(Boolean(beta), "package.json must use MINIK beta semver, e.g. 1.56.0-beta.57");
const label = beta ? `MINIK ${beta[1]}.${beta[2]} Beta ${beta[3]}` : "";
const docVersion = beta ? `${beta[1]}.${beta[2]}.0 Beta ${beta[3]}` : "";

check(lock.version === pkg.version, "package-lock top-level version differs from package.json");
check(lock.packages?.[""]?.version === pkg.version, "package-lock root package version differs from package.json");
for (const section of ["dependencies", "devDependencies"]) {
  const declared = pkg[section] || {};
  const locked = lock.packages?.[""]?.[section] || {};
  for (const [name, version] of Object.entries(declared)) {
    check(locked[name] === version, `package-lock ${section} spec differs for ${name}`);
    check(Boolean(lock.packages?.[`node_modules/${name}`]?.version), `package-lock is missing ${name}`);
  }
  for (const name of Object.keys(locked)) {
    check(Object.hasOwn(declared, name), `package-lock has stale root ${section} entry ${name}`);
  }
}
check(meta.includes(`APP_VERSION = "${pkg.version}"`), "src/app/meta.js APP_VERSION is stale");
check(meta.includes(`APP_VERSION_LABEL = "${label}"`), "src/app/meta.js APP_VERSION_LABEL is stale");

check(worlds.length === 25, `expected 25 worlds, found ${worlds.length}`);
check(allItems.length >= 500, `expected 500+ bilingual items, found ${allItems.length}`);
check(gameCatalog.length >= 23, `expected 23+ game types, found ${gameCatalog.length}`);

for (const [name, text] of Object.entries(docs)) {
  check(text.includes(docVersion), `${name} does not mention current release ${docVersion}`);
}
check(docs.README.includes("25 Lernwelten"), "README has stale world count");
check(docs.README.includes("503"), "README has stale learning-item count");
check(docs.README.includes("23 Spiel"), "README has stale game count");
check(!/12 Spiele|zwölf Spiele|16 Lernwelten/.test(docs.README), "README still advertises an old small release");

// Verify that every relative JS/JSX/CSS import resolves on a
// case-sensitive filesystem before running the production build.
// This catches a large class of production build failures before GitHub CI.
const sourceFiles = walkFiles(path.join(root, "src"), (file) => /\.(?:js|jsx|mjs)$/.test(file));
const importPattern = /(?:^|[;\n])\s*(?:import|export)\s+(?:[^"'\n]*?\s+from\s+)?["']([^"']+)["']/g;
const dynamicImportPattern = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
for (const file of sourceFiles) {
  const code = fs.readFileSync(file, "utf8");
  for (const pattern of [importPattern, dynamicImportPattern]) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(code))) {
      const specifier = match[1];
      if (!specifier?.startsWith(".")) continue;
      check(
        Boolean(resolveLocalImport(file, specifier)),
        `missing local import ${specifier} from ${path.relative(root, file)}`,
      );
    }
  }
}

// Parse the real JS/JSX source with TypeScript as a second independent syntax
// gate. This catches malformed JSX/braces/imports that simple regex checks
// cannot see. `--noResolve` deliberately keeps this a syntax pass, so it does
// not duplicate Vite's dependency graph work. Under npm/GitHub Actions the
// project-local TypeScript binary is placed on PATH automatically.
const syntaxFiles = [
  ...sourceFiles,
  ...walkFiles(path.join(root, "scripts"), (file) => /\.(?:js|mjs)$/.test(file)),
];
const tsc = spawnSync(
  process.platform === "win32" ? "tsc.cmd" : "tsc",
  [
    "--noEmit",
    "--allowJs",
    "--checkJs",
    "false",
    "--jsx",
    "preserve",
    "--target",
    "ES2022",
    "--module",
    "ESNext",
    "--moduleResolution",
    "Bundler",
    "--skipLibCheck",
    "--noResolve",
    "--pretty",
    "false",
    ...syntaxFiles.map((file) => path.relative(root, file)),
  ],
  { cwd: root, encoding: "utf8" },
);
const syntaxMessage = String(tsc.stderr || tsc.stdout || "")
  .trim()
  .split("\n")
  .slice(0, 3)
  .join(" | ");
check(
  tsc.status === 0,
  `TypeScript source syntax parse failed${syntaxMessage ? `: ${syntaxMessage}` : ""}`,
);

const gameSessionSource = read("src/games/GameSession.jsx");
const componentBlock = gameSessionSource.match(/const components = \{([\s\S]*?)\n\};/);
const componentIds = componentBlock
  ? [...componentBlock[1].matchAll(/^\s*([a-z][a-z0-9]*):/gm)].map((match) => match[1])
  : [];
for (const game of gameCatalog) {
  check(componentIds.includes(game.id), `game ${game.id} has no GameSession component mapping`);
}

check(manifest.start_url === "./" && manifest.scope === "./", "manifest must stay GitHub-Pages relative");
for (const icon of manifest.icons || []) {
  check(exists(path.join("public", String(icon.src || "").replace(/^\.\//, ""))), `manifest icon missing: ${icon.src}`);
}

for (const command of [
  "actions/setup-node@v4",
  'node-version: "22"',
  "npm ci --no-audit --no-fund",
  "npm test",
  "npm run preflight",
  "npm run build",
  "npm run verify:build",
  "actions/upload-pages-artifact@v4",
  "actions/deploy-pages@v4",
]) {
  check(workflow.includes(command), `deploy workflow missing: ${command}`);
}
check(workflow.includes("pages: write") && workflow.includes("id-token: write"), "deploy workflow lacks GitHub Pages permissions");

if (problems.length) {
  console.error("MINIK release preflight failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `MINIK preflight OK · ${pkg.version} · ${worlds.length} worlds · ${allItems.length} DE/TR items · ${gameCatalog.length} games`,
);
