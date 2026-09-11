# Changelog

## 1.66.0 Beta 67 — Minos große Entdeckerwelt

- Neue bildschirmfüllende Startlandschaft mit großem Mino, nativen Wischgesten und fünf Themenreisen zu allen 25 bestehenden Welten.
- Große Lernobjekte in Landschaften statt einer Wortkartenwand; Antippen spricht das Wort, Pfeile und Tastatur ergänzen Wischen.
- Entdeckerspiel übernimmt diese Darstellung mit altersabhängig begrenzter Objektzahl und erhaltenem Pause-/Fortschrittsschutz.
- Drei eigens für MINIK erzeugte WebP-Landschaften (zusammen 382 KB) werden offline vorgeladen.
- Sechs neue Tests für vollständige Weltennavigation, Scrollgrenzen, doppelte Entdeckungen, Schwierigkeit und Assetbudget. Offline-Buildprüfung ergänzt den echten `/Minik-beta/`-Pfad.

## 1.65.0 Beta 66 — Safari-Pause und Interaktionssicherheit zusammengeführt

- Der synchrone `pausedRef`-Schutz gegen iOS-Safari-Tap-Races bleibt erhalten.
- Die umfassende Interaktionssperre für Antworten, Hilfe und Audio-Wiederholung ist wiederhergestellt.
- Manuelles Pausieren stoppt Sprache und Sounds sofort und persistiert den Checkpoint noch vor dem React-Commit.
- Überschrift, Hilfe und Replay sind außerhalb der aktiven Phase inert/gesperrt, damit Lob-, Demo- und Pause-Audio nicht überlagert werden.
- Die zuvor getrennten Beta-65-Sicherheitsvarianten sind in einer gemeinsamen Implementierung zusammengeführt und durch 203 automatisierte Tests abgedeckt.

## 1.64.0 Beta 65 — Safari-Pause-Race bei Kinder-Eingaben geschlossen

- Spielpausen besitzen jetzt zusätzlich zu React-State einen synchronen `pausedRef`. Damit ist Kinder-Eingabe bereits im selben Event-Turn gesperrt, in dem iOS Safari `pagehide` oder `visibilitychange` meldet.
- `wrong()` und `solve()` prüfen diesen synchronen Pause-Guard. Ein bereits in der Event-Queue liegender Tap kann dadurch nach dem Wechsel in den Hintergrund keine Antwort, Sterne oder Lernstatistik mehr auslösen.
- Beide manuellen Pause-Schaltflächen und alle automatischen Resume-Pfade halten den synchronen Guard konsistent mit der sichtbaren Pause.
- Zwei neue Regressionstests sichern Safari-Lifecycle- und manuelle Pause-Races ab.

## 1.64.0 Beta 65 — Synchrone Interaktions- und Pausensicherheit

- Spielantworten, Mino-Hilfe und Audio-Wiederholung laufen jetzt zusätzlich durch einen synchronen Interaktions-Guard. Dadurch können schnelle Pointer-/WebKit-Ereignisse in dem kleinen Fenster zwischen Pause/Phasenwechsel und dem nächsten React-Render keine bereits gesperrte Runde mehr verändern.
- Der Guard berücksichtigt gleichzeitig Lock, React-Pause, manuelle Pause, Lifecycle-Pause, versteckte Dokumente und jede Nicht-`active`-Spielphase.
- Eine manuelle Pause setzt ihre Absicht jetzt vor dem React-State synchron, stoppt Sprache und WebAudio sofort und schreibt den Resume-Checkpoint noch im selben Ereignis.
- Spielbereich, Lernkopf und Mino-Hilfe werden während Pause beziehungsweise nicht aktiver Runde zusätzlich über `inert` aus der Interaktion genommen.
- Drei neue Regressionstests sichern Lifecycle-Guard, gesperrte Antwort-/Hilfe-/Replay-Steuerung und die synchrone manuelle Pause ab.

## 1.63.0 Beta 64 — PWA-Update-Erkennung und WebKit-Fallback final gehärtet

- Service-Worker-Updates werden mit `updateViaCache: "none"` registriert, damit ein frisch veröffentlichtes `sw.js` auf GitHub Pages nicht durch einen veralteten HTTP-Cache verdeckt wird.
- Eine lange geöffnete beziehungsweise installierte MINIK-PWA prüft nach Rückkehr in den Vordergrund erneut auf Updates; die Prüfung ist auf 15 Minuten gedrosselt, damit schnelles App-Wechseln keine unnötigen Netzwerkanfragen erzeugt.
- `registerOffline()` ersetzt einen eventuell älteren Visibility-Listener, falls die Registrierung in einer Entwicklungs-/Hot-Reload-Situation erneut aufgerufen wird.
- Nach einer vom Elternteil ausdrücklich bestätigten Aktualisierung gibt es jetzt einen 6-Sekunden-WebKit-Fallback: Falls `controllerchange` auf einem suspendierten iPhone/iPad nicht zuverlässig ankommt, wird genau einmal neu geladen statt den Update-Knopf dauerhaft deaktiviert zu lassen.
- Der erste Service-Worker-Install bleibt weiterhin vor ungefragtem Reload geschützt, weil der Fallback nur während einer bewusst gestarteten Aktualisierung aktiv ist.
- Zwei neue Regressionstests sichern gedrosselte Vordergrund-Checks, cachefreie Worker-Aktualisierung und den begrenzten Update-Fallback ab.

## 1.62.0 Beta 63 — Unterbrochene Sessions final zusammenführen & Mikrofon-Lifecycle härten

- Eine durch echten Safari-/PWA-Exit zunächst als **unterbrochen** gespeicherte Spielsession kann nach „Weiterspielen“ jetzt mit derselben Session-ID sauber zu **beendet** hochgestuft werden. Vorher verhinderte die Duplikat-Sperre dieses Upgrade und ließ erfolgreich fortgesetzte Spiele dauerhaft als unterbrochen in der Elternstatistik stehen.
- Wiederholte echte Exits derselben fortgesetzten Session aktualisieren jetzt kumulative Spielzeit, Runden und Versuche, ohne neue Duplikate oder falsche Abschlusszähler anzulegen.
- Bereits abgeschlossene Sessions sind gegen spätere stale/incomplete Writes aus alten Tabs geschützt und können nicht wieder auf „unterbrochen“ zurückfallen.
- Legacy-/beschädigte Session-Duplikate mit gleicher ID werden beim Laden zusammengeführt und bevorzugen einen bereits vorhandenen Abschluss.
- „Sprich mit Mino“ trennt WebKit-SpeechRecognition-Callbacks vor einem app-gesteuerten `abort()` ab. Späte `aborted`-/`end`-/`result`-Events nach Pause, Unmount oder finalem Ergebnis können dadurch keine neue Runde mehr beeinflussen oder doppelte Fehlversuche erzeugen.
- Sieben neue Regressionstests sichern Session-Upgrade, kumulative Exit-Snapshots, Downgrade-Schutz, Legacy-Deduplizierung und SpeechRecognition-Lifecycle ab.

## 1.61.0 Beta 62 — Exakte Schwierigkeit bei Spiel-Wiederaufnahme

- Unterbrochene Spiele speichern jetzt die tatsächlich verwendete 2/4/6-Antwortschwierigkeit und setzen nach Safari-/PWA-Neustart exakt damit fort.
- Adaptive Schwierigkeit wird bei einer wiederaufgenommenen Sitzung nicht mehr mitten im Spiel aus inzwischen verändertem Lernfortschritt neu berechnet.
- Gespeicherte Schwierigkeit wird weiterhin gegen die Altersgrenze des aktiven Kinderprofils begrenzt; manipulierte Werte können die 2/4/6-Alterslogik nicht umgehen.
- Die Startseiten-„Weiterspielen“-Karte reagiert jetzt auch sofort auf Änderungen von adaptiver/fester Schwierigkeit und bleibt nach Checkpoint-Bereinigung nicht als Geisterkarte sichtbar.
- Drei neue Regressionstests sichern Schwierigkeitskontinuität, Altersgrenze und Startseiten-Aktualisierung ab.

