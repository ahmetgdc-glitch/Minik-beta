# Contentbibliothek 0.3.0

## Vorhandene Welten

| Welt | Türkisch | Lernobjekte |
| --- | --- | ---: |
| Tiere | Hayvanlar | 30 |
| Farben | Renkler | 12 |
| Zahlen | Sayılar | 20 |
| Essen | Yiyecekler | 30 |
| Fahrzeuge | Araçlar | 20 |
| Gefühle | Duygular | 12 |
| Formen | Şekiller | 8 |
| Natur | Doğa | 24 |
| Körper | Vücut | 12 |
| Kleidung | Kıyafetler | 18 |
| Zuhause | Ev | 24 |
| Menschen | İnsanlar | 10 |
| Bewegung | Hareketler | 16 |
| Berufe | Meslekler | 16 |
| Geräusche | Sesler | 12 |
| Spielzeug | Oyuncaklar | 14 |
| **Gesamt** | | **278** |

Jeder Begriff hat eine stabile ID, eigene DE/TR-Bezeichnung, Kategorie, Tags, Schwierigkeitsmetadaten und Darstellung. Zahlen gehen bis 20. Nachfahren verwendet aktuell die Zahlen 1–5.

## Assetmodell

- 250 ausgewählte, lokale Noto-SVGs einschließlich Welt-, Bedien- und Belohnungsbildern. Diese Zahl ist nicht die Zahl der Lernobjekte: Zahlen, Formen und Farben sind datenbasierte eigene Darstellungen; manche Welten verwenden passende Motive erneut.
- Eigener Mino als transparentes WebP; PNG-Appicons.
- Sechs 512-Pixel-WebP-Fotomotive: fröhlich, traurig, überrascht, wütend, müde und entspannt. Originale KI-generierte Erwachsene, keine realen Personen. Fotos sind optional im Elternbereich.
- Herkunft und Lizenzen unter `public/licenses/NOTICE.txt`, Fotometadaten in `content.js`.
- Zwölf Web-Audio-Geräusche. Keine aufgezeichneten Tierstimmen und keine Cloud-TTS-Dateien.

## Neue Inhalte ergänzen

1. Redaktionelle Zeile in `src/data/worlds/catalog.js` ergänzen: `key|Deutsch|Türkisch|noto-key|group`.
2. Vorhandene IDs nicht umbenennen, da sie Lernfortschritt referenzieren.
3. Für eine neue Welt `defs` in `content.js` und Spielverträglichkeit in `games/registry.js` ergänzen.
4. `npm run assets` ausführen und erzeugte Dateien übernehmen.
5. Bei Fotovarianten eigenen relativen Pfad und Herkunftsmetadaten ergänzen. Keine ungeklärten Fotos verwenden.
6. Prüfen, ob Bild und Bezeichnung für Vorschulkinder eindeutig sind. Mindestens sechs unterschiedliche Antwortmotive pro Welt erhalten; doppelte Bildmotive werden nicht gleichzeitig als verschiedene Antworten angeboten.
7. `npm test`, `npm run build`, `npm run verify:build` und die neue Welt visuell prüfen.

## Nächste Redaktion

Bezeichnungen und Motive mit einer DE/TR-sprachigen pädagogischen Fachperson prüfen. Einzelne Handlungen nutzen derzeit Symbole wie ein Mikrofon für Singen; eigene Handlungsszenen wären anschaulicher. Bild-Merkspiele und Memory zeigen dieselben Motive, keine schriftsprachlichen Aufgaben für Kleinkinder.

Ausbau auf 500+: eigenständige Weltpakete für Wetter, Küche, Bad, Familie, Buchstaben, Gegensätze, Spielplatz, Geschichten und soziale Abläufe. Weitere Fotos sollen konkrete Körperteile, Tätigkeiten und Alltagssituationen zeigen. Tiergeräusche benötigen eindeutige eigene/lizenzierte Aufnahmen.

Größere Pakete erst bei Auswahl laden. Aktuell ist der gesamte Kern klein genug für Vorab-Cache; ein mehrgigabytegroßer Pflichtdownload wäre hier unnötig.
