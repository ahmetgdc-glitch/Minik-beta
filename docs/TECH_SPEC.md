# MINIK 1.71.0 Beta 74 — Technische Dokumentation

## Laufzeit und Module

React 19 und Vite 8, CSS, lokal gebündelte Nunito-Schrift und Lucide-Bedienicons. Alle direkten Abhängigkeiten sind angepinnt; `package-lock.json` gehört zum Projekt. Node ab 22.12, CI auf Node 22. `base: './'` und Hash-Routen unterstützen GitHub-Repository-Pfade.

`App` prüft jede Spiel-/Weltkombination gegen `gameCatalog`. Unbekannte Routen führen zu einer bedienbaren Rückkehrseite. Jedes Spiel ist eine eigene Komponente; `GameSession` koordiniert die gemeinsame Lernschleife und lädt die 22 konkreten Spielmodule für 23 Spieltypen erst beim Öffnen mit `React.lazy`. Der Produktions-Einstieg umfasst dadurch 331,60 KB statt zuvor 503,09 KB. `Suspense` zeigt bei Bedarf eine zugängliche DE/TR-Mino-Ladeansicht.

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

`worlds/scenes.js` enthält zusätzlich reine Präsentationsmetadaten für die Landmarken jeder Welt. `WorldScenery` rendert drei vorhandene lokale SVGs hinter dem Lernobjekt. Die Schicht ist `aria-hidden`, hat keine Pointer-Ereignisse und verändert weder Lerninhalte noch stabile IDs, Routing oder Fortschritt. Der aktive `speakingId` koppelt Objekt- und Szenenbewegung an die echte Promise-Lebensdauer der Audioausgabe; ein monotoner Laufzähler verhindert, dass ein verspätetes altes Ende neuere UI löscht.

`npm run assets` extrahiert die gewählten lokalen Noto-SVGs aus `@iconify-json/noto`, prüft Schlüssel und erzeugt `public/assets/content-manifest.json`. Beim normalen Build werden die bereits eingecheckten Assets validiert. Foto-Varianten haben `kind`, `creator`, `created`, `realPerson`, Herkunft und Beschreibung. Mino und die sechs Fotomotive sind neu generiert. Lizenztexte stehen in `public/licenses/`.

## Audio

`audio/voice.js` verwendet die **feste natürliche MINIK-Stimme als primären Erzähler**. Für bekannte DE/TR-Begriffe, Anweisungen und modular zusammensetzbare Sätze wird zuerst der gebündelte feste Sprachplan aufgelöst und abgespielt. Der Produktionsbuild lokalisiert die 332 bekannten Sprachbausteine nach `assets/voice/`; die Laufzeit lädt und cached sie bedarfsgerecht, statt die gesamte Bibliothek beim Service-Worker-Install vorzuladen.

Apple Voice 4 bleibt als kontrollierter Notfall-Fallback erhalten, wenn für einen Satz kein fester Plan verfügbar ist oder die feste Audiodatei nicht abspielbar ist. Dafür bleiben Safari-Bereitschaft, gecachte Voice-4-Auswahl, Sprachfilter, Start-/Abschluss-Watchdogs und kontrollierter Retry erhalten. Die persönliche/gekloonte Nutzerstimme wird im normalen Kinderfluss nicht automatisch verwendet. Beliebige Default-, Browser- oder Roboterstimmen werden nicht als Ersatz gewählt. Vor neuem Sprechen werden laufende Jobs sauber abgebrochen; Audiojobs bleiben referenziert, damit Pause, Navigation, BFCache und Hintergrundwechsel sicher aufräumen können.

`cloudTTS(text, lang, provider)` ist nur eine Erweiterungsschnittstelle für einen späteren sicheren Provider, der ein Audio-Blob liefert. Kein Endpoint, Secret, Cloud-Aufruf oder kostenpflichtiger Dienst ist vorkonfiguriert.

Seit Beta 71 sind die 334 vorhandenen festen MP3- und 34 älteren WAV-Quelldateien im Repository unter `public/assets/voice/` gespeichert. Die beiden Audio-Buildskripte verwenden diese Dateien zuerst; CI-Cache und externe Downloads bleiben nur für noch nicht gebündelte neue Quellen. `verify-build.mjs` verlangt alle erwarteten Quelldateien und prüft ihre bitgenaue Übernahme in `dist/`. Die separate persönliche Bibliothek wird im normalen Kinderfluss nicht automatisch verwendet.

