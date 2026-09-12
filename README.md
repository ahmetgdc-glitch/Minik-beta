# MINIK · Lernen mit Mino

**1.67.0 Beta 70 · 12. September 2026**

MINIK ist eine deutsch-türkische Lernwelt für kleine Kinder. Die App verbindet große visuelle Spielflächen mit Mino als Helfer, getrennten Kinderprofilen, adaptivem Lernen, Belohnungen und einem offline-fähigen PWA-Kern.

## Neue Entdeckerwelt

Die Startseite ist eine bildschirmfüllende Inselwelt mit großem Mino. Alle bestehenden Welten sind in fünf Themenreisen erreichbar. In den Entdeckerszenen steht ein großes Lernobjekt im Mittelpunkt: antippen, hören, weiterwischen. Pfeile und Tastatur bieten denselben Zugang. Profile, Empfehlungen und Lernfortschritt bleiben erhalten.

## Aktueller Umfang

- **25 Lernwelten** mit **503 DE/TR-Lernobjekten**.
- **23 Spieltypen**: unter anderem Hören & Tippen, Memory, Zuordnen, Sortieren, Zählen, Geräusche, Puzzle, Schatten, Was fehlt?, Muster, Zahlen/Buchstaben nachfahren, Rhythmus, Malen, Geschichten, Anfangsbuchstaben, Gegensätze, Tagesablauf, Unterschiede, soziale Sicherheit und „Sprich mit Mino“.
- Bis zu **8 getrennte Kinderprofile** mit Altersstufen 2–3, 4–5 und 6+.
- Altersgerechte 2/4/6-Antwortlogik, adaptive Schwierigkeit, Mastery pro Begriff/Sprache und Spaced Repetition.
- Sterne, XP, Tagesreise, Aquarium, Achievements und freischaltbare Mino-Outfits.
- Elternbereich mit Rechengate/optionaler 4-stelliger PIN, Wochenstatistik, schwierigen Begriffen, Sitzungen, Backup/Restore und Einstellungen.
- Persönliche MINIK-Stimme für alle 332 fest aufgenommenen DE/TR-Begriffe und Anweisungen; die iPhone-/iPad-Systemstimme bleibt standardmäßig aus und kann nur im Elternbereich ausdrücklich als Ersatz erlaubt werden.
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

Die Weiterentwicklung erfolgt im bestehenden Repository `ahmetgdc-glitch/Minik-beta` auf `main`. Ein frischer lokaler Build ist in der aktuellen Arbeitsumgebung möglich; `dist/` wird aus dem Quellstand erzeugt und nicht eingecheckt.

## Noch nötige Geräteprüfung

Automatisierte Tests ersetzen keinen echten Gerätetest. Vor einer als „final“ bezeichneten Version müssen insbesondere iPhone/iPad-Touchgefühl, Home-Screen-PWA, Flugmodus, die persönliche deutsche/türkische Stimme und Mikrofonberechtigungen auf realer Hardware geprüft werden. Die persönliche Stimme liegt als lokale App-Audiodatei vor; MINIK überträgt beim Spielen keinen Text und enthält keinen TTS-API-Schlüssel im Client.

Weitere Details: [Startanleitung](START_HIER.md) · [Roadmap](docs/ROADMAP.md) · [QA](docs/QA_CHECKLIST.md) · [Technik](docs/TECH_SPEC.md) · [Übergabe](docs/HANDOFF_SUMMARY.md) · [Änderungen](CHANGELOG.md).
