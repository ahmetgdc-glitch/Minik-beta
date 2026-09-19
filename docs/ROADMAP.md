# MINIK Roadmap

Stand **1.75.0 Beta 78 · 2026-09-18**. Beta 66 bleibt das technische Fundament. Priorität hat eine große, lebendige Kinderwelt mit wenig Text, großen Lernobjekten und direkter Interaktion.

## Immersive Kinderwelt

### P0/P1 nach der CI-Reparatur

- [x] Vollständige CI-Pipeline einschließlich Pages nach Testfehler wieder grün (`5412e0a`, Run `34787323737`)
- [x] PWA-Update-Wartephase im tatsächlich erzeugten Worker prüfen und reparieren
- [x] Netzwerkantworten trotz voller Runtime-Caches nutzbar halten
- [x] Audio-Unlock, Download, Decoder und Wiedergabe gegen Hänger/Abbrüche absichern
- [x] Dekodierten Audio-Speicher begrenzen und vorhandene Audioquellen versionieren
- [x] Spielmodule bedarfsgerecht laden: Einstieg 34 % kleiner, alle Chunks trotzdem im Offline-Kern
- [x] 21 spielspezifische CSS-Pakete bedarfsgerecht laden: Start-CSS 35 % kleiner und weiterhin offline
- [x] Türkisch als Erstsprache für neue Familien setzen und explizite Sprachwahl bewahren
- [x] Dynamische Spielansagen bei offenen Wortaufnahmen mit festen Aufgabenclips hörbar halten
- [x] Lokale Sprachclips parallel zum Decoder vorpuffern, damit der Ton schneller beginnt
- [x] Gespeicherte Sprachclips über Media-Teilanfragen offline abspielen und gestreamte Aufnahmen ohne Warteblockade vollständig nachspeichern
- [x] Wartende Lernklänge nach Navigation, Pause, Mino-Sprache, Hintergrundwechsel oder neuer Wiederholung zuverlässig abbrechen
- [x] Letztes Memory-Lernwort vor dem Rundenabschluss vollständig aussprechen lassen
- [x] Letztes Quellwort beim Zuordnen per Tap vor dem Rundenabschluss vollständig aussprechen lassen
- [x] Drei gemeinsame Schwierigkeitsstufen auf Kernmechaniken und Minos Hilfe in allen 23 Spielen anwenden
- [x] Spielstart erst nach abgeschlossenem Playback-Ready-Vorladen aller festen Session-Sprachclips (Preload-Gate; 100 % = Wiedergabe-Beweis)
- [x] Runde-0-Anweisung je Spiel statisch deklarieren und als Eröffnungsclip zuletzt warm machen (erster Satz auf iOS aus dem Puffer)
- [x] Wiederaufnahme und Wiederholung ausschließlich durch dasselbe Vorlade-Gate (kein direkter `GameSession`-Start neben dem Gate)
- [x] Freie Welt bietet nach längerer Inaktivität die feste Entdeckungs-Aufforderung hörbar an (Mino, ohne Auto-Wiederholung)
- [x] Session-Abschluss feiert mit genau einer fest aufgenommenen Mino-Zeile, die die letzte Lob-Zeile überspringt (kein Doppel-Lob)
- [ ] Feste Wortaufnahmen ergänzen: 376 DE- und 375 TR-Items haben noch keinen passenden festen Sprachplan (siehe `VOICE_COVERAGE.md`)
- [ ] Visuelle/akustische Abnahme auf iPhone und iPad; der Browserzugriff des aktuellen Work-Laufs ist blockiert

- [x] Bildschirmfüllende Startlandschaft mit großem Mino
- [x] Alle bestehenden Welten über fünf wischbare Themenreisen erreichbar
- [x] Große Entdeckerszenen und lokale Offline-Landschaften
- [x] Eigene lokale Landmarken-Kombination für jede der 25 Lernwelten
- [x] Sichtbare Wortwiedergabe und reagierende Umgebung auch in der freien Weltansicht
- [ ] Eigenständige Szenen und Entdeckungsmomente für weitere Themenwelten
  - [x] Entdecker-Kulissen reagieren bei 1, 3 und 6 Funden sichtbar auf den Lernfortschritt, ohne zusätzliche Touch-Ziele zu erzeugen
  - [x] Entdecker-Szene feiert mit einem leisen Fundpunkt-Puls, wenn das letzte Bild gefunden ist (`prefers-reduced-motion` schaltet ihn ab)
- [x] Sortieren und Zuordnen mit robustem Drag & Drop und Tippalternative
- [ ] Weitere Spiele mit großen Objekten, räumlicher Wirkung und präsenterem Mino
  - [x] Mino als sichtbarer Musiker auf der Rhythmusbühne, inklusive ruhiger Reduced-Motion-Variante
  - [x] Mino als Denkbegleiter beim unbekannten dritten Schritt der sozialen Sicherheitsfolge
  - [x] Bilderbuch-Erinnerungsphase als große Mino-Erinnerungswelt statt schlichter Standard-Antwortfläche
  - [x] Geräuschspiel als große Hörszene mit Mino und reagierender Hörumgebung
  - [x] Gegensätze-Spiel mit Mino als sichtbarem Denkpartner auf der zweiten Bühnenhälfte
  - [x] Tagesablauf mit Mino als sichtbarem Begleiter auf dem Routineweg
  - [x] Anfangsbuchstaben-Spiel mit sichtbarem Mino-/Hörhinweis für Wortwiederholung
  - [x] Zuordnen-Spiel mit sichtbarem Mino als Paarbegleiter in der Bühnenkopfzeile
  - [x] Malen stellt beim Undo nach „Löschen“ Bild und echten Strichstand gemeinsam wieder her
  - [x] Sortier-Spiel mit sichtbarem Mino als Werkstattmeister in der Kopfzeile
  - [x] Nachfahr-Spiel mit Mino als Ziel-Coach (Ziffer/Buchstabe) direkt neben dem Schreibbrett
  - [x] Malen mit sichtbarem Mino-Begleiter in der Vorlagenleiste
  - [x] Puzzle verzichtet bewusst auf eine eigene Figur, weil der Zeiger dort Mino ist
  - [x] „Sprich mit Mino“ mit Mino als schwebendem Begleiter an der Mikrofonfläche
