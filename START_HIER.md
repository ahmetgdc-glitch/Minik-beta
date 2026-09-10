# MINIK 1.65.0 Beta 66 auf GitHub testen

Dieses Paket enthält den vollständigen Quellstand von MINIK mit **25 Lernwelten, 503 DE/TR-Inhalten und 23 Spieltypen**.

## Empfohlen: über GitHub Actions veröffentlichen

1. ZIP entpacken.
2. Den **Inhalt des entpackten Ordners** in das MINIK-Repository übernehmen. `package.json`, `package-lock.json`, `index.html`, `src`, `public`, `scripts`, `tests` und `.github` gehören ins Repository-Hauptverzeichnis. Das ZIP selbst nicht als einzige Datei hochladen.
3. In GitHub **Settings → Pages → Build and deployment → Source → GitHub Actions** auswählen.
4. Auf `main` oder `master` speichern. Unter **Actions** startet **Build, test and publish MINIK** automatisch; alternativ kann der Workflow manuell gestartet werden.
5. Der Workflow führt `npm ci`, **200+ automatisierte Tests**, den Release-Preflight, den Produktionsbuild und die Offline-Verifikation aus.
6. Erst wenn der Workflow grün ist, die unter **Settings → Pages** angezeigte HTTPS-Adresse öffnen.

Der fertige Produktionsordner wird zusätzlich im erfolgreichen Actions-Lauf als Artefakt **`minik-production-build`** für 14 Tage bereitgestellt.

## Wichtig zu `dist/`

Die aktuelle Quellcode-ZIP enthält absichtlich keinen alten `dist/`-Ordner. `dist/` soll aus genau diesem Quellstand frisch entstehen. Die `index.html` im Projektstamm ist nur der Vite-Einstieg und allein keine fertige statische App.

## Auf iPhone/iPad testen

Die veröffentlichte HTTPS-Adresse zuerst einmal online in Safari öffnen. Danach über **Teilen → Zum Home-Bildschirm** installieren. Anschließend mindestens Touch, Hoch-/Querformat, deutsche/türkische Stimme, Mikrofonfreigabe bei „Sprich mit Mino“, App-Unterbrechung/Wiederaufnahme und einen Start im Flugmodus prüfen.

Sterne und Lernfortschritt werden pro Browser/Gerät lokal gespeichert. Für einen Gerätewechsel gibt es im Elternbereich Familien-Backup und Wiederherstellung.

Für Weiterentwicklung zuerst `docs/HANDOFF_SUMMARY.md`, `docs/MASTER_PROMPT_FOR_WORK.md` und `docs/ROADMAP.md` lesen.
