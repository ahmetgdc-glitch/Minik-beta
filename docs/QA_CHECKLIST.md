# MINIK Release-QA

Stand: **2026-09-12 · 1.67.0 Beta 70**. „Bestanden“ bedeutet automatisiert beziehungsweise in der verfügbaren Quell-/Node-Umgebung geprüft. Physische Gerätetests oder ein echtes GitHub-Deployment werden nicht vorgetäuscht.

## Automatisiert bestanden

- [x] **433/433 Node-Tests**: Inhalte, Lernlogik, Altersfreigaben, Profile, Speicher, Backup, Sessions, Checkpoints, PWA, persönliche Stimme, Eltern-Gate, Dialoge und Release-Härtung.
- [x] Alle 332 festen DE/TR-Sprachbausteine besitzen eine persönliche Aufnahme; 298 neue lokale Clips werden im Produktionsbuild vollständig verifiziert.
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

- [x] GitHub Actions für den ersten Szenen-Commit `9a68b23` vollständig grün: Runs `34546134828` und `34546135569`.
- [ ] Veröffentlichte Pages-URL auf iPhone, iPad und Desktop öffnen.
- [ ] Physisches iPhone/iPad: Touchgefühl, Hoch-/Querformat, PWA/Home-Screen und längere Sitzung.
- [ ] Persönliche deutsche und türkische Stimme auf realen Geräten anhören; Tempo, Aussprache, Schnittgrenzen und schnelle Wiederholungen prüfen.
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
