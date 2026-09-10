# MINIK Release-QA

Stand: **2026-09-10 · 1.65.0 Beta 66**. „Bestanden“ bedeutet automatisiert beziehungsweise in der verfügbaren Quell-/Node-Umgebung geprüft. Physische Gerätetests oder ein echtes GitHub-Deployment werden nicht vorgetäuscht.

## Automatisiert bestanden

- [x] **203/203 Node-Tests**: Inhalte, Lernlogik, Altersfreigaben, Profile, Speicher, Backup, Sessions, Checkpoints, PWA, Audio, Eltern-Gate, Dialoge und Release-Härtung.
- [x] `validate-content.mjs`: 25 Lernwelten, 503 DE/TR-Items, 23 Spieltypen und alle lokalen Assets vorhanden.
- [x] Antwortmengen bleiben eindeutig und altersgerecht; Altersstufe 2–3 erhält maximal zwei Optionen.
- [x] Direkte/alte Spiel-URLs können Altersfreigaben und Weltzuordnung nicht umgehen.
- [x] Unterbrochene Sessions werden pro Kind gespeichert, zeitlich begrenzt und gegen manipulierte Zähler/Zeitstempel gehärtet.
- [x] Safari-BFCache, echte `pagehide`-Exits, Hintergrund-Audio und manuelle Pause sind regressionsgetestet.
- [x] Mehrere Profile bleiben bei Session-, Alters-, Sprach- und Schwierigkeitswechsel getrennt.
- [x] Die aktive Profilauswahl liegt im selben autoritativen Familien-Snapshot und kann nach partiellen Legacy-Key-Fehlern nicht auf das falsche Kind zurückfallen.
- [x] Beschädigte Fortschritts-/Session-/History-Werte werden vor Elternstatistik und Lernarithmetik normalisiert.
- [x] Strukturell kaputte oder doppeldeutige Familien-Primary-Daten fallen auf den letzten sicheren Recovery-Stand zurück.
- [x] Eltern-PIN/Rechengate, Reload-Sperre, BFCache-Lock, Backup-Prüfung und destruktive Dialoge sind regressionsgetestet.
- [x] Crash-Recovery ist DE/TR und stoppt alte Sprache/Sounds.
- [x] Release-Preflight prüft Versionssynchronität, Doku, Inhaltsumfang, Manifest und GitHub-Pages-Workflow.

## Browser-/Quelllogik abgedeckt

- [x] Große Touchflächen und responsive Layoutregeln für Handy, Tablet und Desktop.
- [x] DE/TR-Oberfläche, 23 Spielmechaniken, Fortschritt, Belohnungen und Elternbereich.
- [x] PWA-Installationshinweis und kontrollierter Update-Flow.
- [x] GitHub-Pages-Workflow mit Node 22, Build/Test/Preflight/Offline-Verifikation und Pages-Deployment.
- [x] Produktions-`dist` wird im Workflow zusätzlich 14 Tage als `minik-production-build` archiviert.

## Noch real zu prüfen, bevor „final 1.0“ behauptet wird

- [ ] GitHub Actions im tatsächlichen Repository vollständig grün ausführen.
- [ ] Veröffentlichte Pages-URL auf iPhone, iPad und Desktop öffnen.
- [ ] Physisches iPhone/iPad: Touchgefühl, Hoch-/Querformat, PWA/Home-Screen und längere Sitzung.
- [ ] Deutsche und türkische installierte Systemstimmen anhören; Tempo, Tonhöhe und schnelle Wiederholungen prüfen.
- [ ] Mikrofonberechtigung und SpeechRecognition auf der konkret genutzten iOS-/Browser-Version prüfen.
- [ ] Einmal online laden, App schließen und im Flugmodus erneut starten.
- [ ] Backup exportieren, Browserdaten getrennt testen und Backup wiederherstellen.
- [ ] Pädagogische DE/TR-Inhaltsprüfung mit Fachperson.

## Lokale Buildgrenze dieser Arbeitsumgebung

Der Quellstand und die Node-Prüfungen laufen. Ein frischer lokaler Vite-Produktionsbuild kann in dieser Containerumgebung weiterhin nicht abgeschlossen werden, weil die vorhandenen `node_modules` leer/unvollständig sind und die Umgebung keinen normalen npm-Netzwerkzugriff besitzt. Deshalb wird kein alter `dist/`-Stand als aktueller Build ausgegeben. Der GitHub-Workflow führt auf einem sauberen Runner `npm ci` aus und ist der vorgesehene Produktionsbuild-Pfad.
