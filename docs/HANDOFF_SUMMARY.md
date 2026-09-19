# MINIK — aktueller Entwicklungsstand

Stand: **19. September 2026 · 1.75.0 Beta 78**. Der langfristige Nutzerauftrag steht in `MASTER_PROMPT_FOR_WORK.md`.

## Aktueller Umfang

- 25 Lernwelten
- 503 zweisprachige DE/TR-Lernobjekte
- 23 Spieltypen
- bis zu 8 getrennte Kinderprofile, Altersgruppen 2–3 / 4–5 / 6+
- adaptive Schwierigkeit, Mastery pro Begriff/Sprache und Spaced Repetition
- Sterne, XP, Tagesreise, Aquarium, Achievements und Mino-Outfits
- Elternbereich mit Rechengate/PIN, Wochenanalyse, Backup/Restore und Einstellungen
- feste natürliche DE/TR-MINIK-Stimme als primäre Erzählstimme; Apple Voice 4 bleibt kontrollierter Notfall-Fallback, beliebige Browser-/Default-/Roboterstimmen bleiben verboten und die persönliche/gekloonte Nutzerstimme wird im normalen Kinderfluss nicht automatisch verwendet
- Neue Familien starten auf Türkisch; eine vorhandene ausdrückliche Sprachwahl wird bei der Normalisierung beibehalten
- installierbare PWA, Offline-Service-Worker, Recovery-Speicher und Session-Checkpoints

## Sprach- und Audio-Härtung

- Die gebündelte feste natürliche MINIK-Stimme ist der primäre Sprecher in Deutsch und Türkisch und wird für bekannte Begriffe, Anweisungen und zusammensetzbare Sätze zuerst versucht.
- Die 332 bekannten Sprachbausteine werden beim Produktionsbuild lokalisiert; sie werden zur Laufzeit bedarfsgerecht geladen und gecacht, nicht vollständig beim Service-Worker-Install vorab geladen.
- Der lokale HTML-Audioplayer beginnt bei jedem festen Clip parallel zum optionalen WebAudio-Decoder mit dem Puffern. So wartet ein Kind nicht erst auf einen vollständigen Decode, bevor dieselbe Aufnahme starten darf.
- Fehlt bei einem dynamischen Lernwort noch die feste Wortaufnahme, bleibt die feste Aufgabenansage hörbar. Das gilt auch für direkt angetippte Wörter in Entdecken, Memory, Geschichte, Muster und Wiederholung; das sichtbare Wort wird nicht durch eine System- oder Roboterstimme ersetzt.
- Apple Voice 4 bleibt als sekundärer Notfall-Fallback erreichbar, wenn kein fester Sprachplan vorhanden ist oder der feste Clip nicht abspielbar ist.
- Safari behält für diesen Fallback die längere Voice-Listen-Bereitschaft, gecachte Voice-4-Auswahl, Sprachfilter, Watchdogs und den kontrollierten Retry.
- **Kein Personal-/Roboter-Fallback:** Die persönliche/gekloonte Nutzerstimme wird im normalen Kinderfluss nicht automatisch verwendet; beliebige Browser-/Default-/Roboterstimmen bleiben ausgeschlossen.
- Ein fehlgeschlagener stiller iOS-Media-Unlock darf nicht als erfolgreich gelten; die Gesture-Listener bleiben bis zu einer echten Audiofreigabe aktiv.
- Nach Background/Resume werden WebAudio und Voice-Media-Unlock beide neu bewaffnet.
- Regressionstests sichern feste Erzählpriorität, Voice-4-Notfallpfad, Audio-Unlock, Background/Resume und Sprachgrenzen ab.
- **Playback-Ready-Gate:** Ein Spiel startet erst, wenn jeder feste Session-Sprachclip dekodiert in Minos WebAudio-Speicher liegt oder vom geteilten HTMLAudioplayer gepuffert ist. Reine HTTP-Warmer ohne Decode/Media-Puffer zählen nicht; 100 % auf dem Vorbereitungsbildschirm ist ein Wiedergabe-Beweis. Nicht abspielbereite Clips halten das Kind sicher hinter „Noch einmal versuchen“.
- Die Runde-0-Anweisung jedes Spiels ist statisch deklariert (`introText`) und liegt wie die Wort-Labels hinter demselben Gate; sie wird zuletzt warm gemacht, damit der erste gesprochene Satz auf iOS die bereits gepufferte Aufnahme vorfindet. Wiederaufnahme („Weiter!“) und Wiederholung (`/replay/…`) laufen nachweislich nur durch `PreparedGameSession`.
- **Stummer Rhythmus bleibt spielbar:** Bei `settings.audio === false` wird die Melodie rein visuell vorgespielt und jeder Tap gewertet, nur ohne Ton; ein Master-Ton-Aus darf nie zu einer unlösbaren Runde führen. Status: „Ton aus · visuell spielen“ / „Ses kapalı · görsel oyna“.

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