## 1.60.0 Beta 61 — PWA-Update & Offline-Fallback finalisiert

- Der erste Service-Worker-Install auf iPhone/iPad darf MINIK nicht mehr durch ein `controllerchange` ungefragt neu laden; ein Reload erfolgt nur noch nach einer bewusst bestätigten App-Aktualisierung.
- Das Aktivieren eines wartenden Updates sucht jetzt gezielt die Service-Worker-Registrierung des aktuellen MINIK-/GitHub-Pages-Scopes statt irgendeine Registrierung derselben Origin zu verwenden.
- Navigationen fallen bei temporären HTTP-Fehlern wie 503 auf den bereits gecachten MINIK-App-Shell zurück, nicht nur bei komplett fehlender Netzwerkverbindung.
- Die Build-Verifikation simuliert nun zusätzlich einen temporären Serverfehler und prüft, dass die gecachte App trotzdem startet.
- Drei neue Regressionstests sichern First-Install-Reload, scoped Updates und 5xx-Offline-Fallback ab.

## 1.59.0 Beta 60 — Browser-Zurück & Eltern-PIN-Härtung

- Safari-Back-Swipe, Browser-Zurück und externe Hash-Navigationen finalisieren eine begonnene Spielrunde jetzt sauber als unvollständige Sitzung.
- Beim bewussten Verlassen über eine Hash-Navigation wird der Resume-Checkpoint entfernt, damit kein absichtlich verlassenes Spiel als Geister-„Weiterspielen“ zurückbleibt.
- Bereits vollständig beendete Runden werden durch eine spätere Hash-Navigation nicht noch einmal finalisiert.
- Persistierte Eltern-PINs sind nur noch gültig, wenn sie exakt vierstellig sind; beschädigte 1–3-stellige Werte fallen sicher auf das Rechengate zurück.
- Doppelte Nachrichtenaktualisierung bei falschen Antworten aus der Spielsession entfernt.
- Neue Regressionstests schützen Hash-Routen-Exit und PIN-Normalisierung.

## 1.58.0 Beta 59 — Atomare aktive Profilauswahl

- Die aktive Kinderprofil-ID wird jetzt zusammen mit allen Profilen im autoritativen Familien-Snapshot gespeichert.
- Der alte separate Active-Key bleibt nur als Legacy-Fallback und kann einen frisch gespeicherten Familienstand nicht mehr auf das falsche Kind zurücksetzen.
- Recovery und Profilwechsel lesen die eingebettete aktive Profil-ID bevorzugt; zusätzliche Tests sichern partiell fehlgeschlagene Legacy-Schreibvorgänge ab.

## 1.57.0 Beta 58 — Speicherbudget & Backup-Grenzen

- Persistierte Welt-/Mastery-/Event-/Reward-Sammlungen haben jetzt feste Obergrenzen, damit beschädigte oder manipulierte LocalStorage-Daten beim App-Start nicht tausende unnötige Objekte verarbeiten oder dauerhaft zurückspeichern.
- Settings werden beim Laden aus einer expliziten Whitelist neu aufgebaut; unbekannte Alt-/Fehlerfelder gelangen nicht mehr zurück in den Live-Zustand.
- History wird vor der Normalisierung auf die tatsächlich benötigten letzten 500 Einträge begrenzt; ID-Listen werden ohne Vollscan riesiger Arrays dedupliziert.
- Familienzustand akzeptiert höchstens acht Profile und nur kurze, sichere Profil-IDs; ein ungültiger Envelope wird nicht mehr als Primary gespeichert.
- Backup-Import begrenzt Dateigröße auf 5 MiB, prüft Profil-IDs und normalisiert Name, Avatar und Erstellungszeit. Der Elternbereich lehnt zu große Dateien bereits vor `file.text()` ab.
- Neue Regressionstests sichern Speichergrenzen, Metadatenbereinigung, Backup-Größe und Family-Write-Validation ab.

## 1.56.0 Beta 57 — Datenintegrität & Release-Preflight

- Persistierte History- und Session-Datensätze werden jetzt feldweise normalisiert, statt beliebige JSON-Objekte bis in Elternstatistik und UI durchzulassen.
- Kaputte Sitzungen ohne ID/Welt/Spiel/Sprache/Zeit werden verworfen; doppelte Session-IDs werden auf den neuesten gültigen Eintrag reduziert und Laufzeit/Runden/Versuche begrenzt.
- Unmögliche Fortschrittsbeziehungen werden repariert: `correct <= answers`, `bestStreak >= streak`, selbstständige Mastery höchstens so hoch wie korrekte Mastery und Equipment nur aus tatsächlich freigeschaltetem Inventar.
- Stark in der Zukunft liegende `lastSeen`-/History-Zeitstempel werden nicht mehr akzeptiert, damit Spaced Repetition und Wochenstatistik nicht vergiftet werden.
- Familien-Primary-Daten mit `null`-Profilen, leeren/doppelten Profil-IDs oder ungültiger Progress-Struktur gelten nicht mehr als gesund und können einen gültigen Recovery-Snapshot nicht überstimmen.
- Der Session-Reducer normalisiert auch neue Sitzungen sofort, sodass ein interner fehlerhafter Event nicht erst nach einem Reload bereinigt wird.
- Neuer `npm run preflight` prüft Versionssynchronität, Release-Dokumente, 25/500+/23-Inhaltsziel, PWA-Manifest, GitHub-Pages-Workflow, alle relativen Quell-Imports und die Zuordnung jedes Spieltyps zu einer echten GameSession-Komponente vor dem Produktionsbuild.
- GitHub Actions bewahrt den geprüften `dist/`-Build zusätzlich 14 Tage als herunterladbares Artefakt `minik-production-build` auf.
- Der Preflight parst JS/JSX zusätzlich mit TypeScript und stoppt das Release bei echter Quellsyntax, bevor GitHub Pages deployt.
- `package.json` und die Root-Abhängigkeiten in `package-lock.json` werden vor dem Build vollständig gegeneinander geprüft, damit ein späteres `npm ci` nicht erst im Deployment an einer veralteten Lockdatei scheitert.
- Ein verzögerter 200-ms-Lernhinweis kann nach einer blitzschnell gelösten Runde nicht mehr über das Erfolgs-Lob sprechen; synchrone Phase-/Pause-Refs blockieren auch Mino-Autohilfe im Safari-Lifecycle-Rennen.
- `useLesson` hält den Wiederholungs-Callback jetzt stabil, leitet aber immer an den neuesten Render weiter: Sprach-/Stimmen-/Tempoänderungen aus einem zweiten Tab bleiben nicht mehr in einer alten Closure hängen. Wird Sprachausgabe deaktiviert, stoppt eine bereits laufende Ansage sofort.
- README, GitHub-Startanleitung, Roadmap, QA und Übergabe auf den tatsächlichen aktuellen Stand gebracht.

## 1.55.0 Beta 56 — Zuverlässige Session-Statistik bei echtem Safari-Exit

- Ein echter `pagehide` außerhalb des Safari-BFCache speichert eine begonnene, aber nicht abgeschlossene Spielsitzung jetzt synchron als unvollständig.
- Dadurch gehen Spielzeit und Versuche nicht mehr verloren, wenn Safari/PWA beendet wird, bevor ein React-Unmount zuverlässig laufen kann.
- BFCache-Navigationen werden weiterhin ausdrücklich nicht finalisiert, damit Zurückkehren keine Sitzung doppelt oder vorzeitig abschließt.
- Regressionstest sichert die Trennung zwischen echtem Seiten-Exit und BFCache ab.

## 1.54.0 Beta 55 — Lifecycle-Pause zuverlässig fortsetzen

