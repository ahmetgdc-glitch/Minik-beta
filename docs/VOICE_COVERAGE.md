# Feste Wortaufnahmen — MINIK 1.75.0 Beta 78

Stand der Wortabdeckung: 2026-09-13. Laufzeit-Härtung aktualisiert: 2026-09-14. Geprüft wird für jedes vorhandene Lernobjekt, ob sein DE/TR-Label einen **exakten festen Wortclip** in der bestehenden Sprachbibliothek besitzt. Kurze Aufgaben-Fallbacks, zusammengesetzte Hilfesätze und Voice 4 werden nicht als Wortaufnahmen gezählt. Beta 76 hält bei einem fehlenden Wortclip eine kurze feste Aufgabenansage hörbar; die Zählung der exakten Wortaufnahmen bleibt deshalb unverändert.

| Lernwelt | Items | DE mit festem Plan | TR mit festem Plan |
| --- | ---: | ---: | ---: |
| Tiere | 30 | 30 | 30 |
| Farben | 12 | 12 | 12 |
| Zahlen | 20 | 20 | 20 |
| Essen | 30 | 12 | 12 |
| Fahrzeuge | 20 | 20 | 20 |
| Gefühle | 12 | 0 | 0 |
| Formen | 8 | 8 | 8 |
| Natur | 24 | 1 | 1 |
| Körper | 12 | 12 | 12 |
| Kleidung | 18 | 0 | 0 |
| Zuhause | 24 | 0 | 0 |
| Menschen | 10 | 0 | 0 |
| Bewegung | 16 | 0 | 0 |
| Berufe | 16 | 0 | 0 |
| Geräusche | 12 | 0 | 0 |
| Schule | 25 | 2 | 2 |
| Sport | 25 | 4 | 5 |
| Musik | 25 | 0 | 0 |
| Weltraum | 25 | 2 | 2 |
| Wetter | 25 | 0 | 0 |
| Mein Tag | 25 | 0 | 0 |
| Sicher unterwegs | 25 | 3 | 3 |
| Orte | 25 | 1 | 1 |
| Buchstaben | 25 | 0 | 0 |
| Spielzeug | 14 | 0 | 0 |
| **Gesamt** | **503** | **127** | **128** |

Damit fehlen feste Wortpläne für **376 DE-Items** und **375 TR-Items**. Mehrere Items können dieselbe Wortaufnahme verwenden; dies ist keine Zahl eindeutiger fehlender Audiodateien.

## Laufzeit-Härtung 2026-09-14

Dynamische Spielansagen sind nicht mehr nach dem Alles-oder-nichts-Prinzip aufgebaut. Wenn zum Beispiel das konkrete Lernwort noch keine feste Aufnahme hat, bleiben vorhandene feste Satzbausteine trotzdem hörbar. Ein unbekanntes türkisches Wort in `… nerede?` darf daher nicht mehr die vorhandene natürliche Ansage `Bu resmi bul.` mit stummschalten. Dasselbe gilt unter anderem für Wiederholung, Gegensätze, Anfangsbuchstaben, Sortieren und Tagesabläufe.

Für **Soziale Schritte** wird die vorhandene feste türkische Nächster-Schritt-Ansage verwendet, damit sowohl der Spieleinstieg als auch Mino-Hilfe hörbar bleiben, obwohl viele Alltagsbegriffe noch keine eigene Wortaufnahme haben. Beim **Puzzle** startet sofort die vorhandene feste visuelle Hilfe, statt zuerst auf einen nicht aufgenommenen vollständigen Satz beziehungsweise den Voice-4-Notfallpfad zu warten.

`tests/partial-natural-narration.test.mjs` schützt die Teilplan-Logik. `tests/turkish-game-voice-smoke.test.mjs` prüft repräsentativ alle aktuellen Spielfamilien darauf, dass ihre türkische Startansage oder ihr expliziter fester Fallback einen hörbaren festen MINIK-Sprachplan besitzt.

## Nächster P1-Schritt

Die originale feste DE/TR-Sprecherkonfiguration wiederherstellen oder passende freigegebene Aufnahmen bereitstellen und zuerst türkisch **Gefühle, Kleidung, Zuhause, Menschen, Mein Tag und Alltagsaktionen** ergänzen. Im Repository ist für die vorhandenen generierten festen Clips kein reproduzierbares Sprecherprofil/Generator-Setup dokumentiert. Ein anderer Sprecher oder die persönliche Nutzerstimme wäre keine gleichwertige automatische Ergänzung.

Fehlende feste Wortpläne nutzen bei dynamischen Spielaufgaben zuerst eine kurze feste Aufgabenansage und danach ausschließlich den kontrollierten Voice-4-Notfallpfad. Wenn beides nicht verfügbar ist, bleibt das Wort stumm. Ein vorhandener Lautsprecherknopf oder 332 zugeordnete Sprachbausteine beweist daher keine vollständige Vertonung aller 503 Lernobjekte.

## Vorhandene Quellen gesichert

334 vorhandene feste MP3-Dateien und 34 ältere WAV-Dateien liegen unter `public/assets/voice/`. Die ursprünglichen URL-Zuordnungen stehen unverändert in den Audio-Modulen. Die Build-Verifikation vergleicht diese Dateien byteweise mit `dist/assets/voice/`. Die 298 bereits zuvor versionierten persönlichen MP3-Dateien bleiben separat bestehen und werden im normalen Kinderfluss nicht automatisch verwendet.