### Work-Lauf 19. September 2026 · Stummer Rhythmus, Mal-Race und Pages-Abnahme

- **Stummer Rhythmus (`b41cfcf`, 738/738 Tests):** Die frühere Härtung aus `1e927f9` machte bei `settings.audio === false` sowohl das Vorspielen als auch die Bewertung eines Taps unmöglich – die Runde war damit eine Sackgasse. `repeat()` schützt jetzt nur noch echtes Laden/Vorspielen mit `if (!audioDisabled)`, die visuelle Vorschau leuchtet die Tasten immer vor, und `tap()` nimmt Eingaben immer an (`const sounded = audioDisabled ? false : await playNote(i)`) mit zusätzlichem Leuchtblitz über `flashRun`. `tests/rhythm-audio-gate.test.mjs` wurde als neuer Vertrag neu geschrieben, `tests/rhythm-playground.test.mjs` an den asynchronen Recheck angepasst.
- **Malen ohne Nachzieh-Race (`a8001c9`, 739/739 Tests):** Ein verworfener Mikro-Strich (unter der Mindestlänge) konnte seinen asynchronen Undo-Schnappschuss nach einem neueren Strich zurückmalen. Ein `restoreRun`-`useRef`-Zähler wird in `start()` und im blockierten `end()`-Zweig erhöht; der Restore merkt sich `const run = ++restoreRun.current` und bricht ab, wenn `run !== restoreRun.current`. Neuer Regressionstest in `tests/draw-lifecycle-safety.test.mjs`.
- **Memory-Audit:** `MemoryGame`, `shared`, `GameSession`, `inputGuard` und `random` geprüft – die vorhandene Härtung (completingGame-Sprechgate, `lockedRef`, `wrongRevealMs`, Hilfe-/Tipp-Pfade, `shouldAcceptWrongTap`) deckt die bekannten Risiken ab; keine Änderung nötig. Auch die Szenenprüfung zeigte, dass alle 25 Welten lokale Landmarken-Kombinationen und eigene Entdeckungsmomente besitzen.
- **Pages-Abnahme:** Der aktive Live-Build ist `assets/index-Bsr3IsDU.js` (346,97 kB) und `assets/index-CaKVZTPo.css` – identisch zum lokalen HEAD-Build; `manifest.webmanifest`, `sw.js`, Icons, Szenen- und Stimm-Assets liefern 200. Die kurzzeitige Rückkehr eines älteren Builds (`index-CNoLfv_S.js`) war Pages-Propagation zwischen den Deployments `7a79c93` → `b41cfcf` → `a8001c9` und ist abgeschlossen. Der Pages-API-Endpunkt `repos/.../pages` ist für dieses Setup nicht verfügbar (404).
- **Stand:** 739/739 Tests, Produktionsbuild und Preflight lokal grün; `main` mit `origin/main` identisch.

### Work-Lauf 19. September 2026 · Preload-Gate, hörbare Sprachführung und Abschlussfeier