- Automatische Hintergrundpausen werden beim Sichtbarwerden der App wieder aufgehoben.
- Bewusst vom Kind gesetzte Pausen bleiben davon getrennt und werden nicht automatisch fortgesetzt.
- Lifecycle-Status wird explizit geführt, damit Safari `pagehide`/`pageshow` und `visibilitychange` konsistent zusammenspielen.

## 1.53.0 Beta 54 — Checkpoint timestamp & storage safety

- Unterbrochene Spielstände dürfen keine Startzeit in der Zukunft oder ungültige negative Zeitstempel mehr in Eltern-Statistiken einschleusen.
- Die Startzeit wird beim Laden auf einen plausiblen Bereich bis `updatedAt`/jetzt begrenzt.
- Checkpoint-Speicherfunktionen melden fehlenden/unverfügbaren Storage jetzt korrekt als Fehlschlag statt fälschlich Erfolg zu melden.
- Neue Regressionstests sichern Zeitstempel und fehlenden Storage ab.

## 1.52.0-beta.53

- Running games now remount when a child's age band or answer-difficulty mode changes, including cross-tab parent changes.
- Changing language, adaptive difficulty, or fixed answer count clears incompatible interrupted-game checkpoints.
- Prevents a resumed round from mixing an old difficulty context with newly configured answers.
- Added regression coverage for game-context isolation.

## 1.51.0 Beta 52 — Parent BFCache lock safety

- Ein bereits entsperrter Elternbereich verriegelt jetzt zusätzlich sofort bei `pagehide`, nicht nur bei `visibilitychange`.
- Dadurch kann Safari einen entsperrten Elternbereich nicht über den Back/Forward-Cache konservieren und später offen wiederherstellen.
- Der `pagehide`-Listener wird beim Unmount sauber entfernt; Regressionstest ergänzt.

## 1.50.0 Beta 51 — Parent gate reload safety

- Eltern-Sperre nach Fehlversuchen bleibt jetzt auch nach einem Seiten-Reload bestehen; ein Kind kann die 30-Sekunden-Pause nicht mehr durch Safari-Neuladen umgehen.
- Der Gate-Zustand synchronisiert sich zwischen mehreren offenen Tabs.
- Persistierte Gate-Daten werden strikt normalisiert; manipulierte Werte können das Gerät nicht länger als die normale Sperrzeit blockieren.
- Regressionstests für Reload-Bypass und beschädigte Gate-Daten ergänzt.

## 1.49.0 Beta 50 — Modal focus safety

- Shared modal safety now traps Tab/Shift+Tab inside the currently active modal instead of letting keyboard focus escape into the app behind it.
- Confirmation dialogs now use the same shared Escape, scroll-lock and focus-restore lifecycle as the other major overlays.
- Confirmation buttons are explicitly `type="button"`, preventing accidental form submissions if a dialog is ever rendered inside a form.
- Added regression coverage for focus trapping and shared confirmation-dialog safety.

## 1.48.0-beta.49 — Safari Lifecycle-Race bei Checkpoints geschlossen

- Spielphase und Rundennummer werden zusätzlich synchron in Refs geführt, damit `pagehide`/`visibilitychange` unmittelbar nach einer Antwort nicht den Zustand des vorherigen React-Renders speichert.
- Eine gerade gelöste Runde kann dadurch beim extrem schnellen Safari-Hintergrundwechsel nicht mehr fälschlich als aktive Runde wiederauftauchen und erneut beantwortet werden.
- Auch Demo-Phase, Rundenwechsel und Abschluss schreiben ihren Lifecycle-Zustand vor dem React-Render in die Checkpoint-Refs.
- Drei neue Regressionstests sichern die Reihenfolge zwischen Spielentscheidung und Persistierung ab.

## 1.47.0-beta.48 — Profil-isolierte Spielsessions

- Laufende `GameSession`-Instanzen sind jetzt zusätzlich an `activeProfileId` gebunden.
- Wechselt das aktive Kinderprofil in einem zweiten Browser-Tab, wird die laufende Runde sauber neu gemountet statt lokalen Runden-/Stern-/Versuchsstatus zwischen zwei Kindern weiterzuverwenden.
- Neuer Regressionstest schützt die Profil-Isolation bei Cross-Tab-Storage-Änderungen.

## 1.46.0-beta.47

- Bewahrt eine bewusst gesetzte Spielpause über Safari Back/Forward-Cache hinweg.
- Safari `pageshow` setzt nur noch automatisch fort, wenn die Pause vom App-Lebenszyklus kam und nicht vom Kind.
- Beide Pause-Schaltflächen markieren die Pause explizit als manuell; Weiterspielen/Escape heben diese Absicht sauber auf.
- Neue Regressionstests für manuelle Pause + BFCache.

## 1.45.0 Beta 46 — Spielstand-Zähler gegen beschädigten Speicher abgesichert

- Wiederaufnahme-Daten werden jetzt zusätzlich gegen die echte Rundenzahl des jeweiligen Spiels begrenzt.
- Ein beschädigter oder manuell veränderter Checkpoint kann dadurch weder Hunderte verdiente Sterne anzeigen noch unrealistische Rundenzähler in eine abgeschlossene Sitzung übernehmen.
- Aktive/Hilfe-Runden dürfen die aktuelle Runde nicht schon als verdient markieren; nur eine wirklich gelöste `success`-Runde darf sie mitzählen.
- Versuche, gespielte Antworten und Fehler werden auf spielrealistische Grenzen begrenzt.
- Neue Regressionstests sichern manipulierte/korrupt gespeicherte Wiederaufnahme-Zähler ab.

## 1.44.0-beta.45 — Persistenz-Härtung

- Beschädigte oder manipulierte gespeicherte Einstellungen werden jetzt strikt typisiert statt als truthy/falsy JavaScript-Werte übernommen.
- Voice-IDs, Weltstatistiken und Mastery-Zähler werden vor der Nutzung normalisiert.
- Ungültige History-/Session-/Event-Einträge werden verworfen; Inventar und Ausrüstung werden dedupliziert.
- Neue Regressionstests schützen die Fortschrittsarithmetik vor korruptem LocalStorage oder fehlerhaften Backups.

## 1.43.0 Beta 44 — Kontextwechsel räumt Spielstände sofort auf

- Ein Wechsel der Lernsprache löscht jetzt sofort den unterbrochenen Spielstand des aktiven Kinderprofils.
- Eine Änderung der Altersgruppe löscht den Checkpoint genau dieses Profils, sobald sich die Altersgruppe tatsächlich ändert.
- Dadurch bleiben keine unsichtbaren, nicht mehr kompatiblen Wiederaufnahme-Daten bis zum 6-Stunden-Ablauf in Safari/localStorage liegen.
- Neue Regressionstests sichern beide Kontextwechsel ab.

## 1.42.0 Beta 43 — Defensive Spielrouten-Härtung

- `GameSession` liest die Rundenzahl jetzt nur noch über einen sicheren Fallback und dereferenziert keinen fehlenden Spieleintrag mehr.
- Kaputte, veraltete oder manipulierte Spiel-IDs können dadurch selbst innerhalb der Session-Komponente keinen Render-Crash über `spec.rounds` mehr auslösen.
- Rundenzähler, Fortschrittsanzeige und Abschlusslogik verwenden zentral dieselbe validierte Rundenzahl.
- Neuer Regressionstest stellt sicher, dass `GameSession` keine ungeschützten `spec.rounds`-Zugriffe mehr enthält.

## 1.41.0 Beta 42 — Verlorene PWA-Update-Hinweise verhindert