Audio-Unlock und Download-/Decode-Arbeit sind an den aktuellen Sprachauftrag gebunden. Pause, Navigation und Hintergrundwechsel lösen auch noch wartende Aufträge mit `false` auf. Nach vier Sekunden ohne Start/Ladeabschluss greift ein begrenzter Fallback; ein laufender Clip besitzt zusätzlich einen längenabhängigen Abschluss-Watchdog. Dekodierte Puffer werden nach letzter Nutzung auf höchstens 32 Einträge beziehungsweise 16 MiB begrenzt. Rohdateien können unabhängig davon im Service-Worker-/HTTP-Cache bleiben.

332 vorhandene Sprachbausteine bedeuten keine vollständige Vertonung aller Lernobjekte: aktuell besitzen 127 von 503 DE-Items und 128 TR-Items einen festen Wortplan. Details und benötigte Ergänzungen stehen in `VOICE_COVERAGE.md`.

`audio/sounds.js` erzeugt zwölf Lern-Geräusche mit Web Audio sowie vier Musiknoten und Belohnungstöne. Hörbarkeit/Autoplay erfordern je nach Browser eine Benutzerinteraktion. Es sind synthetische Lernklänge, keine dokumentarischen Aufnahmen.

## Offline und Updates

Produktionsbuild registriert `sw.js` relativ zum Installationspfad. Der Worker lädt einen kleinen Startkern vorab: HTML, den Einstieg und alle kleinen Spiel-JavaScript-Chunks, CSS, WOFF2-Schriften, Mino, die drei Startlandschaften, Icons und Manifest. Dadurch bleiben sämtliche Spiele nach der Installation beim ersten Offline-Aufruf verfügbar, ohne den React-Einstieg aufzublähen. Weitere Illustrationen, Fotos und Sprache werden bei Nutzung gecacht. Cache-Name enthält Installationsscope und Inhaltsrevision; andere Apps oder andere MINIK-Installationspfade werden bei Updates nicht gelöscht.

Assets werden aus dem Cache beantwortet, unbekannte gleichursprüngliche Assets bei Bedarf nachgeladen. Navigation versucht zuerst das Netz, bei Verbindungsfehler oder temporärem HTTP-Fehler das gecachte `index.html`. Scheitert das Speichern einer erfolgreichen Netzwerkantwort, bleibt die Antwort nutzbar. Ein neuer Worker wartet bei aktiver Vorgängerversion; Aktivierung erfolgt über die vorhandene Update-Aktion oder nach dem Schließen der bisherigen Tabs. Erst dann werden alte Caches derselben Installation entfernt. Große zukünftige Medienpakete benötigen eigene Auswahl/Downloadverwaltung; sie sind noch nicht implementiert.

Alle 332 festen DE/TR-Sprachbausteine werden für den Produktionsbuild lokalisiert und sind die primäre MINIK-Erzählquelle. Sprachdateien werden im Service Worker bei Nutzung nachgeladen/gecached, nicht vollständig vorab installiert. Offline-/PWA-Gerätetests müssen deshalb die feste Erzählstimme nach erfolgtem Cache-Aufbau sowie Voice 4 als Notfall-Fallback prüfen.

## Qualitätsgates

`npm test`: automatisierte Content-, Progress-, Audio-, UX- und Regressionstests. `npm run build`: Contentprüfung, Vite und SW. `npm run verify:build`: echte Builddateien für Root-/Unterordner prüfen, Workerinstallation simulieren, Offline-HTML/Mino und jeden Spiel-Chunk lesen, den Einstieg auf unter 400 KB begrenzen, Cacheisolation prüfen, fremde Origins und POST ignorieren. Kein Ersatz für den finalen Safari-Gerätetest.

`tests/viewport.html` dient nur der lokalen Layoutprüfung des zuvor gebauten `dist/index.html` bei 320/393/768/1024 Pixeln. Sie gehört nicht zum veröffentlichten Build.