- **Preload-Gate (`12010b9`, 727/727 Tests):** Die frühere Sprachmodule-Flake-Quelle ist gefunden – `withGlobals` in den Tests war nicht `async`, daher räumten die `finally`-Blöcke die globalen Fakes auf, bevor die asynchronen Microtasks (Decode/Cache/Media-Prime) liefen, und `localizedGameClip` lieferte `""`. Die Harness wartet jetzt mit `await run()`. `src/audio/voice.js` bekommt `preloadVoiceClip`, `preloadedVoiceReady`, `decodePreloadedClip`, `primeMediaClip` und den basis-Toleranten `localizedGameClip`-Lookup. `PreparedGameSession` lädt `sessionTexts` (Session-Phrasen, Intro, Labels, `naturalPhraseTexts`, `helpVoiceTexts`) mit Bild-/Bundle-Load parallel, wirft „session speech is not playback-ready“, wenn nicht jeder Clip `preloadedVoiceReady` ist, und hält das Kind sonst sicher hinter „Noch einmal versuchen“. Neu: `tests/game-audio-preload.test.mjs`.
- **Sprachführung in der freien Welt (`0d4410a`):** Nach 11 Sekunden ruhiger Entdeckerwelt spricht Mino die feste Entdeckungs-Aufforderung vor („Tippe auf das große Bild. Wische weiter!“ / „Büyük resme dokun. Sonra kaydır!“), einmalig und ohne Auto-Wiederholung. Jede echte Aktivität (Tap, Tastatur, Entdecken, Ansichtswechsel) setzt die Wartezeit zurück; `document.hidden` und `settings.autoHelp && settings.audio` werden geprüft. `tests/world-screen-speech.test.mjs` ergänzt den hörbaren Hinweis und die Clip-Auflösung.
- **Gate-Härtung (`cebb129`, 735/735 Tests):** `introText` in `PreparedGameSession` entspricht jetzt exakt den statisch gesprochenen Runde-0-Anweisungen aller Spiele – inklusive explore, different, pattern, story, initialletter und draw; die veraltete Puzzle-Zeile („Tippe zwei Teile an…“) und nicht tatsächlich gesprochene Einträge (speak, trace, lettertrace) sind entfernt. Kein Spiel darf mehr eine ungesprochene Phrase hinter dem Gate vorladen. Der Eröffnungsclip wird nach dem vollen Vorladen als Letztes warm gemacht (`preloadVoiceClip` re-warmt den geteilten Media-Player), sodass der erste Satz auf iOS die gepufferte Aufnahme vorfindet. Neue Regressionstests: Resume-/Replay-Route läuft ausschließlich durch `PreparedGameSession`, `GameSession` bleibt nur dort importierbar, und `tests/round-zero-gate.test.mjs` verlangt zweisprachig auflösbare Runde-0-Clips.
- **Mino-Abschlussfeier (`219fed2`, `0e360f4`, 738/738 Tests):** Der fertige Session-Bildschirm feiert mit genau einer fest aufgenommenen Mino-Zeile (`completionCelebration`), die die zuletzt gespielte Lob-Zeile überspringt, sodass kein Satz doppelt erklingt. Die frühere feste „Super gemacht!“/„Harika!“-`finishText`-Ansage wird zu dieser einen, konsolidierten Feier zusammengeführt. `game-finish-voice.test.mjs` (angepasst) und `session-finish-celebration.test.mjs` decken Route, Einmaligkeit, Reihenfolge nach `stopSpeech()` und die feste Aufnahme in beiden Sprachen ab.
- **Stand bei Redaktionsschluss:** 738/738 Tests, Produktionsbuild und Preflight lokal grün; `main` ist mit `origin/main` identisch (`0e360f4`).
- Weiterhin extern offen: physische iPhone-/iPad-Abnahme von Tonstart, Touch und Background/Resume sowie die noch fehlenden festen Wortaufnahmen mit dem ursprünglichen Sprecherprofil. Diese externen Punkte dürfen die weitere softwareseitige Arbeit nicht blockieren.

### Work-Lauf 18./19. September 2026 · Windows-Verifikation, Audio-Gate und Mino-Paarbegleiter

- Ausgangspunkt war `ba2ed5e` (Beta 78) plus dem lokalen Commit `c0083bf`; beides per Rebase als `4403fdf` auf `main` gebracht.
- Die Windows-lokale Verifikation schlug zwei Mal fehl, obwohl CI grün war:
  - `scripts/release-preflight.mjs` rief `tsc.cmd` per `spawnSync` auf; außerhalb einer Shell liefert `spawnSync('tsc.cmd')` auf Windows `EINVAL` (status null), daher schlug der Preflight lokal mit „TypeScript source syntax parse failed“ fehl. Der Preflight startet das Projekt-`tsc` jetzt direkt über den Node-Prozess (`process.execPath` mit `node_modules/typescript/bin/tsc`). Commit `129d84b`.
  - `scripts/build-sw.mjs` normalisierte Walk-Pfade nicht: `path.relative` liefert auf Windows Backslash-Pfade, die der `CORE`-Filter `/assets\/.*\.(js|css|woff2)$/` nicht traf. Der erzeugte Worker enthielt lokal nur 4 Bootdateien; `verify:build` meldete „Offline boot cache must include code chunk: CountGame-aeGtPtYT.js“. Walk-Ergebnisse werden jetzt mit `.split(path.sep).join("/")` auf Schrägstriche normalisiert; lokal sind wieder 69 leichte Bootdateien im Kern und die Offline-Kontrakte unter `/`, `/Minik-beta/` und `/Minik-2.0-/` grün. Commit `129d84b`, Actions-Run `35406025758` komplett grün.
