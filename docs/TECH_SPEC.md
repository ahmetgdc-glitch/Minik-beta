# MINIK 0.3.0 — Technische Dokumentation

## Laufzeit und Module

React 19 und Vite 8, CSS, lokal gebündelte Nunito-Schrift und Lucide-Bedienicons. Alle direkten Abhängigkeiten sind angepinnt; `package-lock.json` gehört zum Projekt. Node ab 22.12, CI auf Node 22. `base: './'` und Hash-Routen unterstützen GitHub-Repository-Pfade.

`App` prüft jede Spiel-/Weltkombination gegen `gameCatalog`. Unbekannte Routen führen zu einer bedienbaren Rückkehrseite. Jedes Spiel ist eine eigene Komponente; `GameSession` koordiniert die gemeinsame Lernschleife.

## Game API

Spiele erhalten `items, world, lang, settings, difficulty, round, hint, paused` sowie:

- `onReady({text, repeat, ids, help})` meldet Aufgabe und Wiederholungsfunktion.
- `onWrong(itemIds)` meldet einen Fehlversuch.
- `onSolve(itemIds)` löst die aktuelle Aufgabe; die Session sperrt sofort gegen Doppelvergabe.

Während Pause, Erfolg oder Demonstration ist der Spielbereich inert. Pointer- und Audiotimer werden aufgeräumt. Versteckte Tabs pausieren. Nach Erfolg folgt nach 1,3 Sekunden die nächste Aufgabe, nach Demonstration nach 3,8 Sekunden.

## Fortschritt

`minik_progress_v3` in localStorage: Einstellungen, Sterne/XP/Serie, Weltenstatistik, DE/TR-Begriffsbeherrschung, letzte 500 Ereignisdetails, 100 Sitzungen, 600 Deduplizierungs-IDs, Tagesmission, Inventar und ausgerüstete Schätze.

Eine richtige Aufgabe gibt einen Stern und zehn XP. Fehler geben keine Sterne und ziehen vorhandene Sterne nicht ab. „Sicher gelernt“ erfordert drei selbstständige Lösungen pro Sprache/Begriff. Geholfene oder nach Fehlern gelöste Aufgaben zählen als Übung.

Adaptive Schwierigkeit betrachtet die letzten zwölf Versuche pro Welt und Sprache. Unter acht Versuchen beginnt sie mit zwei Optionen; ab 75 % unabhängigen Treffern vier, ab zwölf Versuchen und 90 % sechs. Fehler werden auch berücksichtigt, wenn danach keine Lösung erfolgt. Die Schwierigkeit wird für die nächste Session gewählt, damit eine laufende Aufgabe nicht umspringt. Spiele übersetzen die Stufe in Antwortzahl, Paarzahl, Zahlenraum oder Sequenzlänge.

Jede Antwort wird sofort gespeichert. Sitzungszusammenfassungen werden beim Abschluss oder Verlassen innerhalb der App gespeichert. Nach hartem Schließen/Neuladen beginnt ein neues Spielbrett; bereits verdiente Sterne und Antworten bleiben erhalten, eine unvollständige Sitzungszusammenfassung ist dabei nicht garantiert. Kein geräteübergreifender Sync.

Die optionale Eltern-PIN ist eine lokale Kindersperre, keine Kontenauthentifizierung oder Verschlüsselung. Zurücksetzen erfordert eine ausdrückliche Bestätigung in der App.

## Inhalte und Assets

`catalog.js` enthält redaktionelle Zeilen `key|de|tr|asset|group`. `content.js` ergänzt Darstellungstyp, stabile IDs, Tags, Schwierigkeit, DE/TR und Varianten. Farben, Formen und Zahlen werden exakt aus ihrem Datentyp gezeichnet. Gleichartige Bildmotive werden in Antwortmengen dedupliziert.

`npm run assets` extrahiert die gewählten lokalen Noto-SVGs aus `@iconify-json/noto`, prüft Schlüssel und erzeugt `public/assets/content-manifest.json`. Beim normalen Build werden die bereits eingecheckten Assets validiert. Foto-Varianten haben `kind`, `creator`, `created`, `realPerson`, Herkunft und Beschreibung. Mino und die sechs Fotomotive sind neu generiert. Lizenztexte stehen in `public/licenses/`.

## Audio

`audio/voice.js` kapselt SpeechSynthesis, cached die Stimmenliste und reagiert auf `voiceschanged`. Präferenz: gespeicherte passende Voice-URI, sonst lokale Stimme mit Sprach-/Namensbewertung. Vor neuem Sprechen wird abgebrochen; aktuelle Utterance bleibt referenziert. Ohne passende Browserstimme bleibt die sichtbare Aufgabe bedienbar.

`cloudTTS(text, lang, provider)` ist nur eine Erweiterungsschnittstelle für einen späteren sicheren Provider, der ein Audio-Blob liefert. Kein Endpoint, Secret, Cloud-Aufruf oder kostenpflichtiger Dienst ist vorkonfiguriert.

`audio/sounds.js` erzeugt zwölf Lern-Geräusche mit Web Audio sowie vier Musiknoten und Belohnungstöne. Hörbarkeit/Autoplay erfordern je nach Browser eine Benutzerinteraktion. Es sind synthetische Lernklänge, keine dokumentarischen Aufnahmen.

## Offline und Updates

Produktionsbuild registriert `sw.js` relativ zum Installationspfad. Der Worker lädt den derzeit kompakten Kern vorab: HTML, JavaScript, CSS, WOFF2-Schriften, Illustrationen, Mino, Fotos, Icons und Manifest. Cache-Name enthält Installationsscope und Inhaltsrevision; andere Apps oder andere MINIK-Installationspfade werden bei Updates nicht gelöscht.

Assets werden aus dem Cache beantwortet, unbekannte gleichursprüngliche Assets bei Bedarf nachgeladen. Navigation versucht zuerst das Netz, bei Verbindungsfehler das gecachte `index.html`. Neue Worker verdrängen eine laufende Spielsession nicht automatisch. Für ein Update alle App-Tabs schließen und erneut öffnen. Große zukünftige Medienpakete benötigen eigene Auswahl/Downloadverwaltung; sie sind noch nicht implementiert.

Die Stimme ist ein Gerätedienst außerhalb dieses Caches. Offline-Sprechen ist nur mit entsprechend verfügbaren Systemstimmen möglich.

## Qualitätsgates

`npm test`: 21 Content-/Progress-Tests. `npm run build`: Contentprüfung, Vite und SW. `npm run verify:build`: echte Builddateien für Root-/Unterordner prüfen, Workerinstallation simulieren, Offline-HTML/Mino lesen, Cacheisolation prüfen, fremde Origins und POST ignorieren. Kein Ersatz für den finalen Safari-Gerätetest.

`tests/viewport.html` dient nur der lokalen Layoutprüfung des zuvor gebauten `dist/index.html` bei 320/393/768/1024 Pixeln. Sie gehört nicht zum veröffentlichten Build.