- [x] Feste natürliche DE/TR-Stimme für die 332 vorhandenen Sprachbausteine lokal bereitstellen
- [ ] Feste natürliche MINIK-Stimme, kontrollierten Voice-4-Notfallpfad und reale iPhone-/iPad-Interaktion akustisch auf Geräten prüfen

## Fundament und Lernkern

- [x] React/Vite, DE/TR, Mino, Sterne und große visuelle Spielflächen
- [x] Hash-Routing und GitHub-Pages-kompatible relative Pfade
- [x] 25 Lernwelten und 503 zweisprachige Lernobjekte
- [x] 23 unterschiedliche Spielmechaniken
- [x] Bis zu 8 getrennte Kinderprofile mit Altersstufen 2–3, 4–5 und 6+
- [x] Altersgrenzen für Spiele und 2/4/6-Antwortlogik
- [x] Adaptive Schwierigkeit mit drei echten Mechanik-/Hilfestufen, Mastery pro Begriff/Sprache und Spaced Repetition
- [x] Mino-Hilfe nach Inaktivität/Fehlern und Demonstrationsmodus

## Spiele und Sprache

- [x] Hören & Tippen, Memory, Zuordnen, Sortieren, Zählen und Geräusche
- [x] Puzzle, Schatten, Was fehlt?, Muster und Rhythmus
- [x] Zahlen und Buchstaben nachfahren
- [x] Geschichten, Anfangsbuchstaben, Gegensätze und Tagesablauf
- [x] Unterschiede und soziale Sicherheits-Bildfolgen
- [x] Malen mit iOS-sicherer Pointer-/Undo-Logik
- [x] „Sprich mit Mino“ mit DE/TR-Spracherkennung und assistiertem Fallback
- [ ] Reale pädagogische/langfristige Prüfung der Aussprache- und Wiederholungslogik

## Belohnungen und Elternbereich

- [x] XP, Level, Sterne, Tagesreise und Schatzmeilensteine
- [x] Aquarium, Achievements und mehrere Mino-Outfits
- [x] Eltern-Rechengate plus optionale vierstellige PIN
- [x] Reload-/Tab-sichere Fehlversuchssperre und BFCache-Lock
- [x] Wochenstatistik, schwierige Begriffe und Sitzungen
- [x] Familien-Backup/Restore und Speicher-Recovery
- [x] Daten-Normalisierung gegen beschädigte/inkonsistente LocalStorage-Werte

## PWA, Safari und Release-Härtung

- [x] Offline-Service-Worker und installierbare PWA
- [x] Kontrollierter Service-Worker-Update-Flow
- [x] Safari `pagehide`/`pageshow`, BFCache und Hintergrund-Audio gehärtet
- [x] Unterbrochene Spiele pro Profil mit 6-Stunden-Checkpoint
- [x] Checkpoint-Schutz gegen Kontextwechsel, Manipulation und Race Conditions
- [x] Modal-Fokus, Scroll-Lock und Touch-Sicherheit
- [x] Crash-Recovery DE/TR
- [x] GitHub-Pages-Workflow mit Node 22, Tests, Preflight, Build und Verifikation
- [x] Öffentlichen Pages-Smoke-Test gegen kurzzeitig alte HTML-Antworten nach erfolgreichem Deployment härten
- [x] Fertiger Produktionsbuild wird im Workflow zusätzlich als `minik-production-build` archiviert
- [x] Release-Preflight verhindert veraltete Versionen/Dokumentation/Deployment-Metadaten

## Vor MINIK 1.0 noch zwingend

- [x] Produktionsbuild im tatsächlichen GitHub-Repository erfolgreich ausführen
- [ ] Veröffentlichte GitHub-Pages-URL aufrufen und Kernpfade durchspielen
- [ ] Physisches iPhone: Safari + Home-Screen-PWA + Hoch/Querformat + Hintergrund/Wiederaufnahme
- [ ] Physisches iPad: Touchflächen, Layout, Scrollen und längere Spielsitzung
- [ ] Einmal online laden, vollständig schließen und im Flugmodus erneut starten
- [ ] Feste natürliche MINIK-Stimme und Voice-4-Notfallpfad in DE/TR anhören; schnelle Wiederholungen und Sprecherkonstanz prüfen
- [ ] Mikrofonberechtigung/Spracherkennung auf der konkret verwendeten iOS-Version testen
- [ ] Begriffe, Geschichten und Sicherheitssequenzen durch DE/TR-sprachige pädagogische Fachperson gegenlesen

## Nach 1.0 optional

- [ ] Größere optionale Medienpakete mit eigenem Downloadmanagement
- [ ] Weitere freischaltbare Welten und längere Questketten
- [ ] Sicherer optionaler Cloud-TTS-Endpunkt ohne Secrets im Frontend