- Das Rhythmusspiel respektiert den Master-Audio-Schalter jetzt auch ohne Endergebnisansage: `playNote` wird bei `settings.audio === false` weder vorgespielt noch beim Antippen bewertet, und der Status zeigt bilingal „Ton aus“/„Ses kapalı“. Damit ist der Audio-Toggle konsistent mit `speak()` (`src/audio/voice.js`) und dem Geräuschspiel. Drei neue Verhaltenstests (+`rhythm-audio-gate.test.mjs`), Commit `1e927f9`, Actions-Run `35406236654` grün.
- Das Malen-Spiel stellt beim Undo nach „Löschen“ neben dem Bild auch den echten Strokes-Stand wieder her: `save`/`clearNow`/`undo` nutzen jetzt die vorhandenen `drawingHistoryEntry`/`drawingHistoryState`-Helfer aus `src/games/drawing.js`, sodass jeder History-Eintrag seinen eigenen Strichzähler trägt und der Abschluss-Button nach Undo nicht mehr fälschlich gesperrt bleibt. Neue Tests `tests/draw-undo-count.test.mjs`, Commit `067fc54`, Actions-Run `35406370426` grün.
- Das Zuordnen-Spiel zeigt Mino jetzt sichtbar als Paarbegleiter in der Bühnenkopfzeile, mit dem gewählten Outfit. Die Float-Bewegung ist über `prefers-reduced-motion` abschaltbar und auf kleinen Telefonen verkleinert; die beiden Ziehhälften bleiben unverändert. Commit `4364394`; der zugehörige Test (`match-playground.test.mjs`) prüft den neuen Kontrakt.
- **Stand bei Redaktionsschluss:** 713/713 Tests, Preflight, Produktionsbuild und Offline-Verifikation lokal grün; `main` ist mit `origin/main` identisch. Die Läufe für `4364394` liefen bei Redaktionsschluss noch.
- Weiterhin extern offen: physische iPhone-/iPad-Abnahme von Tonstart, Touch und Background/Resume sowie die noch fehlenden festen Wortaufnahmen mit dem ursprünglichen Sprecherprofil. Diese externen Punkte dürfen die weitere softwareseitige P1-/P2-Arbeit nicht blockieren.

### Work-Lauf 18. September 2026 · CI, Entdeckerwelt und Audio-Races

- Ausgangspunkt war `1f00f046`. Der eigentliche Workflow **Build, test and publish MINIK** war rot, obwohl der parallele Legacy-Pages-Lauf grün war. Ursache war kein App-Fehler, sondern eine ungültig doppelt escapte RegExp in `tests/audio-choice-lifecycle.test.mjs`. Commit `cb0677b2` repariert den Regressionstest; Tests, Preflight, Build und Produktionsprüfung waren danach wieder grün.
- `WorldScenery` nutzt den bereits übergebenen Entdeckungsfortschritt nun wirklich: bei 1, 3 und 6 gefundenen Objekten wachen die drei weltspezifischen Landmarken stufenweise auf. Die Kulisse bleibt rein dekorativ und erzeugt keine zusätzlichen Touch-Ziele; `prefers-reduced-motion` deaktiviert die Übergänge. Commit `5d4528fe`.
- Im Entdeckerspiel konnte der Abschluss-Timer bisher schon 350 ms nach dem letzten Fund auslösen, während die feste MINIK-Stimme das letzte Lernwort noch sprach. Der Abschluss wartet jetzt auf das echte Ende der Wortwiedergabe und bleibt weiterhin gegen Pause/Lifecycle-Wechsel geschützt. Commit `f147ce48`.
- Im Geräuschspiel durfte ein veralteter asynchroner Replay-Auftrag nach einem neueren Replay noch `playing=false` setzen. Alte Replay-Läufe steigen jetzt ohne State-Mutation aus; nur der aktuelle Auftrag darf den sichtbaren Wiedergabestatus ändern. Commit `13e686bc`; `c51643c6` korrigiert ausschließlich einen Syntaxfehler im zugehörigen Regressionstest.
- Die Erinnerungsphase im Bilderbuchspiel fällt nicht mehr auf eine schlichte Standardfläche zurück: Mino bleibt sichtbar, die Sequenz erscheint als große Erinnerungsszene und die Antwortbilder erhalten deutlich größere, räumliche Flächen mit eigener Telefonanpassung. Scoring, Hint-Stufen und Antwortanzahl bleiben unverändert. Commit `5195bb31`.
- Das Geräuschspiel hat jetzt eine eigene große Hörszene mit sichtbarem Mino. Während der Lernklang läuft, reagieren Mino und die dekorativen Hörwellen ruhig; die zentrale Tonkugel und die bestehenden Antwort-/Audio-Sicherheitsregeln bleiben unverändert. Commit `af702d8e`.
- Im Gegensätze-Spiel besetzt Mino die bisher leere Fragehälfte der Bühne als sichtbarer Denkpartner. Die zweite Seite bleibt nicht länger eine reine Textfläche; auf kleinen Telefonen schrumpft Mino, damit die Antwortobjekte groß bleiben. Commit `5462f881`.
- Im Tagesablauf-Spiel begleitet Mino jetzt sichtbar den Routineweg. Die 2/4/6-Antwortlogik, Reihenfolgepaare und Touchflächen bleiben unverändert; die Begleitfigur ist rein dekorativ. Commit `ffe4de5f`.
- Das Anfangsbuchstaben-Spiel zeigt Mino und einen klar sichtbaren Lautsprecher-Hinweis direkt am großen Lernobjekt. Dadurch ist das bereits vorhandene Antippen-zum-Wiederholen für Kinder sichtbar, ohne das Zielwort oder den richtigen Anfangsbuchstaben vor der Demonstrationshilfe zu verraten. Commit `6679f527`; `e65a2b47` korrigiert eine vom Release-Preflight entdeckte fehlende JSX-Klammer.
- Das Rhythmusspiel zeigt Mino jetzt tatsächlich auf seiner Musikbühne. Das gewählte Outfit bleibt erhalten; Mino bewegt sich nur während der vorgespielten Melodie und respektiert `prefers-reduced-motion`. Die bestehende Audio-, Timing- und Scoring-Logik bleibt unverändert. Commit `349e39ba`.
- Memory wartet beim letzten richtigen Paar jetzt auf das echte Ende der Wortwiedergabe, bevor `onSolve` die Runde beendet. Damit kann die Session-Navigation das zweite Wort des letzten Paars nicht mehr nach 400 ms abschneiden. Commit `22606295`.
- In den sozialen Sicherheitsfolgen begleitet Mino jetzt sichtbar den unbekannten dritten Schritt und „denkt“ mit dem Kind mit. Der bestehende kompakte iPhone-Vertrag bleibt erhalten; `2d77dea8` stellt nach dem visuellen Ausbau die 98-px-Mindesthöhe der Fragekarte wieder her. Ausgangscommit `0d124400`.
- Beim Zuordnen per Antippen wartet der letzte erfolgreiche Treffer jetzt auf das Ende des gesprochenen Quellworts. Drag-&-Drop bleibt unverändert sofort abschließbar; nur der Tap-Fallback hält einen Abschluss kurz zurück, wenn Mino noch das letzte Wort spricht. Commit `8c557969`.
- **Letzter vollständig verifizierter Stand dieses Laufs: `8c557969`.** 697/697 Tests, Release-Preflight, Produktionsbuild, Build-Verifikation, Pages-Deploy und veröffentlichter HTTP-Smoke-Test erfolgreich.
- Weiterhin extern offen: physische iPhone-/iPad-Abnahme von Tonstart, Touch und Background/Resume sowie die noch fehlenden festen Wortaufnahmen mit dem ursprünglichen Sprecherprofil. Diese externen Punkte dürfen die weitere softwareseitige P1-/P2-Arbeit nicht blockieren.


