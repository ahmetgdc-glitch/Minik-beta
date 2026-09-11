# MINIK — aktueller Entwicklungsstand

Stand: **11. September 2026 · 1.66.0 Beta 67**. Der langfristige Nutzerauftrag steht in `MASTER_PROMPT_FOR_WORK.md`.

## Aktueller Umfang

- 25 Lernwelten
- 503 zweisprachige DE/TR-Lernobjekte
- 23 Spieltypen
- bis zu 8 getrennte Kinderprofile, Altersgruppen 2–3 / 4–5 / 6+
- adaptive Schwierigkeit, Mastery pro Begriff/Sprache und Spaced Repetition
- Sterne, XP, Tagesreise, Aquarium, Achievements und Mino-Outfits
- Elternbereich mit Rechengate/PIN, Wochenanalyse, Backup/Restore und Einstellungen
- lokale/systembasierte DE/TR-Sprachausgabe, WebAudio und „Sprich mit Mino“
- installierbare PWA, Offline-Service-Worker, Recovery-Speicher und Session-Checkpoints

## Zuletzt als Final-Härtung umgesetzt

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

209 Node-Tests einschließlich aller 203 bisherigen Fälle bestanden. Release-Preflight und frischer Vite-Build erfolgreich. Offline-Verifikation prüft zusätzlich den tatsächlichen Repository-Pfad `/Minik-beta/` und alle drei Landschaften. Browser-QA erfolgt mit `tests/viewport.html` gegen den aktuellen Dev-Server, nicht gegen ein altes `dist`.

Beobachtet: Startwelt auf 393 × 852, Tierwelt auf 393 × 852 und 768 × 1024, Bildwechsel, Antippen/Vorlesen, Größenwechsel mit erhaltenem Bild, Spielstart und manueller Pause. Physische iOS-Geräte und akustische Qualität der Systemstimmen sind noch offen.

## Weiterarbeit

Als Nächstes Sortieren und Zuordnen mit sicherem Ziehen verbessern, Spielobjekte weiter vergrößern und Mino im Spiel stärker integrieren. Die visuelle Gesamtwirkung bleibt Priorität; technische Schutzmechanismen aus Beta 66 dürfen nicht verloren gehen. Weitere Welten sollen eigene Orte werden, statt nur ein anderes Symbol über demselben Hintergrund zu zeigen.