- Wartende Service-Worker-Updates werden jetzt intern zwischengespeichert, bis die React-Oberfläche ihren Listener registriert hat.
- Dadurch geht ein bereits fertiges MINIK-Update nicht mehr verloren, wenn der Service Worker schneller fertig ist als der App-Start auf iPhone/iPad.
- Nach bewusstem Aktivieren eines Updates wird der gemerkte Zustand zurückgesetzt, damit kein altes Update-Banner erneut auftaucht.
- Regressionstest sichert die Race-Condition zwischen Service-Worker-Installation und React-Mount ab.

## 1.40.0 Beta 41 — Build-/Quellcode-Sicherheit

- Kritischen Syntaxfehler in `src/parent/Parents.jsx` behoben: Ein versehentlich verschachtelter `import` hätte einen echten Vite/GitHub-Pages-Build verhindert.
- Release-Test ergänzt, der solche verschachtelten/beschädigten Import-Deklarationen in allen `src/*.js` und `src/*.jsx` Dateien künftig automatisch abfängt.
- Versionsangaben in `package.json`, `package-lock.json` und sichtbarer App-Metadatei synchronisiert.

## 1.39.0 Beta 40

- Verhindert Ghost-Spielstände: Ein Spiel wird erst als fortsetzbar gespeichert, nachdem das Kind tatsächlich mindestens eine Antwort/Interaktion hatte.
- Safari-Hintergrundwechsel direkt nach dem Öffnen erzeugen dadurch keine leeren Wiederaufnahme-Sessions mehr.
- Regressionstest für unberührte Spielrunden ergänzt.

- Unterbrochene Spiele speichern jetzt Sprache und Altersgruppe des Kinderprofils.
- Ein Checkpoint wird nach Sprach- oder Alterswechsel nicht mehr in eine andere Lernkonfiguration übernommen.
- Alte Checkpoints ohne diese Metadaten bleiben kompatibel.

## 1.38.0 Beta 39

## 1.37.0 Beta 38 — Profil-/Checkpoint-Hygiene

- Beim Zurücksetzen eines Kinderprofils wird ein eventuell gespeicherter unterbrochener Spielstand jetzt ebenfalls gelöscht.
- Beim Löschen eines Profils wird dessen Session-Checkpoint entfernt, damit keine verwaisten Fortsetzen-Daten im Browser bleiben.
- Beim Wiederherstellen eines Familien-Backups werden alte und wiederhergestellte Profil-Checkpoints gelöscht, damit kein Spielstand aus einer anderen Fortschrittsversion in das Backup hineinragt.
- Mehrfaches Löschen derselben Checkpoint-ID ist sicher und wird dedupliziert.
- 131/131 automatisierte Tests bestanden; Content-Validierung: 25 Welten, 503 DE/TR-Items, 23 Spieltypen.


- Wiederaufgenommene `success`- und `demo`-Runden starten jetzt gesperrt, damit nach Safari-Neustart keine bereits gelöste Runde erneut beantwortet werden kann.
- Der Hilfegrad (`hint`) wird im Session-Checkpoint gespeichert und wiederhergestellt. Dadurch bleibt eine bereits unterstützte Runde nach Unterbrechung korrekt als unterstützt markiert.
- Neue Regressionstests sichern Interaktionssperre und Hilfegrad-Wiederherstellung ab.

## 1.36.0 Beta 37 — Resume-Interaktionssicherheit

## 1.35.0 Beta 36 — Route- & Lifecycle-Sicherheit

- Ungültige oder veraltete `/play`- und `/replay`-Links gelten nicht mehr als aktive Spielsitzung.
- Dadurch halten kaputte Direktlinks den Bildschirm nicht unnötig wach und unterdrücken weder Profilwahl noch bereitstehende PWA-Updates.
- Altersgesperrte oder nicht zur Welt passende Spiele fallen damit vollständig in den sicheren normalen App-Ablauf zurück.
- Neue Regressionstests sichern diese Route-/Lifecycle-Grenze ab.

## 1.34.0-beta.35 — Resume-Sicherheit nach gelöster Runde

- Checkpoints speichern jetzt auch die Spielphase (`active`, `success`, `demo`).
- Wird Safari genau nach einer richtigen Antwort beendet, öffnet MINIK die bereits gelöste Runde nicht mehr erneut als unbeantwortet.
- Dadurch können nach Wiederaufnahme keine doppelten Sterne bzw. doppelten richtigen Antworten für dieselbe Runde entstehen.
- Alte oder beschädigte Checkpoints ohne gültige Phase werden sicher als aktive Runde behandelt.

## 1.33.0 Beta 34 — Modal- & Touch-Sicherheit

- Gemeinsame Modal-Sicherheitslogik für wichtige App-Overlays ergänzt: Escape schließt sicher, Hintergrundscrollen/Overscroll wird während des Dialogs blockiert und der vorherige Fokus anschließend wiederhergestellt.
- Spielpause, Schatz-Enthüllung, Profil-Erstellung und Fortschritt-Reset verwenden die neue Sicherheitslogik.
- Profil-Erstellung besitzt jetzt echte `dialog`-/`aria-modal`-Semantik mit sauberer Überschriftsverknüpfung für Bedienungshilfen.
- Neue Regressionstests sichern Escape-Verhalten, Scroll-Lock, Fokus-Rückgabe und die Einbindung der zentralen Overlay-Logik ab.

## 1.32.0 Beta 33 — Crash-Recovery & Release-QA

- Crash-Recovery vollständig DE/TR lokalisiert.
- Bei einem abgefangenen React-Screenfehler werden Sprache und WebAudio sofort gestoppt.
- Recovery-Oberfläche als dringende Meldung für Assistive Technology markiert und Buttons explizit als normale Buttons abgesichert.
- QA-Dokument auf den tatsächlichen Stand mit 25 Welten, 503 Items, 23 Spielen sowie den noch offenen physischen Geräte-/Repositorytests aktualisiert.

## 1.31.0 Beta 32 — Altersgrenzen auch bei Direktlinks und Wiederaufnahme

- Direkte `/play/...`-Routen prüfen jetzt die Altersfreigabe des aktiven Kinderprofils.
- Ein alter Link oder ein gespeicherter Spielstand kann dadurch kein zu anspruchsvolles Spiel mehr an einem 2–3-jährigen Profil vorbeischleusen.
- Die Weiterspielen-Karte prüft die Altersgruppe erneut, falls Eltern das Profilalter nachträglich ändern.
- Zusätzliche Regressionstests sichern Direktlink- und Resume-Altersgrenzen ab.

## 1.29.0 Beta 30 · Sichere PWA-Updates & GitHub-Pages-Deployment

- MINIK erkennt jetzt einen bereits installierten, wartenden Service Worker und meldet eine neue Version sichtbar im Hauptbereich, statt Nutzer unbemerkt auf einer alten PWA-Version zu lassen.
- Ein Update wird erst auf ausdrücklichen Tipp aktiviert und lädt die App nach dem `controllerchange` genau einmal neu; laufende Kinderspiele werden dabei nicht mit einem Update-Banner unterbrochen.
- GitHub-Pages-Workflow erhält die für `configure-pages`/`deploy-pages` nötigen `pages: write`- und `id-token: write`-Rechte sowie feste Job-Zeitlimits.
- Neue Regressionstests sichern Update-Erkennung, kontrolliertes `SKIP_WAITING`, Reload-Schutz und Pages-Berechtigungen ab.

## MINIK 1.28.0 Beta 29 — Sichere Bestätigungen auf iPhone/iPad

- Native Browser-`confirm()`-Dialoge wurden aus MINIK entfernt und durch einen einheitlichen, touchfreundlichen In-App-Bestätigungsdialog ersetzt.
- Kinderprofile können nicht mehr durch einen kleinen Safari-Systemdialog versehentlich gelöscht werden; Name und dauerhafte Folge werden klar im MINIK-Dialog gezeigt.
- Familien-Backup-Wiederherstellung prüft die Datei jetzt vor der Sicherheitsabfrage und verlangt anschließend eine große, zweistufige Bestätigung innerhalb der App.
- Im Malspiel wird „Alles löschen“ nicht mehr über einen Browserdialog abgefragt; der neue Dialog unterstützt Abbrechen, Escape-Taste und stellt den Fokus danach wieder her. Bei gefährlichen Aktionen liegt der Startfokus bewusst auf „Abbrechen“ statt auf Löschen/Wiederherstellen.
- Neue Regressionstests verhindern, dass native `confirm()`-Dialoge unbemerkt zurückkehren.

