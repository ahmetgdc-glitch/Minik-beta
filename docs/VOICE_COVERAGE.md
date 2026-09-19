# Feste Wortaufnahmen — MINIK 1.75.0 Beta 78

Stand der Wortabdeckung: 2026-09-13. Laufzeit-Härtung aktualisiert: 2026-09-16. Fester Lade-/Abspielnachweis aktualisiert: 2026-09-19. Geprüft wird für jedes vorhandene Lernobjekt, ob sein DE/TR-Label einen **exakten festen Wortclip** in der bestehenden Sprachbibliothek besitzt. Kurze Aufgaben-Fallbacks, zusammengesetzte Hilfesätze und Voice 4 werden nicht als Wortaufnahmen gezählt. Bei dynamischen Aufgaben darf ein fehlender Wortclip nicht mehr dazu führen, dass nur ein allgemeiner Satzbaustein ohne das eigentliche Lernziel abgespielt wird; die Zählung der exakten Wortaufnahmen bleibt dadurch unverändert.

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

## Laufzeit-Härtung 2026-09-16

Dynamische Spielansagen mit einem konkreten Lernziel folgen jetzt bewusst einem **Alles-oder-nichts-Prinzip**. Nur wenn alle semantischen Bestandteile – insbesondere das eigentliche Lernwort, die Zahl oder der Buchstabe – als feste Aufnahme verfügbar sind, wird ein zusammengesetzter fester Sprachplan verwendet. Fehlt auch nur ein solcher Bestandteil, liefert die feste Planung keinen Teilplan und `voice.js` gibt stattdessen den vollständigen Originaltext an den kontrollierten Voice-4-Fallback weiter.

Damit kann zum Beispiel `Oyuncak ayı nerede?` nicht mehr zu lediglich `Bu resmi bul.` verkürzt werden. Dasselbe Schutzprinzip gilt unter anderem für Wiederholung, Mino-Training, Anfangsbuchstaben, Nachsprechen, Sortieren, Gegensätze, Tagesabläufe, Story-Sätze sowie Zahlen- und Buchstaben-Nachfahren. Eine Ansage wie `C harfini çiz. Yeşil noktadan başla.` darf also niemals nur als allgemeines `İzi takip et. Yeşil noktadan başla.` übrig bleiben.

Rein allgemeine Spielanweisungen ohne konkretes verborgenes Lernziel bleiben weiterhin feste MINIK-Aufnahmen, wenn das pädagogisch korrekt ist. Dazu gehören zum Beispiel Memory, Puzzle, Schatten, Geräusche oder andere Aufgaben, bei denen das Aussprechen der Lösung die Antwort verraten würde. Die Sprachlogik unterscheidet damit zwischen einer absichtlich allgemeinen Spielanweisung und einer dynamischen Ansage, deren Zielbegriff erhalten bleiben muss.

`tests/partial-natural-narration.test.mjs` schützt die verlustfreie Alles-oder-nichts-Regel für dynamische Zielansagen. `tests/turkish-game-voice-smoke.test.mjs` deckt alle 23 registrierten Spielfamilien ab und trennt bewusst zwischen zielhaltigen Ansagen, die bei fehlender Aufnahme vollständig an Voice 4 gehen müssen, und allgemeinen festen Spielanweisungen. Zusätzliche Tests sichern exakte Wiederholungen in Hören, Anfangsbuchstaben und Nachsprechen.

## Lade-/Abspielnachweis 2026-09-19 · kein Start vor echtem Playback-Ready

Seit dem 19. September öffnet sich kein Spiel, bevor jeder **feste** Session-Sprachclip nachweislich abspielbereit ist: Der Clip liegt entweder dekodiert in Minos gemeinsamen WebAudio-Speicher oder wurde vom geteilten HTML-Audioplayer gepuffert (siehe `PreparedGameSession`/`preloadVoiceClip` in `voice.js`). Ein reiner HTTP-Warmabruf zählt nicht als Beweis; 100 % auf dem Vorbereitungsbildschirm ist damit eine echte Wiedergabe-Garantie. Nicht abspielbereite Clips halten das Kind hinter „Noch einmal versuchen“, statt halb aufgeladen zu starten.

Die statische Runde-0-Anweisung jedes Spiels wird explizit deklariert und liegt – wie die Wort-Labels – hinter demselben Gate. Das Gate ersetzt keine fehlenden Wortaufnahmen: Ein nicht aufgenommener vollständiger Satz bleibt in der dynamischen Ansage stumm beziehungsweise geht nur kontrolliert an Voice 4; MINIK ersetzt ihn niemals durch einen kürzeren oder anderen Kindersatz.

## Nächster P1-Schritt

Die originale feste DE/TR-Sprecherkonfiguration wiederherstellen oder passende freigegebene Aufnahmen bereitstellen und zuerst türkisch **Gefühle, Kleidung, Zuhause, Menschen, Mein Tag und Alltagsaktionen** ergänzen. Im Repository ist für die vorhandenen generierten festen Clips kein reproduzierbares Sprecherprofil/Generator-Setup dokumentiert. Ein anderer Sprecher oder die persönliche Nutzerstimme wäre keine gleichwertige automatische Ergänzung.

Fehlende feste Wortpläne nutzen bei dynamischen Spielaufgaben ausschließlich den vollständigen kontrollierten Voice-4-Notfallpfad, statt vorhandene allgemeine Satzteile alleine abzuspielen. Wenn Voice 4 auf dem Gerät nicht verfügbar ist, bleibt dieser nicht aufgenommene vollständige Text stumm; MINIK darf ihn aber niemals durch einen anderen oder verkürzten Kindersatz ersetzen. Ein vorhandener Lautsprecherknopf oder 332 zugeordnete Sprachbausteine beweist daher keine vollständige Vertonung aller 503 Lernobjekte.

## Vorhandene Quellen gesichert

334 vorhandene feste MP3-Dateien und 34 ältere WAV-Dateien liegen unter `public/assets/voice/`. Die ursprünglichen URL-Zuordnungen stehen unverändert in den Audio-Modulen. Die Build-Verifikation vergleicht diese Dateien byteweise mit `dist/assets/voice/`. Die 298 bereits zuvor versionierten persönlichen MP3-Dateien bleiben separat bestehen und werden im normalen Kinderfluss nicht automatisch verwendet.
