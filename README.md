# MINIK · Lernen mit Mino

**1.75.0 Beta 78 · 14. September 2026**

MINIK ist eine deutsch-türkische Lernwelt für kleine Kinder. Die App verbindet große visuelle Spielflächen mit Mino als Helfer, getrennten Kinderprofilen, adaptivem Lernen, Belohnungen und einem offline-fähigen PWA-Kern.

## Neue Entdeckerwelt

Die Startseite ist eine bildschirmfüllende Inselwelt mit großem Mino. Alle bestehenden Welten sind in fünf Themenreisen erreichbar. In den Entdeckerszenen steht ein großes Lernobjekt im Mittelpunkt: antippen, hören, weiterwischen. Pfeile und Tastatur bieten denselben Zugang. Profile, Empfehlungen und Lernfortschritt bleiben erhalten.

Jede der 25 Welten besitzt jetzt zusätzlich eine eigene Kombination aus drei thematischen Landmarken. Die lokalen Illustrationen liegen räumlich hinter dem Lernobjekt, blockieren keine Eingabe und machen etwa Zuhause, Musik, Berufe, Wetter oder Spielzeug als unterschiedliche Orte erkennbar. Beim Anhören reagieren Objekt und Umgebung gemeinsam, sodass Kinder jederzeit sehen, welches Wort Mino gerade spricht.

## Aktueller Umfang

- **25 Lernwelten** mit **503 DE/TR-Lernobjekten**.
- **23 Spieltypen**: unter anderem Hören & Tippen, Memory, Zuordnen, Sortieren, Zählen, Geräusche, Puzzle, Schatten, Was fehlt?, Muster, Zahlen/Buchstaben nachfahren, Rhythmus, Malen, Geschichten, Anfangsbuchstaben, Gegensätze, Tagesablauf, Unterschiede, soziale Sicherheit und „Sprich mit Mino“.
- Bis zu **8 getrennte Kinderprofile** mit Altersstufen 2–3, 4–5 und 6+.
- Altersgerechte 2/4/6-Antwortlogik, adaptive Schwierigkeit, Mastery pro Begriff/Sprache und Spaced Repetition.
- Sterne, XP, Tagesreise, Aquarium, Achievements und freischaltbare Mino-Outfits.
- Elternbereich mit Rechengate/optionaler 4-stelliger PIN, Wochenstatistik, schwierigen Begriffen, Sitzungen, Backup/Restore und Einstellungen.
- **Die feste natürliche MINIK-Stimme ist der primäre DE/TR-Erzähler.** Die 332 gebündelten Sprachclips werden beim Produktionsbuild lokalisiert und im Betrieb bedarfsgerecht offline gecacht. Apple Voice 4 bleibt ausschließlich ein kontrollierter Notfall-Fallback, wenn ein passender fester Clip nicht verfügbar oder nicht abspielbar ist. Die persönliche/gekloonte Nutzerstimme wird im normalen Kinderfluss nicht automatisch verwendet. Beliebige Browser-/Roboterstimmen werden nicht als Ersatz akzeptiert.
- **Türkisch ist die Sprache für neue Familien.** Bestehende ausdrückliche Sprachwahl bleibt erhalten. Wenn für ein neues Lernwort noch keine feste Wortaufnahme existiert, spielt Mino trotzdem eine passende feste Aufgabenansage; das Wort bleibt sichtbar und kann nachgereicht werden.
- **Drei echte Spielstufen:** Kolay/Leicht, Orta/Mittel und Zor/Schwer verändern Antwortmenge, Memory-Paare, Puzzlegröße, Zählraum, Musterlänge, Merkbelastung, Zeichengenauigkeit sowie Minos Hilfezeit und Fehlerschwellen. Die Altersgrenze schützt kleine Kinder weiterhin zentral.
- Safari-/iOS-Härtung für Audio, synchrone Interaktionssperren, Pausen, BFCache, App-Unterbrechungen, Session-Checkpoints und PWA-Updates.
- Robuste lokale Familien-Persistenz mit Recovery-Snapshot und atomar gespeicherter aktiver Profilauswahl.
- Offline-Service-Worker, installierbare PWA und GitHub-Pages-Deployment.

## Entwickeln und prüfen

Wartende Lernklänge im Geräusche- und Rhythmusspiel besitzen nun denselben Abbruchschutz wie einzelne Rhythmusnoten. Verlässt das Kind die Runde, beginnt Mino zu sprechen, wird die App verborgen oder folgt ein neuer Tap, kann ein alter Auftrag nach der iPhone-Audiofreigabe nicht mehr verspätet erklingen. Bei schneller Wiederholung gilt nur der jüngste Auftrag.