## 1.25.0 Beta 26 · Sprich mit Mino

- Neuer 23. Spieltyp **„Sprich mit Mino / Mino ile konuş“** für 16 sprachgeeignete Lernwelten.
- Nutzt die Browser-Spracherkennung nur, wenn sie auf dem Gerät verfügbar ist; aufgenommenes Audio wird von MINIK selbst nicht gespeichert.
- Deutsche und türkische Erkennung verwenden passende Sprachcodes und tolerieren kurze Artikel/Füllwörter, ohne beliebige falsche Begriffe als korrekt zu werten.
- Geräte ohne SpeechRecognition bekommen einen sicheren Mitsprech-Fallback statt eines kaputten Mikrofonscreens.
- Spracherkennung wird beim Pausieren oder Verlassen sofort abgebrochen.
- Drei neue Regressionstests prüfen Normalisierung, Trefferlogik und Safari-WebKit-Fallback.

## 1.24.0 Beta 25 — Sitzungs-Wiederaufnahme

- Laufende Spiele speichern jetzt einen kompakten, profilgebundenen Checkpoint.
- Nach Safari-Neuladen oder einem abrupt beendeten Tab kann dieselbe Runde innerhalb von sechs Stunden weiterlaufen.
- Runde, verdiente Sterne der Sitzung, Versuchszähler und aktive Spielzeit werden sicher wiederhergestellt.
- Normales Verlassen oder vollständiges Beenden löscht den Checkpoint, damit keine alten Runden wieder auftauchen.
- Checkpoints sind pro Kinderprofil getrennt, zeitlich begrenzt und gegen beschädigte Werte normalisiert.
- Zusätzliche Regressionstests für Wiederaufnahme, Ablaufzeit, Profiltrennung und Wertebegrenzung.

## 1.23.0-beta.24

- Neues Bildfolgen-Spiel **„Sicher mit Mino / Mino ile güvende“** in der Sicherheitswelt.
- Sechs fest definierte, zweisprachige Alltagssituationen vermitteln sichere Handlungsschritte mit sehr großen Bildern statt langer Texte.
- Das Spiel ist auch für die Altersstufe 2–3 freigegeben und nutzt dort automatisch maximal zwei Antwortmöglichkeiten.
- Neue Regressionstests stellen sicher, dass jede Sicherheitsfolge aus genau drei unterschiedlichen, real vorhandenen Lernobjekten besteht.
- Release-Metadaten auf 1.23.0-beta.24 synchronisiert.

## MINIK 1.22.0 Beta 23

- Safari-BFCache-Härtung: `pagehide` mit `persisted=true` beendet eine laufende Spielsession nicht mehr fälschlich.
- Beim Zurückkehren aus dem Back/Forward-Cache wird eine pausierte Runde sauber fortgesetzt und WebAudio erneut entsperrt.
- Beim Hintergrundwechsel werden Sprache und laufende Sounds sofort gestoppt, damit nach der Rückkehr keine alten Audiojobs weiterlaufen.
- Regressionstests für echten Seitenabbruch, BFCache-Rückkehr und Audio-Stopp ergänzt.

## 1.21.0 Beta 22 · Sitzungs- & Elternschutz

- Laufende Spielrunden werden auf Safari/iPhone zusätzlich beim `pagehide` synchron als unterbrochene Sitzung gesichert, damit abrupte Tab-Schließungen oder Speicherbereinigung weniger Lernstatistik verlieren.
- Die vorhandene Session-ID-Deduplizierung verhindert dabei doppelte Sitzungen, wenn React-Cleanup danach doch noch ausgeführt wird.
- Der Elternbereich schützt PIN- und Rechen-Gate jetzt gegen unbegrenztes schnelles Probieren: Nach fünf falschen Eingaben gilt eine kurze 30-Sekunden-Sperre.
- Die Sperre läuft sichtbar herunter und wird nach einer korrekten Erwachsenen-Eingabe vollständig zurückgesetzt.
- Neue Regressionstests prüfen Safari-`pagehide`, Sperrgrenze, Cooldown und Reset des Eltern-Gates.

## 1.20.0 Beta 21 · Offline-Start & Release-Metadaten

- Sichtbare Versionsanzeige und Paketversion wieder exakt synchronisiert; die vorherige Beta zeigte intern noch das ältere Beta-19-Label.
- Der Service Worker verwendet jetzt die tatsächliche Paketversion im Cache-Namen statt des historischen `minik-0.3-*`-Präfixes.
- Navigation im Offline-/Schwachnetz-Betrieb wartet höchstens 3,5 Sekunden auf das Netzwerk und fällt danach auf die gecachte App-Shell zurück, statt auf iPhone/iPad bei schlechter Verbindung unnötig lange zu hängen.
- Erfolgreich geladene Navigationsantworten aktualisieren die gecachte App-Shell, damit der nächste Offline-Start möglichst aktuell ist.
- Neue Release-Regressionstests prüfen sichtbare Beta-Bezeichnung, versionierte Cache-Namen und begrenzte Netzwerk-Wartezeit.

## 1.19.0 Beta 20 · Rapid-Tap & Pause Safety

- Sehr schnelle doppelte Fehl-Taps werden jetzt entprellt, damit ein Kleinkind durch einen Doppel-Tap nicht fälschlich zwei oder drei Fehler sammelt und sofort in die Hilfe-Demo rutscht.
- Die Entdeckerwelt vergibt ihren Abschluss nicht mehr aus einem losgelösten Timeout heraus; beim Pausieren wird die ausstehende Abschlussaktion sauber abgebrochen und erst nach dem Fortsetzen neu geplant.
- Der Audio-Wiederholen-Knopf entsperrt WebAudio jetzt vor dem eigentlichen Wiederholungsaufruf.
- Hash-Navigation verwendet nur noch den standardkonformen Scroll-Modus `auto` statt des nicht überall unterstützten `instant`.
- Große Spieltasten erhalten explizites Touch-Verhalten ohne iOS-Tap-Highlight.
- Neue Regressionstests sichern Rapid-Tap-Entprellung, pausierbaren Explore-Abschluss und standardkonforme Navigation ab.

## 1.18.0 Beta 19 · Malwelt Touch- & Speicherhärtung

- Leere Taps auf der Malfläche zählen nicht mehr als echte Pinselstriche; eine Belohnung erfordert nun tatsächliche Zeichenbewegung.
- Pointer-Capture bleibt bis zum echten Ende eines Strichs aktiv, damit Fingerbewegungen am Rand auf iPhone/iPad nicht versehentlich abgeschnitten werden.
- Undo-Snapshots sind auf acht Zustände begrenzt und werden bevorzugt als komprimiertes WebP gespeichert, um den Speicherbedarf langer Malsitzungen deutlich zu senken.
- Zwei neue Regressionstests sichern Mindestbewegung und begrenzte Undo-Historie ab.

## 1.17.0 Beta 18 · Sichere Fortschritts-Wiederherstellung

- Familien- und Kinderfortschritt erhält jetzt automatisch einen Last-known-good-Sicherungsstand im lokalen Gerätespeicher.
- Ist der primäre Profilstand beschädigt oder unlesbar, startet MINIK automatisch mit der letzten gültigen Sicherung statt mit einem leeren Profil.
- Nach erfolgreicher Wiederherstellung wird der Live-Speicher selbst repariert und die App informiert im Hauptbereich über die Wiederherstellung.
- Eine beschädigte Live-Datei darf eine bestehende sichere Recovery-Kopie nicht überschreiben.
- Vier neue Regressionstests sichern Auswahl, Recovery und Schreibschutz der lokalen Profildaten ab.

