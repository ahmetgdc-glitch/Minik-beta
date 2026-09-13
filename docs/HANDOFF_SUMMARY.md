# MINIK — aktueller Entwicklungsstand

Stand: **12. September 2026 · 1.67.0 Beta 70**. Der langfristige Nutzerauftrag steht in `MASTER_PROMPT_FOR_WORK.md`.

## Aktueller Umfang

- 25 Lernwelten
- 503 zweisprachige DE/TR-Lernobjekte
- 23 Spieltypen
- bis zu 8 getrennte Kinderprofile, Altersgruppen 2–3 / 4–5 / 6+
- adaptive Schwierigkeit, Mastery pro Begriff/Sprache und Spaced Repetition
- Sterne, XP, Tagesreise, Aquarium, Achievements und Mino-Outfits
- Elternbereich mit Rechengate/PIN, Wochenanalyse, Backup/Restore und Einstellungen
- feste natürliche DE/TR-MINIK-Stimme als primäre Erzählstimme; Apple Voice 4 bleibt kontrollierter Notfall-Fallback, beliebige Browser-/Default-/Roboterstimmen bleiben verboten und die persönliche/gekloonte Nutzerstimme wird im normalen Kinderfluss nicht automatisch verwendet
- installierbare PWA, Offline-Service-Worker, Recovery-Speicher und Session-Checkpoints

## Sprach- und Audio-Härtung

- Die gebündelte feste natürliche MINIK-Stimme ist der primäre Sprecher in Deutsch und Türkisch und wird für bekannte Begriffe, Anweisungen und zusammensetzbare Sätze zuerst versucht.
- Die 332 bekannten Sprachbausteine werden beim Produktionsbuild lokalisiert; sie werden zur Laufzeit bedarfsgerecht geladen und gecacht, nicht vollständig beim Service-Worker-Install vorab geladen.
- Apple Voice 4 bleibt als sekundärer Notfall-Fallback erreichbar, wenn kein fester Sprachplan vorhanden ist oder der feste Clip nicht abspielbar ist.
- Safari behält für diesen Fallback die längere Voice-Listen-Bereitschaft, gecachte Voice-4-Auswahl, Sprachfilter, Watchdogs und den kontrollierten Retry.
- **Kein Personal-/Roboter-Fallback:** Die persönliche/gekloonte Nutzerstimme wird im normalen Kinderfluss nicht automatisch verwendet; beliebige Browser-/Default-/Roboterstimmen bleiben ausgeschlossen.
- Ein fehlgeschlagener stiller iOS-Media-Unlock darf nicht als erfolgreich gelten; die Gesture-Listener bleiben bis zu einer echten Audiofreigabe aktiv.
- Nach Background/Resume werden WebAudio und Voice-Media-Unlock beide neu bewaffnet.
- Regressionstests sichern feste Erzählpriorität, Voice-4-Notfallpfad, Audio-Unlock, Background/Resume und Sprachgrenzen ab.

## Neue Entdeckerwelt — Beta 67

- Entwicklung direkt auf dem bestehenden `main` von `ahmetgdc-glitch/Minik-beta`, Ausgangspunkt Beta 66.
- Große Startlandschaft mit Mino, zwei direkten Einstiegen und fünf wischbaren Themenreisen. Alle 25 IDs und 503 Inhalte unverändert.
- Pro Entdeckerszene ein großes Objekt statt einer kleinen Wortkartenwand. Native Scroll-Snap-Navigation, Pfeile, Tastatur und Größenwechsel mit erhaltenem Bild.
- Entdeckerspiel nutzt dieselbe Szene mit zwei/vier/sechs Objekten gemäß Schwierigkeit. Doppelte Taps zählen nicht erneut; Pausen stoppen die Abschluss-Timer.
- Lokale Original-Landschaften: zusammen rund 382 KB WebP. Der Service Worker lädt sie mit dem Offline-Kern.
- `worlds.css` ist eine abgegrenzte Präsentationsschicht; Elternoberflächen und Datenmodelle bleiben auf der bestehenden Architektur.

## Prüfung und Stabilität

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
- `npm run preflight` prüft Release-Metadaten, Dokumentation, Inhaltsumfang, Manifest und Deploymentworkflow
- GitHub Actions archiviert den geprüften Produktionsbuild zusätzlich als `minik-production-build`

## Große Spielstufen und Ziehen

- Sortieren: große bewegliche Objekte, zwei große Körbe, sichtbares Ziel beim Ziehen; Antippen bleibt als Alternative.
- Zuordnen: dieselbe Pointer-Steuerung, Schutz gegen Mehrfinger-/Abbruch-/Pause-Ereignisse, jedes Paar zählt einmal. Auf kleiner Schwierigkeit zwei Paare.
- Memory: zwei Paare auf kleiner Schwierigkeit; bestehende Timer-/Doppeltap-Sperren bleiben erhalten.
- Spielflächen ohne äußeren Kartenrahmen, größere Antwortobjekte und präsenter Mino mit gewähltem Outfit.
- Browser geprüft: Sortieren per Drag & Drop, Zuordnen per Drag & Drop und Tippalternative, 320-Pixel-Breite ohne horizontalen Überlauf. Bildüberlauf im Zuordnen korrigiert.
- Sieben neue Verhaltenstests für Drag-Session und Paarzuordnung.

## Spielkiste — aktueller Stand

- Die große Empfehlung „Minos Tipp für heute“ nutzt jetzt den vorhandenen adaptiven Empfehlungsalgorithmus statt immer das erste alterszulässige Spiel zu zeigen.
- Die Empfehlung enthält direkt die passende Lernwelt und startet mit einem Tap bis in die Spielsession.
- Das empfohlene Spiel wird nicht erneut in der Favoritenliste dupliziert; alle übrigen altersgerechten Spiele bleiben erreichbar.

## Weiterarbeit

Als Nächstes Sprachführung und thematisch passende Szenen weiter verbessern. Die visuelle Gesamtwirkung bleibt Priorität; technische Schutzmechanismen aus Beta 66 und der feste natürliche Erzähler dürfen nicht verloren gehen. Die feste DE/TR-MINIK-Stimme bleibt primär, Voice 4 ist nur der kontrollierte Notfallpfad. Weitere Welten sollen eigene Orte werden, statt nur ein anderes Symbol über demselben Hintergrund zu zeigen.