### CI-Hotfix nach Beta 78 · öffentliche Pages-Umschaltung

- Beim ersten Releaseversuch von `7c5fc21` waren 591 Tests, Preflight, Build, Offline-Verifikation und beide Deployments erfolgreich. Der unmittelbar folgende Smoke-Test erhielt jedoch noch kurz das gültige Vite-Quell-HTML der vorherigen Legacy-Veröffentlichung und scheiterte; derselbe Lauf wurde nach der Umschaltung ohne Codeänderung erfolgreich.
- Der Smoke-Test fragt den Seiteneinstieg nun bis zu zwölfmal im Abstand von fünf Sekunden mit je eigenem Cache-Schlüssel ab. Erst nach diesem begrenzten Fenster werden Quell-HTML oder ein fehlender gehashter Vite-Einstieg als Fehler gemeldet.
- JavaScript-Einstieg, Manifest und Service Worker werden weiterhin einzeln mit HTTP-Fehlerprüfung geladen. Ein neuer Workflow-Vertragstest sichert Begrenzung, Cache-Trennung, Warteabstand und die erst nachgelagerte Fehlermeldung; zusammen 592 Tests.
- Diese Änderung behebt eine beobachtete CI-Flake-Quelle, lockert aber keine Release-Prüfung und ersetzt keine physische iPhone-/iPad-Abnahme.

### Audio-Hotfix nach Beta 78 · wartende Lernklänge

- Ausgangspunkt: `6997eef`, 587 Tests sowie CI und Pages grün. Türkischer Standard, feste DE/TR-Stimme, drei Musikstimmungen und die jüngsten Grafik-/Wischkorrekturen bleiben erhalten.
- Im echten Sound-Modul mit verzögertem Audio-Resume reproduziert: Nach `stopSounds()` konnte ein bereits wartender Geräusche-Auftrag noch den vierteiligen Glockenklang starten. Zwei schnelle Wiederholungen konnten einen veralteten Auftrag neben dem neuen fortsetzen.
- `prepareSoundPlayback()` erzeugt jetzt vor dem Warten einen gemeinsamen Abbruch-Token und prüft ihn nach dem Resume erneut. Stop, neuer Ton, Mino-Sprache und eine versteckte Seite invalidieren alte Geräusch- und Rhythmusaufträge dauerhaft.
- Geräusche- und Rhythmusspiel verwenden denselben Pfad. Vier neue Verhaltenstests prüfen Stop, jüngsten Auftrag, Sprecherpriorität und Hintergrundwechsel; zusammen 591 Tests.
- Die vollständigen npm-Test-, Preflight-, Build- und Offline-Gates werden vor Übernahme auf `main` auf einem isolierten GitHub-Prüfzweig ausgeführt; dessen Workflow veröffentlicht keine Pages.
- Weiterhin extern offen: physische iPhone-/iPad-Tonstartprüfung und fehlende feste Wortaufnahmen mit dem ursprünglichen Sprecherprofil.