## 1.16.0 Beta 17 — Elternbereich Auto-Lock & Release-Metadaten

- Elternbereich sperrt sich nach 5 Minuten Inaktivität automatisch wieder.
- Beim Wechsel der App in den Hintergrund wird der Elternbereich sofort gesperrt; auf gemeinsam genutzten iPhones/iPads bleiben Erwachsenenfunktionen damit nicht offen.
- Aktivität im Elternbereich verlängert die Sitzung, ohne die Kindersitzung oder Lernzeit zu beeinflussen.
- Einen Release-Fehler gefunden und behoben: `src/app/meta.js` zeigte trotz neuerer Builds noch 1.8 Beta 9 an.
- Paket-, Lockfile- und sichtbare App-Version wieder synchronisiert.

## 1.15.0 Beta 16 · iPhone Audio Prime & Viewport Hardening

- WebAudio wird jetzt beim allerersten echten Pointer-/Tastaturkontakt appweit entsperrt, bevor ein Spiel später Töne plant.
- Nach Rückkehr aus dem Hintergrund werden AudioContext und verfügbare Systemstimmen erneut vorbereitet.
- Listener werden nach erfolgreichem Audio-Prime beziehungsweise beim Unmount sauber entfernt.
- Die App-Shell nutzt zusätzlich `100dvh`; vertikales Browser-Overscroll wird reduziert, damit Kinder in Vollbildspielen weniger versehentlich die Seite verschieben.
- Neue Regressionstests sichern die Gesten-basierte iPhone/iPad-Audiofreigabe ab.

## 1.14.0 Beta 15 — iPhone Audio Hardening

- Sprachwiedergabe gegen einen bekannten Safari/iOS-Hänger gehärtet: fehlende `onend`/`onerror`-Events können die App nicht mehr dauerhaft blockieren.
- Watchdog-Zeitlimit für jede System-Sprachausgabe ergänzt; laufende/alte Sprachjobs werden sauber beendet.
- `speechSynthesis.resume()` wird vor neuer Ausgabe defensiv aufgerufen, damit die Stimme nach App-Hintergrundwechseln zuverlässiger wieder startet.
- Race-Schutz verhindert, dass eine alte Sprachausgabe nach Abbruch als erfolgreich gewertet wird.
- Regressionstests für die Audio-Härtung ergänzt.

## 1.13.0 Beta 14 – Altersgerechte Kinderprofile

- Kinderprofile speichern jetzt zusätzlich eine Altersstufe: **2–3**, **4–5** oder **6+ Jahre**.
- Die Altersstufe kann beim Erstellen und später beim Bearbeiten eines Profils geändert werden.
- Mino passt den Lernpfad an das Alter an: Bei 2–3-Jährigen werden besonders einfache, bild- und hörbasierte Spiele bevorzugt; Vorschulprofile bekommen schrittweise anspruchsvollere Spiele.
- Die Zahl der Antwortmöglichkeiten ist altersgerecht begrenzt: 2–3 Jahre maximal 2, 4–5 Jahre maximal 4, 6+ bis zu 6.
- Spielkiste und Welt-Spieleansicht blenden für jüngere Profile unnötig anspruchsvolle Spieltypen aus, ohne Inhalte oder Fortschritt zu löschen.
- Familien-Backups sichern und restaurieren die Altersstufe; alte Backups ohne Altersangabe bleiben kompatibel und werden sicher auf 4–5 Jahre gesetzt.
- Alterslogik wurde in ein eigenes Modul ausgelagert, damit Empfehlungen, Schwierigkeit und UI dieselben Regeln verwenden.
- Neue Regressionstests für Altersgrenzen, Lernpfad und Backup-Kompatibilität.
- Beim Testen wurde eine Rückwärtskompatibilitäts-Regressionsstelle in der Schwierigkeitslogik gefunden und behoben.
- **65/65 automatisierte Tests bestanden.**
- Content-Prüfung bestanden: **25 Welten · 503 DE/TR-Lernobjekte · 21 Spieltypen · alle Assets vorhanden**.
- Offline-/Service-Worker-Vertrag für `/` und `/Minik-2.0-/` bestanden.

## 1.12.0 Beta 13 · Mino-Outfits

- Sieben Mino-Outfits mit Stern-Meilensteinen ergänzt: klassisch, Party, Entdecker, Taucher, Künstler, Super-Mino und König.
- Outfit-Auswahl ist pro Kinderprofil gespeichert und bleibt beim Profilwechsel getrennt.
- Freigeschaltete Outfits können im Aquarium jederzeit gewechselt werden; gesperrte Outfits zeigen den nötigen Sternestand.
- Das gewählte Outfit wird auf der Startseite, in der Tagesreise und im Aquarium sichtbar verwendet.
- Neue Regressionstests sichern Freischaltgrenzen, Auswahlpersistenz und Schutz gegen vorzeitiges Freischalten ab.

## 1.11.0 Beta 12 — Tagesreise / Questkette

- Neue dreistufige tägliche Mino-Reise: Spiel abschließen, fünf unabhängige Stern-Antworten schaffen, zwei verschiedene Welten besuchen.
- Fortschritt wird aus realen Sitzungen und Antwortverlauf des aktiven Kinderprofils abgeleitet; kein vermischter Familienfortschritt und keine leicht doppelt auslösbaren Bonussterne.
- Deutsch/Türkisch vollständig unterstützt, responsive Darstellung für schmale iPhones.
- Neue Regressionstests für Tagesgrenzen, vollständige Quest und Hilfe-/Fehlerantworten.

## 1.10.0 Beta 11 — Visuelle Unterscheidung

- Neuer 21. Spieltyp **„Was ist anders? / Hangisi farklı?“** für alle Lernwelten.
- Pro Runde werden vier sehr große Bilder gezeigt: drei identische und genau ein abweichendes Bild.
- Mino-Hilfe kann das richtige Bild hervorheben; Fortschritt, Sterne und Sprachtrennung laufen über die bestehende Session-Logik.
- Neue Touch-optimierte 2×2-Vollbilddarstellung für kleine iPhones und Tablets.
- Neue Tests sichern ab, dass jede Runde genau ein abweichendes Bild enthält und ungültige Kleinst-Datensätze sicher abgefangen werden.
- Teststand: 56/56 bestanden; Contentprüfung: 25 Welten, 503 DE/TR-Items, 21 Spieltypen, alle lokalen Assets vorhanden.
- Produktionsbuild bleibt in dieser isolierten Arbeitsumgebung durch das fehlende lokale Vite-Binary blockiert.

## 1.9.0-beta.10

- Zwei neue echte Konzeptspiele statt weiterer Menüflächen: **Gegensätze** und **Mein Tagesablauf**.
- Gegensätze nutzt kuratierte, eindeutige Paare in Gefühle, Wetter und Mein Tag; Deutsch/Türkisch sind vollständig unterstützt.
- Tagesablauf trainiert eine kindgerechte Reihenfolge von Aufstehen bis Schlafengehen mit großen Touch-Bildern.
- Beide Spiele hängen am bestehenden Mino-Hilfe-, Lernstands-, Stern- und Profil-System.
- Neue Regressionstests prüfen alle Gegensatz-Paare, die komplette Tagessequenz und die korrekte Freischaltung pro Lernwelt.
- Teststand: 54/54 grün; Content-Validierung: 25 Welten, 503 DE/TR-Items, 20 Spieltypen, alle lokalen Assets vorhanden.
- Produktionsbuild bleibt in dieser isolierten Umgebung blockiert, weil das lokale Vite-Binary fehlt; Quellcode- und Contenttests laufen vollständig.

## 1.8.0 Beta 9 — Frühe Leseförderung & Release-Härtung

