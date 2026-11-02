# Sponsuno – Startseite

Statische Startseite für Sponsuno (Stand 2. November 2026). Farben, Schriften und Ton folgen dem Sponsuno CD Manual v1.0 und den Projektregeln des Teams (AGENTS.md, nicht im Repo).

## Lokal starten

```bash
python3 -m http.server 4317
```

Im Repo-Ordner ausführen, dann http://localhost:4317 öffnen. Die Seite muss über einen Server laufen (nicht per Doppelklick), weil das 3D-Emblem das Logo-SVG per `fetch` lädt.

## Aufbau

- `index.html` – Inhalt und Struktur
- `styles.css` – Design-Tokens aus dem CD Manual, Layout, Responsive
- `js/main.js` – GSAP/ScrollTrigger-Animationen, Lenis-Scrollen, Header, Menü, Match-Animation im Hero, FAQ, Warteliste
- `js/silk.js` – WebGL-Shader-Hintergrund (Navy im Hero, Gold im Sachleistungen-Teil)
- `js/emblem.js` – 3D-Emblem aus dem Logo-SVG (Three.js, wird erst geladen, wenn man in die Nähe scrollt)
- `assets/` – Logos aus dem CD-Ordner, Symbolbild aus der Persona-Grafik (KI-generiert)
- `_source/` – Projektmaterial (Interviews, CD, Pitch); nur lokal, per `.gitignore` ausgeschlossen

## Offen vor einer Veröffentlichung

- Warteliste: Das Formular speichert noch nichts. In `js/main.js` `WAITLIST_ENDPOINT` auf einen Dienst setzen, der `{ rolle, email }` per JSON-POST annimmt (z. B. Formspree).
- Impressum und Datenschutzerklärung fehlen. Beides ist nötig, sobald E-Mail-Adressen gesammelt werden.
- Provisionshöhe, Auslöser und zahlende Seite sind laut AGENTS.md offen; die Texte sagen das so.
- Das 3D-Emblem und der Wortmarken-Effekt im Footer setzen das Logo mit Licht und Glanz in Szene. Das CD Manual sagt «keine Effekte» beim Logo; das mit Maurice (Branding) abstimmen.

## Designreferenzen (Mobbin)

- Function – «How it works» mit Serifen und Schritt-Kapiteln
- Trawelt – grosse Schrittziffern
- Upwork – Aufteilung nach Zielgruppen
- Superhuman, Intercom – KI-Assistent mit Vorschau-Panel
- Origin, Slash – dunkler Hero mit Serifentitel
- Base – Wartelisten-Abschnitt
