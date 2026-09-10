# MINIK · Lernen mit Mino

**1.65.0 Beta 66 · 11. September 2026**

MINIK ist eine deutsch-türkische Lernwelt für kleine Kinder. Die App verbindet große visuelle Spielflächen mit Mino als Helfer, getrennten Kinderprofilen, adaptivem Lernen, Belohnungen und einem offline-fähigen PWA-Kern.

## Aktueller Umfang

- **25 Lernwelten** mit **503 DE/TR-Lernobjekten**.
- **23 Spieltypen**: unter anderem Hören & Tippen, Memory, Zuordnen, Sortieren, Zählen, Geräusche, Puzzle, Schatten, Was fehlt?, Muster, Zahlen/Buchstaben nachfahren, Rhythmus, Malen, Geschichten, Anfangsbuchstaben, Gegensätze, Tagesablauf, Unterschiede, soziale Sicherheit und „Sprich mit Mino“.
- Bis zu **8 getrennte Kinderprofile** mit Altersstufen 2–3, 4–5 und 6+.
- Altersgerechte 2/4/6-Antwortlogik, adaptive Schwierigkeit, Mastery pro Begriff/Sprache und Spaced Repetition.
- Sterne, XP, Tagesreise, Aquarium, Achievements und freischaltbare Mino-Outfits.
- Elternbereich mit Rechengate/optionaler 4-stelliger PIN, Wochenstatistik, schwierigen Begriffen, Sitzungen, Backup/Restore und Einstellungen.
- Kostenlose lokale/systembasierte DE/TR-Sprachausgabe; „Sprich mit Mino“ nutzt Browser-Spracherkennung nur, wenn das Gerät sie anbietet.
- Safari-/iOS-Härtung für Audio, synchrone Interaktionssperren, Pausen, BFCache, App-Unterbrechungen, Session-Checkpoints und PWA-Updates.
- Robuste lokale Familien-Persistenz mit Recovery-Snapshot und atomar gespeicherter aktiver Profilauswahl.
- Offline-Service-Worker, installierbare PWA und GitHub-Pages-Deployment.

## Entwickeln und prüfen

Voraussetzung: **Node.js ab 22.12**. GitHub Actions verwendet Node 22.

```bash
npm ci
npm run dev
```

Vor einer Veröffentlichung:

```bash
npm test
npm run preflight
npm run build
npm run verify:build
```

`npm run preflight` prüft Release-Versionen, Dokumentation, Inhaltsumfang, Manifest und GitHub-Pages-Workflow. `npm run assets` erzeugt die lokalen Illustrations-/Content-Artefakte erneut.

## GitHub Pages

Der empfohlene Weg ist das vollständige Projekt auf `main` oder `master` zu laden und unter **Settings → Pages → Source** auf **GitHub Actions** zu stellen. Der Workflow installiert Abhängigkeiten, testet, führt den Release-Preflight aus, baut `dist/`, verifiziert den Offline-Build und veröffentlicht ihn.

Zusätzlich wird der fertige `dist/`-Stand für 14 Tage als Actions-Artefakt **`minik-production-build`** gespeichert. So kann derselbe geprüfte Produktionsbuild auch separat heruntergeladen werden.

Die Quellcode-Release-ZIPs aus der aktuellen Entwicklungsumgebung enthalten bewusst **keinen veralteten `dist/`-Ordner**. Der lokale Paketordner dieser Umgebung ist unvollständig; ein echter frischer Produktionsbuild muss deshalb über eine saubere Node-Installation beziehungsweise GitHub Actions erzeugt werden.

## Grenzen vor 1.0

Automatisierte Tests ersetzen keinen echten Gerätetest. Vor einer als „final“ bezeichneten 1.0 müssen insbesondere iPhone/iPad-Touchgefühl, Home-Screen-PWA, Flugmodus, installierte deutsche/türkische Stimmen und Mikrofonberechtigungen auf realer Hardware geprüft werden. Die Sprachqualität hängt von den auf dem Gerät vorhandenen Systemstimmen ab; MINIK enthält keinen kostenpflichtigen TTS-Dienst und keinen API-Schlüssel im Client.

Weitere Details: [Startanleitung](START_HIER.md) · [Roadmap](docs/ROADMAP.md) · [QA](docs/QA_CHECKLIST.md) · [Technik](docs/TECH_SPEC.md) · [Übergabe](docs/HANDOFF_SUMMARY.md) · [Änderungen](CHANGELOG.md).
