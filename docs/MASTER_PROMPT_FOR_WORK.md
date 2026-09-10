# MASTER PROMPT – MINIK

Du arbeitest an **MINIK**, einer großen bilingualen Lern-App für Kleinkinder (Deutsch + Türkisch).

## Produktziel
Baue MINIK zu einer vollwertigen Kinder-Lernwelt aus, deren Funktionsumfang und Spielgefühl mit großen Lern-Apps wie Keiki World und Tohum Eğitim konkurrieren kann. Kopiere keine geschützten Designs, Figuren, Texte, Sounds, Bilder oder exakten Screens. Nutze eigene Gestaltung und eigene Lerninhalte.

## Grundprinzipien
1. **Kind zuerst:** 2–6 Jahre, kaum Lesefähigkeit voraussetzen.
2. **Sehr große Elemente:** Tiere, Fotos, Symbole und Buttons müssen auf iPhone/iPad groß, klar und leicht antippbar sein.
3. **Nicht wie eine Website:** Vollbild-Spielgefühl, Animationen, kurze Aufgaben, Sounds, unmittelbares Feedback.
4. **Deutsch + Türkisch vollständig:** Jeder sichtbare Text und jede Lernanweisung zweisprachig.
5. **Mino, der Fisch:** zentrale Figur, animierter Helfer, erklärt, motiviert und gibt Hinweise.
6. **Sterne und Belohnungen:** Sterne, Serien, Schatztruhen, Level, Aquarium, Mino-Zubehör und freischaltbare Welten.
7. **Echte Menschen:** Neben Illustrationen auch echte, lizenzierte/selbst erzeugte Fotos von Menschen, Emotionen, Körperteilen, Berufen und Alltagssituationen.
8. **Kostenlose natürliche Stimme zuerst:** Web Speech API / hochwertige lokal installierte Apple-Systemstimmen bevorzugen. Kein API-Key im Frontend. Architektur so bauen, dass später ein sicherer Cloud-TTS-Endpunkt ergänzt werden kann.
9. **Adaptive Hilfe:** nach Inaktivität oder wiederholten Fehlern hilft Mino schrittweise.
10. **Elternbereich:** Fortschritt, schwierige Wörter, Sitzungen, Kategorien, Sprache, Schwierigkeit, Audio, Anzahl Antwortoptionen.
11. **Offline/PWA:** Kernspiele offline nutzbar; große Assets können später paketweise geladen werden.
12. **GitHub Pages:** jeder stabile Stand muss deploybar bleiben.

## Spielkatalog – Ziel
Mindestens folgende Spieltypen modular umsetzen:
- Hören und antippen
- Bild → Wort
- Wort → Bild
- Drag & Drop Zuordnen
- Sortieren nach Kategorie
- Memory
- Puzzle
- Schatten / Silhouette zuordnen
- Was fehlt?
- Unterschiede finden
- Reihenfolge
- Muster fortsetzen
- Groß / klein
- Farben
- Formen
- Zählen 1–20
- Mengen zuordnen
- Zahlen nachfahren
- Buchstaben nachfahren
- Anfangslaut
- Tiergeräusch erkennen
- Alltagsgeräusche erkennen
- Gefühle erkennen
- Körperteile
- Handlungen / Verben
- Berufe
- Familie / Menschen
- Kleidung
- Essen
- Fahrzeuge
- Zuhause
- Draußen / Natur
- Gegensätze
- Geschichten mit Fragen
- Rhythmus / Musik
- Malen
- Nachsprechen / Aussprache
- einfache soziale Situationen
- Sequenzen wie Zähneputzen / Anziehen

## Lernwelten – Ziel
Mindestens 25 Welten, jede mit mehreren Stufen. Beispiele:
Tiere, Farben, Formen, Zahlen, Buchstaben, Körper, Gefühle, Menschen, Familie, Berufe, Essen, Obst, Gemüse, Fahrzeuge, Kleidung, Zuhause, Küche, Bad, Spielplatz, Natur, Wetter, Handlungen, Gegensätze, Geräusche, Geschichten, Musik.

## Mino-Hilfesystem
- 5–7 Sek. Inaktivität: kleine visuelle Bewegung.
- 10–12 Sek.: Mino fragt nach Hilfe.
- 2 falsche Antworten: ein falsches Element ausblenden oder Ziel dezent animieren.
- 3 falsche Antworten: Mino zeigt eine eindeutige Demonstration, danach neue Runde.
- Niemals beschämen. Falschantwort-Text z. B. DE „Schau noch einmal.“ / TR „Bir daha bak.“
- Richtige Antwort: positives Feedback, Sternanimation, kurze Variation der Lobtexte.

## Stimme
Implementiere einen Voice-Service mit:
- kostenlose lokale Web-Speech-Stimmen als Default
- bevorzugte DE/TR-Stimmen anhand Sprache, localService und Namen
- Voice-Auswahl im Elternbereich
- Rate/Pitch steuerbar
- keine überlappende Sprachausgabe
- Cache/Preload der Voice-Liste
- optionales Interface `cloudTTS(text, lang)` ohne Secret im Client

## Visuelles Design
- eigene MINIK-Identität
- weiche, farbenfrohe 3D/2D-Kinderoptik
- große abgerundete Karten
- möglichst wenig Text
- Charakteranimationen
- klare Zustände für richtig/falsch
- 44px Mindest-Touchfläche, bei Spielen deutlich größer
- Bilder möglichst 35–60% der sichtbaren Bildschirmhöhe
- keine winzigen Emoji-Quizkarten als Haupt-Spielgefühl

## Datenmodell
Trenne strikt:
- UI
- Games
- Content
- Progress
- Rewards
- Audio
- Asset metadata
- Parent analytics
So können später Tausende Items ergänzt werden.

## Arbeitsweise
1. Lies alle Dateien im Repository.
2. Prüfe zuerst, ob die aktuelle Version läuft.
3. Arbeite die ROADMAP in Releases ab.
4. Nach jedem Release: `npm run build`.
5. Keine Dummy-Navigation, die immer dasselbe Spiel öffnet.
6. Jede sichtbare Welt muss entweder funktionieren oder klar als gesperrt markiert sein.
7. Vermeide riesige Monolith-Dateien.
8. Halte Assets und Content datengetrieben.
9. Aktualisiere README und CHANGELOG.
10. Hinterlasse einen klaren nächsten Schritt.

## Definition of Done für die erste große Version
- mindestens 12 tatsächlich unterschiedliche Minispiele
- mindestens 12 Lernwelten mit echten unterschiedlichen Inhalten
- mindestens 250 Lernobjekte DE/TR
- adaptive Schwierigkeit 2/4/6 Antwortoptionen
- Mino-Hilfe funktioniert
- Sterne, Level, Schatztruhen, Aquarium
- Eltern-Dashboard
- Session-/Fortschrittsspeicherung
- echtes Foto-Contentmodell neben Illustration
- iPhone-Layout geprüft
- GitHub Pages Build funktioniert
