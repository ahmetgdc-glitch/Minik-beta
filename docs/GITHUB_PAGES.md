# GitHub Pages · MINIK 1.65.0 Beta 66

Der Workflow `.github/workflows/deploy.yml` baut auf `main`, `master` oder manuelle Anforderung mit Node 22. Gates: `npm ci`, `npm test`, `npm run preflight`, `npm run build`, `npm run verify:build`. Danach wird `dist/` als Pages-Artefakt hochgeladen und über das Environment `github-pages` veröffentlicht.

## Voraussetzungen

- GitHub Pages muss im Repository auf **GitHub Actions** als Quelle gestellt sein.
- Der Workflow benötigt Leserechte für Inhalte sowie `pages: write` und `id-token: write`.
- `vite.config.js` nutzt `base: "./"`, damit das Build auch unter Repository-Pfaden funktioniert.

## Lokale Prüfung

```bash
npm ci
npm test
npm run preflight
npm run build
npm run verify:build
```

Wenn lokal `vite: not found` erscheint, fehlen die installierten npm-Abhängigkeiten in der Umgebung. Das ist kein bestandener Produktionsbuild; der GitHub-Actions-Lauf bleibt die maßgebliche Build-Prüfung.
