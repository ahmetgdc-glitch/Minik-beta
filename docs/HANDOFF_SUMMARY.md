# MINIK — aktueller Entwicklungsstand

Stand: **10. September 2026 · 1.65.0 Beta 66**. Der langfristige Nutzerauftrag steht in `MASTER_PROMPT_FOR_WORK.md`.

## Aktueller Umfang

- 25 Lernwelten
- 503 zweisprachige DE/TR-Lernobjekte
- 23 Spieltypen
- bis zu 8 getrennte Kinderprofile, Altersgruppen 2–3 / 4–5 / 6+
- adaptive Schwierigkeit, Mastery pro Begriff/Sprache und Spaced Repetition
- Sterne, XP, Tagesreise, Aquarium, Achievements und Mino-Outfits
- Elternbereich mit Rechengate/PIN, Wochenanalyse, Backup/Restore und Einstellungen
- lokale/systembasierte DE/TR-Sprachausgabe, WebAudio und „Sprich mit Mino“
- installierbare PWA, Offline-Service-Worker, Recovery-Speicher und Session-Checkpoints

## Zuletzt als Final-Härtung umgesetzt

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
- neuer `npm run preflight` prüft Release-Metadaten, Dokumentation, Inhaltsumfang, Manifest und Deploymentworkflow
- GitHub Actions archiviert den geprüften Produktionsbuild zusätzlich als `minik-production-build`

## Prüfung

**203/203 automatisierte Tests bestanden.** `scripts/validate-content.mjs` bestätigt 25 Welten, 503 DE/TR-Items, 23 Spieltypen und alle lokalen Assets.

Der frühere Service-Worker-/Offline-Vertrag wurde bereits für `/` und `/Minik-2.0-/` simuliert. Im aktuellen Quellarbeitsordner wird bewusst kein alter `dist/` verwendet; eine neue `verify:build`-Prüfung ist erst nach einem frischen Vite-Build sinnvoll.

## Bekannter Umgebungsblocker

Die lokale Containerkopie der npm-Abhängigkeiten ist leer/unvollständig (`vite: not found`) und normaler Registry-Zugriff ist in dieser Umgebung nicht verfügbar. Daher einen lokalen Produktionsbuild **nicht** als bestanden ausgeben. GitHub Actions nutzt einen sauberen Node-22-Runner mit `npm ci`, danach `npm test`, `npm run preflight`, `npm run build` und `npm run verify:build`.

## Noch nicht als erledigt behaupten

- kein echter GitHub-Actions-/Pages-Lauf dieses aktuellen Standes verifiziert
- kein physischer iPhone-/iPad-Test für Mikrofon, Systemstimmen, PWA und Flugmodus
- keine pädagogische Langzeit-/Fachprüfung

## Weiterarbeit

Ab jetzt Finalisierung priorisieren: reale Releaseblocker, Datenintegrität, Navigations-/Lifecyclefälle, Geräte-QA und Produktionsdeployment. Nicht wieder zu kleinen Quizkarten zurückbauen und nicht künstlich Funktionen hinzufügen, nur um die Featurezahl zu erhöhen.