### Audio-Hotfix nach Beta 78 · 14. September 2026

- Ausgangspunkt: `6602d2f`, 580 Tests und CI/Pages grün; jüngste Grafik-, Wischschutz- und Musikauswahländerungen bleiben erhalten.
- Im echten Sound-Modul mit verzögertem Audio-Resume reproduziert: `stopSounds()` stoppte bestehende Oszillatoren, aber keine noch wartende Rhythmusnote. Auch Mino-Sprache konnte eine solche Note nicht dauerhaft abbrechen; zwei schnelle Taps starteten später beide.
- Eine gemeinsame Abbruchgeneration invalidiert jetzt auch wartende Noten. Vor und nach Audio-Resume werden Auftrag, Sichtbarkeit und Minos aktive Sprache geprüft. Abgebrochene Tonversuche werden im Rhythmusspiel nicht mehr als Antwort gewertet; frische Taps funktionieren weiter.
- Sieben neue Verhaltenstests prüfen Stop, Sprecherpriorität, schnelle Taps, Hintergrundwechsel, neuere Effekte und erneute Wiedergabe.
- Die lokale Entwicklungsumgebung war in diesem Durchlauf nicht verfügbar. Die vollständigen npm-Test-, Preflight-, Build- und Offline-Gates werden deshalb vor Übernahme auf `main` auf einem isolierten Prüfzweig im selben Repository ausgeführt; dessen Prüfworkflow veröffentlicht keine Pages.
- Weiterhin extern offen: physische iPhone-/iPad-Touch- und Tonstartprüfung sowie fehlende feste Wortaufnahmen mit dem ursprünglichen Sprecherprofil. Nächster sinnvoller Schritt: die neuen Musik-/Wischbedienelemente in einer echten Browser-/Gerätesitzung prüfen.

### Beta 78: gespeicherte Sprache mit Media-Teilanfragen

- Aktuelles `main` und CI waren vor der Änderung grün. Im erzeugten Worker reproduziert: `Range: bytes=0-1` erhielt die gesamte Aufnahme mit HTTP 200; gestreamte HTTP-206-Antworten konnten zudem nicht in den Cache geschrieben werden.
- `scripts/audio-cache.mjs` wird in denselben bestehenden Worker eingebettet. Gespeicherte MP3-/WAV-Dateien liefern korrekte 206-Abschnitte, ungültige Positionen 416. Wiederholte Teilanfragen verbrauchen die vollständige Cachekopie nicht.
- Ein neuer Clip spielt direkt aus der Netzwerkantwort. Nur diese Aufnahme wird parallel vollständig gespeichert; gleiche laufende Downloads werden zusammengefasst, nach zehn Sekunden abgebrochen und bei späterer Nutzung erneut versucht. Speicher-/Netzfehler stoppen die bereits gelieferte Wiedergabe nicht.
- Lokale Aufnahmen verwenden CORS-Media-Anfragen, damit der Player die erzeugten Teilantworten akzeptieren kann. Externe Ersatzquellen behalten ihr bisheriges Anfrageverhalten, die feste DE/TR-Stimme bleibt unverändert.
- 561 automatisierte Tests; der erzeugte Worker prüft echte MP3-/WAV-Bytes und Offline-Teilanfragen unter `/`, `/Minik-beta/` und `/Minik-2.0-/`. Keine zusätzliche Sprachdatei im Installationskern.
- Das behebt einen konkreten Cachepfad, ersetzt aber keine physische iPhone-/iPad-Abnahme und ergänzt keine der fehlenden exakten Wortaufnahmen. Als Nächstes türkische Spielansagen über mehrere Runden und Hintergrund-/Offline-Wechsel prüfen; feste TR-Aufnahmen benötigen weiterhin das ursprüngliche Sprecherprofil.

### Beta 77: drei Stufen im ganzen Spiel

- `games/difficulty.js` ist die gemeinsame Quelle für Kolay/Leicht (2), Orta/Mittel (4) und Zor/Schwer (6). Alterslimit, adaptive Auswahl und gespeicherte Sessionstufe bleiben vorgeschaltet.
- Memory, Puzzle, Zählen, Muster, „Was fehlt?“ und Nachfahren verändern ihre eigentliche Mechanik; Auswahlspiele verwenden weiterhin zwei, vier oder sechs eindeutige Antworten.
- `GameSession` verwendet dasselbe Profil nun für alle 23 Spiele: automatische visuelle Hilfe, gesprochene Mino-Hilfe, Hinweis nach Fehlversuchen und Demonstrationsschwelle unterscheiden sich pro Stufe.
- 551 automatisierte Tests sind grün; reale Kinderbeobachtung und iPhone-/iPad-Touch bleiben Geräteprüfungen.

