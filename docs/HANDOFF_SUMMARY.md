# MINIK — aktueller Entwicklungsstand

Stand: **14. September 2026 · 1.74.0 Beta 77**. Der langfristige Nutzerauftrag steht in `MASTER_PROMPT_FOR_WORK.md`.

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

Als Nächstes Sprachführung und thematisch passende Szenen weiter verbessern. Die visuelle Gesamtwirkung bleibt Priorität; technische Schutzmechanismen aus Beta 66 und der feste natürliche Erzähler dürfen nicht verloren gehen. Die feste DE/TR-MINIK-Stimme bleibt primär, Voice 4 ist nur der kontrollierte Notfallpfad. Weitere Welten sollen eigene Orte werden, statt nur ein anderes Symbol über demselben Hintergrund zu zeigen.