- Neuer 18. Spieltyp **Anfangsbuchstabe / İlk harfi bul** für 17 bildstarke Lernwelten.
- Kinder sehen ein großes Objekt und wählen den ersten Buchstaben des deutschen bzw. türkischen Begriffs.
- Türkische Sonderbuchstaben und Sprachregeln werden korrekt behandelt (z. B. `i` → `İ`, `ş` → `Ş`).
- Schwierigkeitsstufen verwenden 3, 4 oder 6 große Buchstabenfelder und bleiben für kleine Touchflächen optimiert.
- Mino-Hilfe kann den richtigen Anfangsbuchstaben hervorheben; richtige/falsche Antworten fließen in den bestehenden Lernstand ein.
- Neue Regressionstests für deutsche/türkische Anfangsbuchstaben.
- Release-Ziel auf mindestens 18 echte Spieltypen angehoben.
- Die vollständige Testsuite und Content-Prüfung werden vor dem Paketieren ausgeführt.

## 1.7.0 Beta 8 — Offline-/Gerätehärtung

- Live-Erkennung für Online/Offline-Wechsel ergänzt; MINIK zeigt kindgerecht an, dass gespeicherte Inhalte offline weiterlaufen.
- Netzwerkstatus reagiert ohne Neuladen auf iPhone/iPad-Verbindungswechsel.
- Regressionstest für Offline-Hook, Event-Cleanup und UI-Hinweis ergänzt.
- Vollständige bestehende Test-, Content- und Offline-Build-Prüfung erneut ausgeführt.

## 1.6.0 Beta 7 — Stabilität & iPhone-Spielbetrieb

- Neue globale Crash-Recovery: Ein einzelner Renderfehler lässt die App nicht mehr in einem weißen Bildschirm hängen; Lernfortschritt bleibt erhalten.
- Kinder können nach einem UI-Fehler direkt zur Startseite zurück oder die App neu laden.
- Während aktiver Spiele fordert MINIK, wo vom Gerät unterstützt, einen Screen-Wake-Lock an, damit iPhone/iPad/Android während einer Runde nicht unnötig schlafen gehen.
- Wake-Lock wird beim Verlassen des Spiels sauber freigegeben und nach Rückkehr aus dem Hintergrund erneut angefordert.
- App-Metadaten und Beschreibung auf den tatsächlichen Umfang von 25 Welten und 500+ Lernobjekten aktualisiert.

## 1.5.0 Beta 6 — 25 Lernwelten, 500+ Begriffe und Buchstabenmotorik

- Release-Ziel erreicht: **25 Lernwelten** und **503 deutsch/türkische Lernobjekte**.
- Neun neue Welten: Schule, Sport, Musik, Weltraum, Wetter, Mein Tag, Sicherheit, Orte und Buchstaben.
- Neuer 17. Spieltyp **Buchstaben nachfahren** mit großen Fingerpfaden für frühe Schreibmotorik.
- Content-Gates verschärft: Tests verlangen jetzt mindestens 25 Welten, 500 Items und 17 Spieltypen.
- Content-Manifest auf den vollständigen neuen Lernkatalog aktualisiert.
- Produktionsbuild bleibt in dieser isolierten Umgebung durch das fehlende lokale Vite-Binary blockiert; Logik- und Inhaltsprüfungen laufen unabhängig davon.

## 1.4.0 Beta 5 — Geschichten, Familien-Backup und QA-Härtung

- Neuer 16. Spieltyp **„Minos Geschichte“**: dreiteilige DE/TR-Mini-Geschichten mit visueller Reihenfolge und einfacher Hör-/Merkfrage.
- Vollständiger **Familien-Backup/Restore** im geschützten Elternbereich. Alle Kinderprofile, Sterne, Lernstände, Belohnungen und Einstellungen können als lokale JSON-Datei gesichert und auf einem anderen Gerät wiederhergestellt werden.
- Backup-Import validiert Format, Profilanzahl, IDs und normalisiert beschädigte Fortschrittsdaten vor der Übernahme.
- Bestehenden UI-Fehler behoben: doppelte Sterne-Beschriftung im Elternbereich entfernt.
- Veraltete fest codierte Versions- und Spieltypangaben entfernt; die Anzeige nutzt jetzt den echten Spielkatalog.
- QA erweitert: lokale Welt- und Spiel-Assets werden automatisch auf Existenz geprüft. Dadurch wurde ein zunächst ungültiges Story-Asset sofort erkannt und korrigiert.
- Automatische Tests: **44/44 bestanden**. Content-Gate: **16 Welten · 278 DE/TR-Lernobjekte · 16 Spieltypen**.
- Produktionsbuild bleibt in dieser isolierten Arbeitsumgebung blockiert, weil die npm-Paketdateien für Vite nicht lokal gecacht sind; die Quellcode-/Content-/Logiktests laufen vollständig.

## 1.3.0-beta.4 — Lernwoche & flüssiger Spielpfad

- Elternbereich zeigt jetzt eine echte 7-Tage-Lernwoche mit aktiven Minuten, beendeten Runden, Trefferquote, stärkster Lernwelt und Tagesaktivität.
- Spielzeit zählt nur aktive Sekunden; Pausen und ausgeblendete Tabs werden nicht als Lernzeit gewertet.
- Nach einer abgeschlossenen Runde schlägt Mino direkt die nächste adaptive Aktivität vor, statt den Lernfluss im Belohnungsmenü zu beenden.
- Aquarium bleibt vom Abschlussbildschirm aus erreichbar, steht aber nicht mehr im Weg des nächsten Lernschritts.
- Doppelten Trefferquoten-Wert im Elternbereich und doppeltes `aria-label` am Wiederholen-Knopf behoben.
- Neue Analytics-Regressionstests für 7-Tage-Auswertung und stärkste Lernwelt.

## 1.2.0-beta.3 – Intelligente Wiederholung über mehrere Tage

- Neues Spaced-Repetition-System: Begriffe bekommen abhängig vom Lernstand Wiederholungsabstände von 4 Stunden bis 14 Tagen.
- Schwache Begriffe kommen deutlich früher zurück; sicher gelernte Begriffe werden mit wachsenden Abständen erneut geprüft.
- Wiederholungsplan bleibt vollständig pro Kinderprofil und Sprache getrennt.
- Minos adaptiver Lernpfad priorisiert fällige Wiederholungen automatisch und startet dafür das gezielte Mino-Training.
- Im Elternbereich wird jetzt angezeigt, wie viele Begriffe heute zur Wiederholung fällig sind.
- Review-Rangfolge berücksichtigt überfällige Begriffe stärker.
- Vier neue Tests für Wiederholungsintervalle, Fälligkeit und Sprachtrennung; Empfehlungstest erweitert.

## 1.1.0-beta.2 – Gezieltes Mino-Training

- Neues 15. Spiel **Mino-Training / Mino tekrarı** für gezielte Wiederholung.
- Wiederholungslogik priorisiert Begriffe mit Fehlern und noch unsicherem Lernstand.
- Wiederholung bleibt strikt pro Kinderprofil und Sprache getrennt.
- Lernwelten zeigen bei vorhandenen Schwachstellen einen direkten großen Wiederholungs-Knopf.
- Der adaptive Lernpfad kann jetzt gezielt Mino-Training empfehlen statt nur allgemeine Spiele.
- Veraltete Versionsanzeige im Elternbereich korrigiert.
- Drei neue Tests für Priorisierung, Sprachtrennung und vollständig gemeisterte Welten.
- Teststand: 33/33 bestanden.
- Inhaltsprüfung: 16 Welten, 278 zweisprachige Lernobjekte, 15 Spieltypen.
- Der lokale Vite-Build kann in dieser Arbeitsumgebung weiterhin nicht neu erzeugt werden, weil das vorhandene `node_modules/vite` unvollständig ist. Der Offline-Vertrag des vorhandenen Builds wird weiterhin erfolgreich geprüft.

