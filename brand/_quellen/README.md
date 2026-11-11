# Quellen der Logo-Master

`build.py` schreibt alle SVG-Master nach `brand/logo/svg/` und die Masse nach `spec.json`.
Es liest die freigegebenen Dateien von Runde 4 (`../../../brand-concepts/round4-farben/5-tartan/a-*.svg`, Logo A · Schnitt,
Palette Tartan v2) und Manrope aus `node_modules/@fontsource/manrope`. Die Geometrie wird nicht verändert, nur Farbe,
Titel und Beschreibung. Der Claim wird mit Manrope 600 als Outlines gesetzt.

## Neu bauen

Aus dem Repo-Ordner, mit einer Python-Umgebung ab Python 3.9 (einmal anlegen):

```bash
python3 -m venv ~/.venvs/sponsuno-logo
~/.venvs/sponsuno-logo/bin/pip install fonttools brotli skia-pathops pillow
~/.venvs/sponsuno-logo/bin/python -I brand/_quellen/build.py
```

`build.py` braucht `node_modules/@fontsource/manrope` (nach `npm install` vorhanden).

Liegen die Runde-4-Dateien woanders, den Ordner mit `SPONSUNO_ROUND4=/pfad/zu/5-tartan` angeben.

## Prüfen

Optional, falls die logo-design-Skill installiert ist (sie liegt nicht im Repo):

```bash
python3 <pfad-zur-skill>/scripts/svg_audit.py brand/logo/svg/*.svg
```

`vorschau/` enthält je ein PNG pro Master auf dem richtigen Grund (nur zum Anschauen, keine Lieferdateien).

## Exporte (PNG, PDF, Icons, Social)

`export.py` macht aus den SVG-Mastern alle Lieferdateien. Es liest nur `brand/logo/svg/` und `spec.json`, verändert
keine Geometrie und braucht headless Chrome (oder Chromium, Edge, Brave; anderer Pfad mit `CHROME=/pfad/zu/chrome`)
sowie fontTools aus derselben Python-Umgebung wie `build.py`. Nach jedem `build.py` neu laufen lassen. Dauer etwa 45 s.

```bash
~/.venvs/sponsuno-logo/bin/python -I brand/_quellen/export.py
```

Es schreibt:

- `logo/png/`: transparente PNGs, Wortmarken (auch mit Claim) 600 und 1800 px breit, Symbole und Kachel 512 und
  1024 px, der Kleinschnitt `symbol-klein` 16 und 24 px (ab 32 px gilt der Master). Rahmen = viewBox des Masters.
- `logo/pdf/`: Vektor-PDFs (keine Rasterbilder, Farben exakt als sRGB) für Druckerei, Stick und Textil:
  `wortmarke-farbe`, `wortmarke-dunkel` (auf Navy-Seite), `wortmarke-schwarz` (Tinte 120 mm breit),
  `symbol-farbe` (S 40 mm hoch), `symbol-kachel` (60 mm). Seite = Tintenkante plus Schutzraum (X bzw. Y), bei der
  Kachel die Kachel selbst. Die PDFs sind RGB: CMYK- und Pantone-Werte aus `spec.json` setzt die Druckerei
  (Pantone approximativ, mit gedrucktem Muster prüfen).
- `icons/`: `favicon.ico` (16 px aus `symbol-kachel-klein`, 32 und 48 px aus `symbol-kachel`), `favicon.svg`
  (Kopie von `symbol-kachel-klein`), `apple-touch-icon.png` (180,
  vollflächig Navy, iOS rundet selbst), `icon-192.png` und `icon-512.png` (abgerundete Kachel, transparente Ecken),
  `icon-maskable-512.png` (vollflächig, S liegt in der 80-%-Safe-Zone), `site.webmanifest` und `head-snippet.html`
  (Beispiel; beides fürs Web-Root). `icon-512.png` ist dasselbe Bild wie `logo/png/symbol-kachel-512.png`. Die
  Dateien in `icons/` nie von Hand bearbeiten, sonst laufen die Kopien auseinander.
- `social/`: `profilbild-1080.png` (S auf Navy, kreisrund beschneidbar), `linkedin-banner-1584x396.png`
  (Wortmarke mit Claim mittig, weil LinkedIn links unten das Profilbild darüberlegt), `og-bild-1200x630.png`
  (Aufbau wie `scripts/og/og-image.html`: `wortmarke-hell`, Claim, «Bald verfügbar in der Deutschschweiz», Domain),
  `e-mail-signatur.png` (`wortmarke-navy` mit Schutzraum X rundum, 480 × 166 auf Weiss, mit `width="240"` einbinden).

Am Ende prüft das Skript Pixelmasse, Dateigrössen (unter 1 MB), Seitenzahl der PDFs und dass die PDFs nur Vektorpfade
enthalten; bei einem Fehler endet es mit Exit-Code 1.