### Beta 76: türkischer Einstieg und hörbare Spielansagen

- Neue Familien beginnen mit Türkisch als Erstsprache. Explizit gespeicherte deutsche Profile und Sprachwechsel bleiben unverändert.
- Dynamische DE/TR-Aufgaben verwenden bei unvollständiger Wortabdeckung kurze, bereits gebündelte feste Anweisungen. Dadurch bleibt Mino auch bei einem noch offenen Wortclip im Spiel hörbar.
- Der feste Audioplayer puffert lokale Aufnahmen parallel zum 500-ms-Decoderfenster. Die softwareseitige Wartezeit sinkt, ohne Sprecherwechsel oder neue Netzwerkabhängigkeit.
- 547 automatisierte Tests sind grün; reale Tonstartzeiten sowie iPhone-/iPad-Touch bleiben Geräteprüfungen.

### Audio-Hotfix: gemeldete Verzögerung nach Antippen

- Nutzer bestätigt passende Stimme, meldet aber langen Tonstart. Gefundener Wartepfad: vollständiger Download/Decode vor HTML-Audio-Fallback konnte vier Sekunden dauern.
- Der optionale Decode-Pfad erhält nun 500 ms Budget; danach übernimmt der normale Audioplayer dieselbe Aufnahme. Kein Sprecherwechsel. Zwei Verhaltenstests prüfen Deadline und späte Ergebnisse.
- Das begrenzt die softwareseitige Vorwartezeit, nicht Netzwerk-/Geräte-Latenz oder Voice-4-Ladezeit. Reale iPhone-Messung bleibt erforderlich.

### Beta 75: CSS passend zum Spiel aufteilen

- 21 spielspezifische Stylesheets wurden aus `main.jsx` in den zentralen Loader `gameStyles.js` verschoben. Gemeinsame Session-, Welt-, Navigations- und Belohnungsstile bleiben im Einstieg.
- `lazyGame` wartet mit `Promise.all` auf React-Modul und passendes CSS. Damit wird die Spielkomponente erst nach ihrem Stil gerendert; die vorhandene `Suspense`-Ansicht deckt die Ladezeit ab.
- Das initiale Produktions-CSS fiel von 252,56 KB auf 163,35 KB (gzip 51,17 KB auf 34,94 KB). Der JS-Einstieg bleibt mit 334,18 KB deutlich unter dem 400-KB-Gate.
- Alle 21 CSS-Chunks und alle JS-Chunks werden weiterhin vorab offline gecacht. 70 Bootdateien bleiben unter dem Safari-Gate von 120; die Sprachbibliotheken werden weiterhin nur bei Nutzung gecacht.

### Beta 74: schneller Start bei vollständig offline-fähigen Spielen

- `GameSession` lädt die 22 konkreten React-Spielmodule für 23 Spieltypen mit `React.lazy` erst beim Öffnen. Der initiale JS-Einstieg fiel im Produktionsbuild von 503,09 KB auf rund 334 KB.
- `Suspense` zeigt währenddessen Mino und einen kurzen DE/TR-Status. Die einzige Bewegung ist über `prefers-reduced-motion` vollständig abschaltbar.
- Der Service Worker nimmt weiterhin alle erzeugten JS-Chunks in `CORE` auf. `verify-build.mjs` verlangt getrennte Chunks, begrenzt den Einstieg auf unter 400 KB und ruft jeden Chunk offline unter allen drei getesteten Installationspfaden ab.
- Die Zahl der Bootdateien steigt von 22 auf 49, bleibt deutlich unter dem bestehenden Safari-Limit von 120; große Bilder und sämtliche Sprachbibliotheken werden weiterhin nicht beim Install vorgeladen.

### Beta 73: Sprache und Szene verbunden

- Die freie Weltansicht führt nun wie das Entdeckerspiel einen tokengebundenen `speakingId`. Das große Objekt bleibt genau für die echte Dauer der Wiedergabe hervorgehoben.
- Spätes Ende eines alten Worts darf den Zustand eines neueren Worts nicht löschen. Wechsel von Ansicht oder Sprache sowie Unmount stoppen die alte Ausgabe und invalidieren ihren Lauf.
- `WorldScenery` reagiert auf den aktiven Sprechzustand mit drei ruhigen Landmarkenbewegungen; `prefers-reduced-motion` schaltet sie ab.
- Zwei neue Tests sichern Lebensdauer, Race-Schutz, Sprach-/Ansichtsbereinigung und die reduzierte Bewegung.

### Beta 72: individuelle Entdeckerorte