Der Audio-Hotfix vom 14. September schützt auch Rhythmusnoten, die noch auf die Audiofreigabe warten: Pause, neue Taps oder Mino-Sprache verwerfen den alten Auftrag. Abgebrochene Taps zählen nicht als Antwort. Die feste DE/TR-Stimme und die drei Hintergrundmusik-Stimmungen bleiben erhalten.

Beta 78 repariert Teilanfragen an gespeicherte Sprachaufnahmen: Der Audioplayer kann passende Tonabschnitte auch offline abrufen. Bei einer neuen gestreamten Aufnahme wird die vollständige Datei im Hintergrund gespeichert, ohne den Tonstart auf diesen Zusatzdownload warten zu lassen. Die feste türkische/deutsche Stimme und der kleine PWA-Startkern bleiben erhalten. Echte Tonstartzeiten auf iPhone/iPad müssen weiterhin am Gerät gemessen werden.

Beta 77 verbindet drei gemeinsame Schwierigkeitsprofile mit allen Spielrunden und Minos zentraler Hilfe. Beta 76 startet neue Familien auf Türkisch, puffert lokale Sprachclips schon parallel zum optionalen Decoder und hält die feste Aufgabenansage auch bei einem noch nicht vertonten Lernwort hörbar. Beta 75 lädt zusätzlich 21 spielspezifische Gestaltungsdateien erst mit dem passenden Spiel. Das Start-CSS sinkt von 252,56 KB auf 163,35 KB, ohne ungestalteten Zwischenframe oder Verlust der Offline-Fähigkeit. Beta 74 reduzierte bereits den initialen JavaScript-Build von 503,09 KB auf rund 334 KB; die zweisprachige Mino-Ansicht überbrückt langsames Laden. Die Audio-/PWA-Härtung bleibt erhalten.

Beta 76 startet neue Familien auf Türkisch und hält auch bei noch offenen Wortaufnahmen die Spielansage hörbar. Die vorhandenen 332 Sprachbausteine decken noch nicht alle 503 Lernobjekte ab. Die genaue [Sprachabdeckung](docs/VOICE_COVERAGE.md) trennt vorhandene Aufnahmen von den noch offenen Wortaufnahmen.

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

Die CI-Korrektur vom 13. September 2026 behebt acht veraltete beziehungsweise mehrdeutige Sprachtest-Prüfungen. Verhaltenstests prüfen zusätzlich den echten Audio-Abbruch bei Hintergrundwechsel und `pagehide`.

## GitHub Pages

Der empfohlene Weg ist das vollständige Projekt auf `main` oder `master` zu laden und unter **Settings → Pages → Source** auf **GitHub Actions** zu stellen. Der Workflow installiert Abhängigkeiten, testet, führt den Release-Preflight aus, baut `dist/`, verifiziert den Offline-Build und veröffentlicht ihn.

Zusätzlich wird der fertige `dist/`-Stand für 14 Tage als Actions-Artefakt **`minik-production-build`** gespeichert. So kann derselbe geprüfte Produktionsbuild auch separat heruntergeladen werden.

Die Weiterentwicklung erfolgt im bestehenden Repository `ahmetgdc-glitch/Minik-beta` auf `main`. Ein frischer lokaler Build ist in der aktuellen Arbeitsumgebung möglich; `dist/` wird aus dem Quellstand erzeugt und nicht eingecheckt.

## Noch nötige Geräteprüfung

Automatisierte Tests ersetzen keinen echten Gerätetest. Vor einer als „final“ bezeichneten Version müssen insbesondere iPhone/iPad-Touchgefühl, Home-Screen-PWA, Flugmodus, **die feste natürliche MINIK-Stimme in Deutsch und Türkisch**, schnelle Wiederholungen, Voice-4-Notfallfallback und Mikrofonberechtigungen auf realer Hardware geprüft werden. Die 332 festen Sprachclips werden für den Build lokalisiert; MINIK enthält keinen TTS-API-Schlüssel im Client.

Weitere Details: [Startanleitung](START_HIER.md) · [Roadmap](docs/ROADMAP.md) · [QA](docs/QA_CHECKLIST.md) · [Technik](docs/TECH_SPEC.md) · [Übergabe](docs/HANDOFF_SUMMARY.md) · [Änderungen](CHANGELOG.md).
