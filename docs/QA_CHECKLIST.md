# MINIK Release-QA

Stand: **2026-09-14 · 1.71.0 Beta 74**. „Bestanden“ bedeutet automatisiert beziehungsweise in der verfügbaren Quell-/Node-Umgebung geprüft. Die CI-Reparatur auf `5412e0a` wurde zusätzlich in GitHub Actions vollständig erfolgreich veröffentlicht (Run `34787323737`). Physische Gerätetests werden separat ausgewiesen.

## Automatisiert bestanden

- [x] **537/537 Node-Tests**: Inhalte, Lernlogik, Altersfreigaben, Profile, Speicher, Backup, Sessions, Checkpoints, PWA, persönliche Stimme, Eltern-Gate, Dialoge und Release-Härtung.
- [x] Die feste natürliche MINIK-Stimme ist primär; Voice 4 bleibt ein kontrollierter Notfall-Fallback. Beliebige Systemstimmen und automatische persönliche Aufnahmen bleiben ausgeschlossen.
- [x] 368 vorhandene Quelldateien (334 feste MP3-Clips und 34 ältere WAV-Clips) liegen nun im Repository; der Build übernimmt ihre Bytes unverändert. Die 298 bereits vorhandenen persönlichen Dateien bleiben separat erhalten.
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

### Beta 74: zusätzlich geprüft

- [x] Alle 23 Spielzuordnungen verwenden dynamische Importe; kein Spielmodul hängt mehr statisch am Einstieg.
- [x] Produktionsbuild besitzt mindestens 24 JavaScript-Dateien und der initiale Einstieg bleibt unter 400 KB (aktuell 331,60 KB statt 503,09 KB).
- [x] Jeder erzeugte JavaScript-Chunk liegt im Service-Worker-Kern und antwortet offline unter `/`, `/Minik-beta/` und `/Minik-2.0-/`.
- [x] Ladeansicht besitzt DE/TR-Statussemantik; reduzierte Bewegung schaltet die Mino-Animation aus.

### Beta 73: zusätzlich geprüft

- [x] Freie Welterkundung zeigt den Sprechzustand für die echte Promise-Lebensdauer der Wortwiedergabe.
- [x] Alte Wiedergabeabschlüsse können einen neueren Objektzustand nicht löschen.
- [x] Ansichts-, Sprach- und Routenwechsel stoppen alte Sprache und räumen die Hervorhebung auf.
- [x] Landmarken reagieren nur während aktiver Sprache; reduzierte Bewegung deaktiviert sämtliche neue Animationen.

### Beta 72: zusätzlich geprüft

- [x] Alle 25 Lernwelten besitzen exakt drei unterschiedliche Landmarken und jeweils eine einzigartige Kombination.
- [x] Jede referenzierte Landmarke ist als lokales SVG vorhanden; keine neue Netzwerk- oder Offline-Abhängigkeit.
- [x] Die Szenenschicht ist für Bedienhilfen verborgen, nimmt keine Pointer-Ereignisse an und liegt hinter Lernobjekt sowie Bedienelementen.
- [ ] Physische visuelle Abnahme der neuen Landmarken auf iPhone und iPad bleibt erforderlich.

### Beta 71: zusätzlich geprüft

- [x] Neun Verhaltenstests: verspäteter Unlock, fehlender Media-Start/-Abschluss, Abbruch beim Download, erneutes Laden desselben Clips, Decoder-Speicherbudget, gestörter WebAudio-Decoder/-Source und verspätete Rejection nach Wortwechsel.
- [x] Tatsächlich erzeugter Service Worker: Update wartet mit aktiver Vorgängerversion; Erstinstallation und explizite Aktivierung funktionieren; fremde App-Caches bleiben erhalten.
- [x] Volle Runtime-Caches dürfen heruntergeladene Sprache/HTML nicht verwerfen; geprüft für `/`, `/Minik-beta/` und `/Minik-2.0-/`.
- [x] Beide Audio-Buildschritte mit absichtlich blockiertem `fetch`: 334 feste und 34 ältere Clips direkt aus dem Repository, kein Download/Cache nötig.
- [ ] Neue visuelle Browser-Abnahme: Vorschauzugriff in diesem Work-Lauf blockiert (Verbindungs-/Laufzeitgrenze). Ältere Layout-Prüfungen weiter unten sind historische Ergebnisse.

- [x] Große Touchflächen und responsive Layoutregeln für Handy, Tablet und Desktop.
- [x] DE/TR-Oberfläche, 23 Spielmechaniken, Fortschritt, Belohnungen und Elternbereich.
- [x] PWA-Installationshinweis und kontrollierter Update-Flow.
- [x] GitHub-Pages-Workflow mit Node 22, Build/Test/Preflight/Offline-Verifikation und Pages-Deployment.
- [x] Produktions-`dist` wird im Workflow zusätzlich 14 Tage als `minik-production-build` archiviert.

## Noch real zu prüfen, bevor „final 1.0“ behauptet wird

- [x] GitHub Actions für den ersten Szenen-Commit `9a68b23` vollständig grün: Runs `34546134828` und `34546135569`.
- [ ] Veröffentlichte Pages-URL auf iPhone, iPad und Desktop öffnen.
- [ ] Physisches iPhone/iPad: Touchgefühl, Hoch-/Querformat, PWA/Home-Screen und längere Sitzung.
- [ ] Feste natürliche deutsche und türkische MINIK-Stimme sowie Voice-4-Notfallpfad auf realen Geräten anhören; Tempo, Aussprache, Schnittgrenzen und schnelle Wiederholungen prüfen.
- [ ] Mikrofonberechtigung und SpeechRecognition auf der konkret genutzten iOS-/Browser-Version prüfen.
- [ ] Einmal online laden, App schließen und im Flugmodus erneut starten.
- [ ] Backup exportieren, Browserdaten getrennt testen und Backup wiederherstellen.
- [ ] Pädagogische DE/TR-Inhaltsprüfung mit Fachperson.

## Aktueller lokaler Build und visuelle Prüfung

- [x] Frische Abhängigkeiten installiert; Vite-Produktionsbuild erfolgreich.
- [x] Startwelt und Tier-Entdeckerszene auf 393 × 852 geprüft.
- [x] Aktuelles Tier bleibt bei Wechsel auf 768 × 1024 erhalten.
- [x] Entdeckerspiel gestartet, Objekt entdeckt, Pause stoppt die Bedienung.
- [ ] Physische iPhone-/iPad-Prüfung: Browsergrößen sind kein Ersatz für reales Touch-/Audio-/PWA-Verhalten.

### Zweite Szenenrunde

- [x] Sortieren: Fisch per Pointer-Geste in Tierkorb, Erfolgsphase und kein verbleibendes Drag-Bild.
- [x] Zuordnen: ein Paar gezogen, zweites per Antippen; Erfolgsphase.
- [x] Bei 320 × 740 kein horizontaler Dokumentüberlauf; Bilder passen in ihre Touchflächen.
- [x] Sieben neue Tests für Mehrfinger, Abbruch, Wiederaufnahme, Tap-Schwelle und doppelte Paarwertung.
- [x] Memory auf 320 × 740: vier Karten, Bild-/Kartenüberlauf behoben und Aufdecken geprüft.
- [x] Zählen auf 320 × 740: ein Objekt misst 288 × 237 CSS-Pixel; Zahlen auf gemeinsamer Höhe, kein horizontaler Überlauf.