## 1.0.0-beta.1 — Lernstand pro Begriff

- Neuer zentraler Mastery-Helper trennt jeden Begriff in Neu, Lernen, Noch üben und Sicher gelernt.
- Lernstand bleibt strikt nach Kinderprofil und Sprache getrennt.
- Jede Lernwelt zeigt nun einen echten Prozent-Fortschrittsbalken.
- Entdecken-Ansicht kennzeichnet Begriffe sichtbar mit ihrem Lernstatus.
- Große Abenteuerszene markiert bereits sicher gelernte und übungspflichtige Begriffe direkt am Objekt.
- Drei neue Regressionstests prüfen Statuslogik, Sprachtrennung und Welt-Fortschritt.

## 0.9.0 – Adaptiver Lernpfad

- Neuer persönlicher **Mino-Lernpfad** auf der Startseite mit drei großen, direkt spielbaren Empfehlungen.
- Empfehlungen werden pro Kinderprofil und pro Sprache aus echtem Lernfortschritt berechnet.
- Welten mit vielen Fehlern werden automatisch wieder vorgeschlagen; neue und wenig gespielte Welten bleiben im Mix.
- Die Spielauswahl bevorzugt Abwechslung, damit nicht immer dasselbe Minispiel erscheint.
- Der große „Weiterspielen“-Knopf startet jetzt die sinnvollste aktuelle Empfehlung statt starr immer „Hör & Tipp“.
- Neue automatische Tests für Spielbarkeit, Abwechslung, Lernschwächen und Sprachtrennung.

## 0.8.0
- 12 kindgerechte, automatisch berechnete Mino-Medaillen ergänzt.
- Erfolge für Sterne, Lernfortschritt, Serien, Spielvielfalt, Welten und Aquarium-Schätze.
- Neue responsive Medaillen-Sammlung direkt im Aquarium; pro Kinderprofil vollständig getrennt.
- Keine neue sensible Datenspeicherung: Medaillen werden aus dem vorhandenen Lernfortschritt abgeleitet.

## 0.7.0 – Immersive World Hub

- Jede Lernwelt startet jetzt in einer großen, interaktiven Abenteuerszene statt direkt in einer Kartenliste.
- Sechs sehr große Objekte können direkt angetippt, gesprochen und visuell als entdeckt markiert werden.
- Neue drei Modi pro Welt: Abenteuer, Spiele und Entdecken.
- Großer direkter Einstieg in die Entdeckerwelt aus jeder Lernwelt.
- Welten bekommen unterschiedliche Atmosphären und mobile Vollbilddarstellung.
- Bewegungen respektieren die System-Einstellung für reduzierte Bewegung.

## MINIK 0.6.0

- Multi-child launch screen: when two or more child profiles exist, a fresh app session asks “Who is playing today?” before learning begins.
- Profile cards now show each child’s own stars, completed sessions, and learned concepts.
- Profile editing now supports both name and avatar changes.
- Expanded aquarium reward path from 7 to 13 rewards, up to 300 stars.
- Removed stale hard-coded home counters; world/game counts now follow live content.
- Parent area version label updated.
- Existing progress remains separated by child and is migrated without loss.

## 0.5.0

- Neue bildschirmfüllende **Entdeckerwelt** als 14. Spieltyp für alle Lernwelten.
- Große Szenen mit bis zu sechs frei antippbaren Lernobjekten statt reiner Karten-Quiz-Optik.
- Malen erweitert: freie Fläche + bis zu fünf Malvorlagen aus der jeweiligen Lernwelt.
- Löschen fragt bei bestehender Zeichnung nach Bestätigung; Undo korrigiert jetzt auch den Stroke-Zähler.
- Mobile Szenen und Malfläche auf große iPhone/iPad-Touchbereiche optimiert.
- Content-/Progress-Regressionstests weiterhin grün.

## 0.4.0

- Neue Malwelt mit Fingerzeichnen, 8 Farben, 3 Strichstärken, Radierer, Undo und Löschen.
- Memory gegen schnelle dritte/mehrfache Taps zusätzlich synchron gesperrt.
- Rhythmus/Melodie wartet auf einen wirklich laufenden AudioContext – wichtig für iPhone/iPad Safari.
- Lernwelten und Spielobjekte massiv vergrößert; mobile Welten sind jetzt große, horizontale Szenenkarten statt kleiner Kacheln.
- Spielkarten und 2er-Auswahl nutzen deutlich mehr der sichtbaren Höhe.
- Stimmen-Ranking für hochwertige lokale Apple-/Systemstimmen verbessert.
- Kinderprofile aus 0.3.1 bleiben vollständig erhalten.

## 0.3.1 – Multi-child profiles
- Added up to 8 separate child profiles with name and avatar.
- Each profile has isolated stars, XP, streaks, mastery, sessions, rewards, aquarium state and settings.
- Existing 0.3 progress is automatically migrated into the first profile so nothing is lost.
- Added fast profile switching in the top bar and sidebar.
- Added bilingual profile management (DE/TR), rename and protected delete (at least one profile remains).
- Home greeting now uses the active child's name.

## 0.3.0 — 2026-09-09

### Release 0.2 vollständig integriert

- Sechs getrennte Kernspiele: Hören, Memory, echtes Pointer-Zuordnen mit Tippalternative, Sortieren, Zählen und synthetisierte Alltagsgeräusche.
- Gemeinsame Spielsteuerung für Runden, Pause, Wiederholung, Hilfen und Belohnungen.

### Release 0.3 vollständig integriert

- 16 Welten und 278 vollständige DE/TR-Lernobjekte statt sechs Tierbegriffen.
- Lokale, lizenzierte SVG-Assetpipeline und versioniertes Contentmanifest.
- Foto-Variantenmodell mit Herkunftsdaten; sechs KI-generierte Erwachsenen-Gefühlsmotive.
- Neuer eigener Mino und große responsive App-Oberfläche.

### Vorgezogene Erweiterungen

- Sechs zusätzliche Spiele: Puzzle, Schatten, Merkspiel, Muster, Zahlenpfade und Musikfolge.
- Mehrstufige Mino-Hilfe, anpassbare Schwierigkeit, eigenständige DE/TR-Lernstatistik.
- XP, Level, Sterne, Tagesmission, sieben Schätze und Aquariumgestaltung.
- Elternbereich mit optionaler PIN, Sprach- und Audioeinstellungen, schwierigen Begriffen und Sitzungen.
- Sofortige lokale Speicherung pro Antwort; alte Sterne und Sprache werden übernommen.
- Produktions-Service-Worker mit komplettem kompaktem Kern und Cache-Trennung pro Installationspfad.
- GitHub Actions, 21 Content-/Fortschrittstests und Offline-Buildprüfung für Root- und Repository-Pfade.
- Browserprüfungen aller zwölf Mechaniken; responsive Prüfung bei 320, 393 und 768 Pixeln sowie Desktop.

### Behobene Probleme

- Welten öffnen nicht mehr alle dasselbe Tierquiz.
- Keine mehrfachen Sterne durch wiederholte Klicks; Fehlversuche geben keine Sterne.
- Hilfestellung wird nicht als selbstständige Begriffsbeherrschung gezählt.
- Wiederholte Fehlversuche senken die nächste Schwierigkeitsstufe auch ohne anschließende richtige Antwort.
- Puzzle wird nur für tatsächlich geeignete Bildwelten angeboten.
- Unsichtbare Antwortduplikate durch gleiche Bildmotive werden vermieden.
- Tablet-Symbolnavigation erhält zugängliche Namen; Pausendialog sperrt Hintergrundbedienung.

## 0.1 — übernommener Ausgangsstand

React/Vite-Starter, sechs Tierbegriffe, eine Auswahlrunde, einfache Sterne und System-TTS.
