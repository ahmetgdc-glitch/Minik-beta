# Feste Wortaufnahmen — MINIK 1.71.0 Beta 74

Stand: 2026-09-13. Geprüft wird für jedes vorhandene Lernobjekt, ob sein DE/TR-Label über `fixedNaturalVoicePlan` einen festen Sprachplan liefert. Anweisungen, zusammengesetzte Hilfesätze und Voice 4 werden nicht als zusätzliche Wortaufnahmen gezählt.

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

## Nächster P1-Schritt

Die originale feste DE/TR-Sprecherkonfiguration wiederherstellen oder passende freigegebene Aufnahmen bereitstellen und zuerst Gefühle, Kleidung, Zuhause, Menschen und Alltagsaktionen ergänzen. Im Repository ist für die vorhandenen generierten festen Clips kein reproduzierbares Sprecherprofil/Generator-Setup dokumentiert. Ein anderer Sprecher oder die persönliche Nutzerstimme wäre keine gleichwertige automatische Ergänzung.

Fehlende feste Pläne nutzen derzeit ausschließlich den kontrollierten Voice-4-Notfallpfad. Wenn auch dieser nicht verfügbar ist, bleibt das Wort stumm. Ein vorhandener Lautsprecherknopf oder 332 zugeordnete Sprachbausteine beweist daher keine vollständige Vertonung aller 503 Lernobjekte.

## Vorhandene Quellen gesichert

334 vorhandene feste MP3-Dateien und 34 ältere WAV-Dateien liegen unter `public/assets/voice/`. Die ursprünglichen URL-Zuordnungen stehen unverändert in den Audio-Modulen. Die Build-Verifikation vergleicht diese Dateien byteweise mit `dist/assets/voice/`. Die 298 bereits zuvor versionierten persönlichen MP3-Dateien bleiben separat bestehen und werden im normalen Kinderfluss nicht automatisch verwendet.
