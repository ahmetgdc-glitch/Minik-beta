# MINIK — aktueller Entwicklungsstand

Stand: **12. September 2026 · 1.67.0 Beta 69**. Der langfristige Nutzerauftrag steht in `MASTER_PROMPT_FOR_WORK.md`.

## Aktueller Umfang

- 25 Lernwelten
- 503 zweisprachige DE/TR-Lernobjekte
- 23 Spieltypen
- bis zu 8 getrennte Kinderprofile, Altersgruppen 2–3 / 4–5 / 6+
- adaptive Schwierigkeit, Mastery pro Begriff/Sprache und Spaced Repetition
- Sterne, XP, Tagesreise, Aquarium, Achievements und Mino-Outfits
- Elternbereich mit Rechengate/PIN, Wochenanalyse, Backup/Restore und Einstellungen
- persönliche lokale DE/TR-Sprachausgabe für 332 feste Begriffe/Anweisungen, WebAudio und „Sprich mit Mino“
- installierbare PWA, Offline-Service-Worker, Recovery-Speicher und Session-Checkpoints

## Zuletzt als Final-Härtung umgesetzt

- 298 zusätzliche persönliche DE/TR-Clips ergänzen die 34 bisherigen Kernaufnahmen; damit besitzen alle 332 festen Sprachbausteine eine exakte persönliche Aufnahme.
- Persönliche Clips stehen vor alten Aufnahmen und vor der iPhone-/iPad-Systemstimme; die Systemstimme bleibt nur für dynamische, nicht vorab bekannte Sätze.
- Alle neuen Clips liegen lokal und offline-fähig in der App. Build-Verifikation und Regressionstests prüfen Anzahl, Dateien und vollständige Ablösung der alten Sprachbibliothek.

- Session-/Checkpoint-Sicherheit für Safari `pagehide`, BFCache, manuelle Pause und Render-Race-Conditions
- Wiederaufnahme pro Profil mit Sprache/Alter/Schwierigkeitskontext und Schutz gegen manipulierte Rundenzähler
- Profil-/Backup-/Reset-Hygiene für alte Checkpoints
- Mehrprofil-Isolation bei parallel geöffneten Tabs
- PWA-Update-Race-Schutz und sichere kontrollierte Aktivierung
- Eltern-Gate gegen Reload/Tab-Umgehung und BFCache-Offenhalten
- Modal-Fokusfalle, Scroll-Lock und sichere eigene Bestätigungsdialoge
- Fortschrittsnormalisierung: inkonsistente History-/Session-/Mastery-/World-Daten werden vor Nutzung bereinigt
- JSON-gültige, aber strukturell kaputte Familien-Daten können den gültigen Recovery-Stand nicht mehr überstimmen
- aktive Profilauswahl wird zusammen mit der Familienhülle atomar gespeichert; der alte separate Active-Key ist nur noch Legacy-Fallback
- neuer `npm run preflight` prüft Release-Metadaten, Dokumentation, Inhaltsumfang, Manifest und Deploymentworkflow
- GitHub Actions archiviert den geprüften Produktionsbuild zusätzlich als `minik-production-build`

## Neue Entdeckerwelt — Beta 67

- Entwicklung direkt auf dem bestehenden `main` von `ahmetgdc-glitch/Minik-beta`, Ausgangspunkt Beta 66.
- Große Startlandschaft mit Mino, zwei direkten Einstiegen und fünf wischbaren Themenreisen. Alle 25 IDs und 503 Inhalte unverändert.
- Pro Entdeckerszene ein großes Objekt statt einer kleinen Wortkartenwand. Native Scroll-Snap-Navigation, Pfeile, Tastatur und Größenwechsel mit erhaltenem Bild.
- Entdeckerspiel nutzt dieselbe Szene mit zwei/vier/sechs Objekten gemäß Schwierigkeit. Doppelte Taps zählen nicht erneut; Pausen stoppen die Abschluss-Timer.
- Lokale Original-Landschaften: zusammen rund 382 KB WebP. Der Service Worker lädt sie mit dem Offline-Kern.
- `worlds.css` ist eine abgegrenzte Präsentationsschicht; Elternoberflächen und Datenmodelle bleiben auf der bestehenden Architektur.

## Prüfung

431 Node-Tests bestanden. Release-Preflight und frischer Vite-Build erfolgreich. Offline-Verifikation prüft zusätzlich den tatsächlichen Repository-Pfad `/Minik-beta/`, die Landschaften und alle persönlichen Sprachdateien. Browser-QA erfolgt mit `tests/viewport.html` gegen den aktuellen Dev-Server, nicht gegen ein altes `dist`.

Beobachtet: Startwelt auf 393 × 852, Tierwelt auf 393 × 852 und 768 × 1024, Bildwechsel, Antippen/Vorlesen, Größenwechsel mit erhaltenem Bild, Spielstart und manueller Pause. Physische iOS-Geräte und die akustische Qualität der persönlichen Stimme sind noch offen.

## Zweite Entwicklungsrunde: große Spielstufen und Ziehen

- Sortieren: große bewegliche Objekte, zwei große Körbe, sichtbares Ziel beim Ziehen; Antippen bleibt als Alternative.
- Zuordnen: dieselbe Pointer-Steuerung, Schutz gegen Mehrfinger-/Abbruch-/Pause-Ereignisse, jedes Paar zählt einmal. Auf kleiner Schwierigkeit zwei Paare.
- Memory: zwei Paare auf kleiner Schwierigkeit; bestehende Timer-/Doppeltap-Sperren bleiben erhalten.
- Spielflächen ohne äußeren Kartenrahmen, größere Antwortobjekte und präsenter Mino mit gewähltem Outfit.
- Browser geprüft: Sortieren per Drag & Drop, Zuordnen per Drag & Drop und Tippalternative, 320-Pixel-Breite ohne horizontalen Überlauf. Bildüberlauf im Zuordnen korrigiert.
- Sieben neue Verhaltenstests für Drag-Session und Paarzuordnung.

## Weiterarbeit

Als Nächstes die Spielkiste vereinfachen, Sprachführung und thematisch passende Szenen weiter verbessern. Die visuelle Gesamtwirkung bleibt Priorität; technische Schutzmechanismen aus Beta 66 dürfen nicht verloren gehen. Weitere Welten sollen eigene Orte werden, statt nur ein anderes Symbol über demselben Hintergrund zu zeigen.
