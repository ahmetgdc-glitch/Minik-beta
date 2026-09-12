# MINIK Roadmap

Stand **1.67.0 Beta 68 · 2026-09-12**. Beta 66 bleibt das technische Fundament. Priorität hat eine große, lebendige Kinderwelt mit wenig Text, großen Lernobjekten und direkter Interaktion.

## Immersive Kinderwelt

- [x] Bildschirmfüllende Startlandschaft mit großem Mino
- [x] Alle bestehenden Welten über fünf wischbare Themenreisen erreichbar
- [x] Große Entdeckerszenen und lokale Offline-Landschaften
- [ ] Eigenständige Szenen und Entdeckungsmomente für weitere Themenwelten
- [x] Sortieren und Zuordnen mit robustem Drag & Drop und Tippalternative
- [ ] Weitere Spiele mit großen Objekten, räumlicher Wirkung und präsenterem Mino
- [x] Persönliche DE/TR-Stimme für alle 332 festen Begriffe und Anweisungen lokal/offline bereitstellen
- [ ] Persönliche Stimme und reale iPhone-/iPad-Interaktion akustisch auf Geräten prüfen

## Fundament und Lernkern

- [x] React/Vite, DE/TR, Mino, Sterne und große visuelle Spielflächen
- [x] Hash-Routing und GitHub-Pages-kompatible relative Pfade
- [x] 25 Lernwelten und 503 zweisprachige Lernobjekte
- [x] 23 unterschiedliche Spielmechaniken
- [x] Bis zu 8 getrennte Kinderprofile mit Altersstufen 2–3, 4–5 und 6+
- [x] Altersgrenzen für Spiele und 2/4/6-Antwortlogik
- [x] Adaptive Schwierigkeit, Mastery pro Begriff/Sprache und Spaced Repetition
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
- [x] Fertiger Produktionsbuild wird im Workflow zusätzlich als `minik-production-build` archiviert
- [x] Release-Preflight verhindert veraltete Versionen/Dokumentation/Deployment-Metadaten

## Vor MINIK 1.0 noch zwingend

- [ ] Produktionsbuild im tatsächlichen GitHub-Repository erfolgreich ausführen
- [ ] Veröffentlichte GitHub-Pages-URL aufrufen und Kernpfade durchspielen
- [ ] Physisches iPhone: Safari + Home-Screen-PWA + Hoch/Querformat + Hintergrund/Wiederaufnahme
- [ ] Physisches iPad: Touchflächen, Layout, Scrollen und längere Spielsitzung
- [ ] Einmal online laden, vollständig schließen und im Flugmodus erneut starten
- [ ] Persönliche deutsche und türkische Stimme anhören und schnelle Wiederholungen prüfen
- [ ] Mikrofonberechtigung/Spracherkennung auf der konkret verwendeten iOS-Version testen
- [ ] Begriffe, Geschichten und Sicherheitssequenzen durch DE/TR-sprachige pädagogische Fachperson gegenlesen

## Nach 1.0 optional

- [ ] Größere optionale Medienpakete mit eigenem Downloadmanagement
- [ ] Weitere freischaltbare Welten und längere Questketten
- [ ] Sicherer optionaler Cloud-TTS-Endpunkt ohne Secrets im Frontend