- Alle 25 Welten besitzen eine eigene Kombination aus drei lokalen Landmarken. `sceneDecorations` hält die Präsentationsdaten getrennt von Lerninhalten, IDs, Fortschritt und Routing.
- `WorldScenery` rendert die Motive dekorativ hinter dem großen Lernobjekt, ohne Touchflächen oder Screenreader zu beeinflussen. Kleine iPhone-Layouts reduzieren Größe und Deckkraft.
- Tests verlangen exakt drei unterschiedliche, lokal vorhandene SVGs je Welt und eine einzigartige Kombination für jede Destination.
- Reichere weltspezifische Interaktionen und die physische iPhone-/iPad-Abnahme bleiben offen.

### Beta 71: im aktuellen Work-Lauf behoben

- CI-Ausgangsfehler auf `6eaaf3f`: sieben Source-Checks verwechselten Funktionsdefinition und Aufruf; ein weiterer Check verlangte entfernten Personal-Voice-Code. Reparatur `5412e0a`, Actions-Run `34787323737` vollständig grün einschließlich Pages-Deploy und veröffentlichtem HTTP-Smoke-Test.
- Reale Audio-Races: verspätetes Unlock nach neuem Wort, hängende Media-/Download-/Decode-Jobs, fehlendes WebAudio-Ende und unbeschränkter Decoder-Cache. Neun neue Verhaltenstests nutzen den tatsächlichen Voice-Service.
- Service-Worker-Updates überspringen die Wartephase nur bei Erstinstallation oder expliziter Update-Anforderung. Cache-Schreibfehler lassen erfolgreiche Netzwerkantworten durch.
- 368 unveränderte Sprachquelldateien sind unter `public/assets/voice/` versioniert; ursprüngliche Quellzuordnungen bleiben in den Audio-Modulen erhalten. Die Build-Verifikation vergleicht Quelldatei und Ausgabe byteweise.
- Die Sprachabdeckung ist für alle 503 Items erhoben: 127 DE- und 128 TR-Items haben derzeit einen festen Wort-Sprachplan. Alle übrigen benötigen entsprechende feste Aufnahmen oder einen verfügbaren Voice-4-Notfallpfad; siehe `VOICE_COVERAGE.md`.
- Visuelle Live-Prüfung in dieser Umgebung blockiert: lokale Vorschau nicht erreichbar, öffentlicher Pages-Aufruf lief in ein Verbindungs-Timeout. Die Veröffentlichung selbst wurde durch den GitHub-Actions-Smoke-Test bestätigt. Keine neuen physischen iOS-Prüfungen behaupten.

### Work-Lauf 19. September: Mino-Parität für alle verbleibenden Spiele

- Sortieren zeigt Mino jetzt als sichtbaren Werkstattmeister in der Kopfzeile der Sortierwerkstatt (gegebenes Outfit, kleiner Funken-Akzent); CSS in `sort-workshop.css` mit kleineren Maßen für schmale Phones. (`92a15c2`)
- Nachfahren zeigt Mino als Ziel-Coach mit großer Zielblase (aufgegebene Ziffer bzw. Buchstabe) neben dem Schreibbrett; schwebende Reduced-Motion-freie Animation, auf Phones über dem Brett. (`92a15c2`)
- Malen zeigt Mino als Begleiter am Anfang der Vorlagenleiste; `Learn`/`Track`-Fläche bleibt frei, keine neuen Touch-/ARIA-Flächen. (`13f7e7c`)
- Damit besitzt jedes Spiel außer Puzzle (dort ist der Zeiger bewusst Mino) einen sichtbaren Mino mit gewähltem Outfit. 716/716 Tests, Preflight, Build und Offline-Verifikation grün; Commits `92a15c2`, `13f7e7c` auf `main` gepusht.
- Die Entdecker-Szene feiert jetzt mit einem leisen, wiederholten Puls der Fundpunkte, wenn das letzte Bild gefunden ist; `prefers-reduced-motion` schaltet ihn ab. (`8e568ae`)
- Neue Mobil-Layout-Verträge sichern Mino/Punktgrößen und die Türkisch-zuerst-Kopfzeilen von Sortieren, Nachfahren und Entdecken auf schmalen Phones ab. (`8e568ae`)
- „Sprich mit Mino“ zeigt Mino als schwebenden Begleiter an der Mikrofonfläche; schmale Phones behalten große Touchziele, Reduced-Motion bleibt ruhig. 720/720 Tests, Preflight, Build und Offline-Verifikation grün.

Als Nächstes Sprachführung und thematisch passende Szenen weiter verbessern. Die visuelle Gesamtwirkung bleibt Priorität; technische Schutzmechanismen aus Beta 66 und der feste natürliche Erzähler dürfen nicht verloren gehen. Die feste DE/TR-MINIK-Stimme bleibt primär, Voice 4 ist nur der kontrollierte Notfallpfad. Weitere Welten sollen eigene Orte werden, statt nur ein anderes Symbol über demselben Hintergrund zu zeigen.
