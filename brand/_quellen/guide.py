#!/usr/bin/env python3
"""Baut den Logo-Guide (brand/logo-guide/) aus den SVG-Mastern und spec.json.

Schreibt:
  brand/logo-guide/logo-guide.html      2 Seiten A4 quer, eigenständig (Logos inline, Schriften und Foto eingebettet)
  brand/logo-guide/logo-guide.pdf       Vektor-PDF (headless Chrome, --print-to-pdf)
  brand/logo-guide/logo-guide-seite-1.png, -seite-2.png   Bildschirmfotos der beiden Seiten
und erneuert in brand/README.md die Dateiliste zwischen <!-- dateien:start --> und <!-- dateien:end -->.

Aus dem Repo-Ordner:
  <python mit fonttools und pillow> -I brand/_quellen/guide.py
  <python> -I brand/_quellen/guide.py --nur-liste     (nur die Dateiliste im README, ohne Chrome)
Ohne Pillow wird das Foto nicht verkleinert und die PNGs nicht nachoptimiert; alles andere läuft.
Die Logo-Geometrie wird nur gelesen, nie verändert (Quelle: brand/logo/svg/).
"""
import base64
import html
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(HERE)
REPO = os.path.dirname(BRAND)
SVG_DIR = os.path.join(BRAND, "logo", "svg")
OUT = os.path.join(BRAND, "logo-guide")
FONTS = os.path.join(REPO, "src", "assets", "fonts")
PHOTO = os.path.join(REPO, "src", "assets", "photos", "audience-athlete.jpg")
CHROME = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")

SPEC = json.load(open(os.path.join(HERE, "spec.json"), encoding="utf-8"))
C = {c["name"]: c for c in SPEC["colours"]}
NAVY, TARTAN, TARTAN_HELL = C["Navy"]["hex"], C["Tartan"]["hex"], C["Tartan hell"]["hex"]
IVORY, PAPIER, AKZENT = C["Ivory"]["hex"], C["Papier"]["hex"], C["Text-Akzent"]["hex"]
INK = "#3B4560"   # Fliesstext, wie --ink der Website
RULE = "#D9D2C1"  # Haarlinien, wie --rule der Website

# ------------------------------------------------------------------ Master lesen

PATH_RE = re.compile(r'<path\s+fill="(#[0-9A-Fa-f]{6})"\s+d="([^"]+)"\s*/>')


def load(name):
    raw = open(os.path.join(SVG_DIR, name + ".svg"), encoding="utf-8").read()
    vb = re.search(r'viewBox="([^"]+)"', raw).group(1)
    return vb, PATH_RE.findall(raw)


MASTERS = {os.path.splitext(f)[0]: load(os.path.splitext(f)[0]) for f in sorted(os.listdir(SVG_DIR)) if f.endswith(".svg")}


def ink_box(name):
    """Tintenkante (exakt, über fontTools) aller Pfade ausser einer Kachel."""
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.svgLib.path import parse_path
    pen = BoundsPen(None)
    for fill, d in MASTERS[name][1]:
        if d.startswith("M52 0H204"):  # Kachel
            continue
        parse_path(d, pen)
    x0, y0, x1, y1 = pen.bounds
    return x0, y0, x1 - x0, y1 - y0


INK_BOX = {n: ink_box(n) for n in MASTERS}


def vb_str(box, pad=0.0):
    x, y, w, h = box
    return f"{x - pad:.2f} {y - pad:.2f} {w + 2 * pad:.2f} {h + 2 * pad:.2f}"


def mark(name, width=None, height=None, view="ink", fills=None, stroke=None, style="", cls="mk"):
    """Master als Inline-SVG. view="ink": viewBox = Tintenkante, so stimmt width in mm genau mit der Tintenbreite."""
    full_vb, paths = MASTERS[name]
    vb = full_vb if view == "file" else vb_str(INK_BOX[name])
    size = ""
    if width:
        size += f"width:{width}mm;"
    if height:
        size += f"height:{height}mm;"
    body = []
    for i, (fill, d) in enumerate(paths):
        f = fills[i] if fills and i < len(fills) and fills[i] else fill
        if stroke:
            body.append(f'<path d="{d}" fill="none" stroke="{stroke[0]}" stroke-width="{stroke[1]}" stroke-linejoin="round"/>')
        else:
            body.append(f'<path fill="{f}" d="{d}"/>')
    return (f'<svg class="{cls}" viewBox="{vb}" style="{size}{style}" aria-hidden="true" '
            f'preserveAspectRatio="xMidYMid meet">{"".join(body)}</svg>')


# ------------------------------------------------------------------ eingebettete Dateien

def data_uri(path, mime):
    return f"data:{mime};base64," + base64.b64encode(open(path, "rb").read()).decode("ascii")


def photo_uri():
    try:
        from PIL import Image
    except ImportError:
        return data_uri(PHOTO, "image/jpeg")
    im = Image.open(PHOTO).convert("RGB")
    im.thumbnail((520, 520))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=78, optimize=True, progressive=True)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def font_faces():
    faces = [("Manrope", 400, "manrope-400"), ("Manrope", 600, "manrope-600"),
             ("Cormorant Garamond", 600, "cormorant-garamond-600")]
    out = []
    for fam, wt, f in faces:
        out.append(f"@font-face{{font-family:'{fam}';font-weight:{wt};font-style:normal;"
                   f"src:url('{data_uri(os.path.join(FONTS, f + '.woff2'), 'font/woff2')}') format('woff2');}}")
    return "\n".join(out)


# ------------------------------------------------------------------ Bausteine

def esc(s):
    return html.escape(s, quote=False)


def tile(inner, ground, label, sub="", w=None, h=None, cls=""):
    st = f"background:{ground};"
    if w:
        st += f"width:{w}mm;"
    if h:
        st += f"height:{h}mm;"
    border = " hairline" if ground.upper() in (PAPIER.upper(), "#FFFFFF", IVORY.upper()) else ""
    cap = f'<figcaption><b>{esc(label)}</b>{(" " + esc(sub)) if sub else ""}</figcaption>' if label else ""
    return f'<figure class="tile {cls}"><div class="ground{border}" style="{st}">{inner}</div>{cap}</figure>'


CHECK = ('<svg class="badge ok" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="#1F6B4A"/>'
         '<path d="M5.5 10.3 8.6 13.3 14.6 6.9" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" '
         'stroke-linejoin="round"/></svg>')
CROSS = ('<svg class="badge no" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="10" fill="#B3261E"/>'
         '<path d="M6.4 6.4 13.6 13.6M13.6 6.4 6.4 13.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>')


def example(inner, ground, caption, ok, extra_style=""):
    badge = CHECK if ok else CROSS
    border = " hairline" if ground.upper() in (PAPIER.upper(), "#FFFFFF", IVORY.upper()) else ""
    strike = "" if ok else '<span class="strike" aria-hidden="true"></span>'
    return (f'<figure class="ex {"ok" if ok else "no"}"><div class="ground{border}" style="background:{ground};{extra_style}">'
            f'{inner}{strike}{badge}</div><figcaption>{esc(caption)}</figcaption></figure>')


def head(page):
    return (f'<header class="top">{mark("wortmarke-navy", width=21)}<span class="sep"></span>'
            f'<span class="doc">Logo-Guide</span>'
            f'<span class="meta">Logo A · Schnitt · Palette Tartan · Stand November 2026 · Seite {page} von 2</span></header>')


FOOT = ('<footer class="bottom">Master: <code>brand/logo/svg/</code> · Regeln, Farben und Dateiliste: '
        '<code>brand/README.md</code> · Texte zur Marke: <code>brand/markentexte.md</code></footer>')


# ------------------------------------------------------------------ Seite 1: Versionen und Farben

PANTONE_SHORT = {
    "Navy": "ca. PMS 289 C",
    "Tartan": "ca. PMS 7599 C (7599 bis 7618 C)",
    "Tartan hell": "ca. PMS 7579 C oder 7618 C",
    "Ivory": "Papierweiss; auf Textil ca. PMS 9224 C (unsicher)",
    "Papier": "Papierweiss, nicht drucken",
    "Text-Akzent": "wie Tartan (im Druck Tartan nehmen)",
}
USE_SHORT = {
    "Navy": "S oben und «ponsuno» auf hellem Grund. Dunkler Grund.",
    "Tartan": "S unten auf hellem Grund.",
    "Tartan hell": "S unten auf Navy. Nie auf hellem Grund.",
    "Ivory": "S oben und «ponsuno» auf Navy. Helles Band.",
    "Papier": "Heller Grund.",
    "Text-Akzent": "Tartan für Text und Links auf hellem Grund.",
}


def colour_rows():
    rows = []
    for c in SPEC["colours"]:
        n = c["name"]
        cm = c["cmyk_coated_approx"]
        light = n in ("Ivory", "Papier")
        rows.append(
            f'<div class="col"><div class="sw{" hairline" if light else ""}" style="background:{c["hex"]}"></div>'
            f'<div class="ct"><b>{esc(n)}</b> <span class="hex">{c["hex"]}</span>'
            f'<span class="vals">RGB {" ".join(str(v) for v in c["rgb"])} · CMYK {cm["c"]} {cm["m"]} {cm["y"]} {cm["k"]}*'
            f'<br>Pantone {esc(PANTONE_SHORT[n])}*</span>'
            f'<span class="use">{esc(USE_SHORT[n])}</span></div></div>')
    return "\n".join(rows)


def page1():
    sym_one = (f'<div class="split"><div style="background:#FFFFFF" class="half">'
               f'{mark("symbol-navy", height=5.6)}{mark("symbol-tartan", height=5.6)}{mark("symbol-schwarz", height=5.6)}</div>'
               f'<div style="background:{NAVY}" class="half">{mark("symbol-hell", height=5.6)}{mark("symbol-weiss", height=5.6)}</div></div>')
    small = (f'<div class="row-c">{mark("symbol-kachel-klein", width=9, view="file")}'
             f'{mark("symbol-klein", width=7, view="file")}</div>')
    return f"""
<section class="page" id="seite-1">
{head(1)}
<div class="intro">
  <h1>Zwei Seiten, eine Linie.</h1>
  <p>Die Lücke im S ist die Linie, auf der sich zwei Seiten treffen: Sportlerinnen, Sportler und Vereine auf der
  einen, Firmen aus der Region auf der anderen. Die Wortmarke ist das Logo. Das Symbol steht nur dort, wo die
  Wortmarke keinen Platz hat: Favicon, App-Icon, Profilbild.</p>
</div>
<div class="p1">
  <div class="logos">
    <h2>Wortmarke</h2>
    <div class="grid g2">
      {tile(mark("wortmarke-farbe", width=62), PAPIER, "wortmarke-farbe", "Standard auf Papier, Weiss und Ivory. S oben Navy, unten Tartan.", h=33)}
      {tile(mark("wortmarke-dunkel", width=62), NAVY, "wortmarke-dunkel", "Auf Navy. S oben Ivory, unten Tartan hell, leicht dünner geschnitten.", h=33)}
    </div>
    <div class="grid g4">
      {tile(mark("wortmarke-navy", width=34), "#FFFFFF", "wortmarke-navy", "Einfarbig auf Hell, wenn das S unter ca. 60 px hoch ist.", h=17)}
      {tile(mark("wortmarke-hell", width=34), NAVY, "wortmarke-hell", "Einfarbig auf Navy, S unter ca. 60 px (Website-Header).", h=17)}
      {tile(mark("wortmarke-schwarz", width=34), "#FFFFFF", "wortmarke-schwarz", "Einfarbig, z. B. Stempel, Zeitung.", h=17)}
      {tile(mark("wortmarke-weiss", width=34), NAVY, "wortmarke-weiss", "Siebdruck, Stick, Folie auf dunklem Textil.", h=17)}
    </div>
    <h2>Mit Claim</h2>
    <div class="grid g2">
      {tile(mark("wortmarke-claim-farbe", width=52), IVORY, "wortmarke-claim-farbe", "Ab 240 px Breite, im Druck ab 50 mm.", h=27)}
      {tile(mark("wortmarke-claim-dunkel", width=52), NAVY, "wortmarke-claim-dunkel", "Dasselbe auf Navy.", h=27)}
    </div>
    <h2>Symbol <span class="h2note">nur wo die Wortmarke nicht passt</span></h2>
    <div class="grid g5">
      {tile(mark("symbol-farbe", height=15), PAPIER, "symbol-farbe", "ab 32 px", h=22)}
      {tile(mark("symbol-dunkel", height=15), NAVY, "symbol-dunkel", "auf Navy", h=22)}
      {tile(mark("symbol-kachel", width=17, view="file"), PAPIER, "symbol-kachel", "App-Icon, Profilbild", h=22)}
      {tile(small, PAPIER, "Kleinschnitt", "16 bis 31 px, Favicon", h=22)}
      {tile(sym_one, "#FFFFFF", "Einfarbig:", "Navy, Tartan, Schwarz, Hell, Weiss", h=22, cls="flush")}
    </div>
  </div>
  <aside class="colours">
    <h2>Farben</h2>
    {colour_rows()}
    <p class="fn">Hälften: auf hellem Grund oben Navy, unten Tartan. Auf Navy oben Ivory, unten Tartan hell.</p>
    <p class="fn">* CMYK und Pantone sind Näherungswerte. Vor jedem Druck mit gedrucktem Farbmuster prüfen.</p>
  </aside>
</div>
{FOOT}
</section>"""


# ------------------------------------------------------------------ Seite 2: Schutzraum, Grössen, Einsatz

def clear_space_wordmark(width_mm):
    X = SPEC["clear_space"]["wordmark"]["units"]
    ix, iy, iw, ih = INK_BOX["wortmarke-navy"]
    W, H = iw + 2 * X, ih + 2 * X
    base = SPEC["wordmark"]["baseline_units"]
    xh = SPEC["wordmark"]["x_height_units"]
    paths = "".join(f'<path fill="{f}" d="{d}"/>' for f, d in MASTERS["wortmarke-farbe"][1])
    t = TARTAN
    ns = 'vector-effect="non-scaling-stroke"'
    y_top, y_base = X + (base - xh - iy), X + (base - iy)

    def sq(x, y):
        return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{X:.1f}" height="{X:.1f}" fill="none" stroke="{t}" stroke-width="1" {ns}/>'
                f'<text x="{x + X / 2:.1f}" y="{y + X / 2 + 20:.1f}" text-anchor="middle" class="xl">X</text>')
    bx = W - X + 34
    return f"""<svg class="diag" viewBox="0 0 {W:.1f} {H:.1f}" style="width:{width_mm}mm" aria-hidden="true">
<rect width="{W:.1f}" height="{H:.1f}" fill="{t}" fill-opacity=".08"/>
<rect x="{X:.1f}" y="{X:.1f}" width="{iw:.1f}" height="{ih:.1f}" fill="{PAPIER}"/>
<rect width="{W:.1f}" height="{H:.1f}" fill="none" stroke="{t}" stroke-width="1" stroke-dasharray="4 3" {ns}/>
<rect x="{X:.1f}" y="{X:.1f}" width="{iw:.1f}" height="{ih:.1f}" fill="none" stroke="{NAVY}" stroke-opacity=".35" stroke-width=".75" stroke-dasharray="2 2" {ns}/>
<line x1="{X + 330:.1f}" y1="{y_top:.1f}" x2="{bx:.1f}" y2="{y_top:.1f}" stroke="{t}" stroke-width=".75" stroke-dasharray="2 2" {ns}/>
<line x1="{X + 330:.1f}" y1="{y_base:.1f}" x2="{bx:.1f}" y2="{y_base:.1f}" stroke="{t}" stroke-width=".75" stroke-dasharray="2 2" {ns}/>
<g transform="translate({X - ix:.2f} {X - iy:.2f})">{paths}</g>
<path d="M{bx - 22:.1f} {y_top:.1f}H{bx + 22:.1f}M{bx:.1f} {y_top:.1f}V{y_base:.1f}M{bx - 22:.1f} {y_base:.1f}H{bx + 22:.1f}" stroke="{t}" stroke-width="1.2" fill="none" {ns}/>
<text x="{bx + 30:.1f}" y="{(y_top + y_base) / 2 + 20:.1f}" text-anchor="start" class="xl">X</text>
{sq(0, X + (ih - X) / 2)}{sq(X + iw * 0.42, 0)}{sq(X + iw * 0.42, H - X)}
</svg>"""


def clear_space_symbol(height_mm):
    Y = SPEC["clear_space"]["symbol"]["units"]
    ix, iy, iw, ih = INK_BOX["symbol-farbe"]
    W, H = iw + 2 * Y, ih + 2 * Y
    paths = "".join(f'<path fill="{f}" d="{d}"/>' for f, d in MASTERS["symbol-farbe"][1])
    ns = 'vector-effect="non-scaling-stroke"'

    def sq(x, y):
        return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{Y:.1f}" height="{Y:.1f}" fill="none" stroke="{TARTAN}" stroke-width="1" {ns}/>'
                f'<text x="{x + Y / 2:.1f}" y="{y + Y / 2 + 9:.1f}" text-anchor="middle" class="yl">Y</text>')
    return f"""<svg class="diag" viewBox="0 0 {W:.1f} {H:.1f}" style="height:{height_mm}mm" aria-hidden="true">
<rect width="{W:.1f}" height="{H:.1f}" fill="{TARTAN}" fill-opacity=".08"/>
<rect x="{Y:.1f}" y="{Y:.1f}" width="{iw:.1f}" height="{ih:.1f}" fill="{PAPIER}"/>
<rect width="{W:.1f}" height="{H:.1f}" fill="none" stroke="{TARTAN}" stroke-width="1" stroke-dasharray="4 3" {ns}/>
<g transform="translate({Y - ix:.2f} {Y - iy:.2f})">{paths}</g>
{sq(0, Y + (ih - Y) / 2)}{sq(Y + (iw - Y) / 2, 0)}
</svg>"""


def page2():
    photo = photo_uri()
    ph = f"background-image:url('{photo}');background-size:cover;background-position:center 40%;"
    navy_panel = (f'<div class="panel">{mark("wortmarke-dunkel", width=26)}</div>')
    swap = [TARTAN, NAVY]
    dos = "".join([
        example(mark("wortmarke-farbe", width=34), PAPIER, "Farbversion auf Papier, Weiss oder Ivory", True),
        example(mark("wortmarke-dunkel", width=34), NAVY, "Auf Navy die dunkel-Version", True),
        example(navy_panel, "#556B3A", "Auf Fotos nur auf einer Navy-Fläche", True, ph),
    ])
    donts = "".join([
        example(mark("symbol-farbe", height=13, fills=[NAVY, "#2F7D4F"]), PAPIER, "Hälften nicht umfärben", False),
        example(mark("symbol-farbe", height=13, fills=swap), PAPIER, "Farben nicht tauschen", False),
        example(mark("wortmarke-farbe", width=28, style="transform:rotate(-14deg)"), PAPIER, "Nicht drehen oder kippen", False),
        example(mark("wortmarke-farbe", width=28, style="filter:drop-shadow(1.2mm 1.2mm .8mm rgba(11,24,48,.55))"), PAPIER,
                "Keine Schatten, Verläufe, Effekte", False),
        example(mark("wortmarke-navy", width=28, stroke=[NAVY, 9]), PAPIER, "Nicht als Kontur", False),
        example(mark("wortmarke-farbe", width=20, style="transform:scaleX(1.5)"), PAPIER, "Nicht strecken oder stauchen", False),
        example(mark("wortmarke-farbe", width=28), "#D52B1E", "Tartan-Hälfte nicht auf rotem Grund", False),
        example(mark("wortmarke-farbe", width=28), "#556B3A", "Nie direkt auf Fotos", False, ph),
        example(f'<span class="fake">Sponsuno</span>', PAPIER, "Namen nicht in anderer Schrift setzen", False),
        example(f'<div class="lock">{mark("symbol-farbe", height=6.2)}{mark("wortmarke-farbe", width=24)}</div>', PAPIER,
                "Kein Symbol vor der Wortmarke", False),
    ])
    sizes = f"""
      <div class="tsg">
        <span>Wortmarke<br><b>25 mm</b></span><div>{mark("wortmarke-farbe", width=25)}</div>
        <span>Mit Claim<br><b>50 mm</b></span><div>{mark("wortmarke-claim-farbe", width=50)}</div>
        <span>Symbol<br><b>8 mm</b></span><div>{mark("symbol-farbe", width=8, view="file")}</div>
        <span>Kleinschnitt<br><b>5 mm</b></span><div>{mark("symbol-klein", width=5, view="file")}</div>
      </div>
      <p class="note">Im PDF in Originalgrösse (Breite der Wortmarke, Kantenlänge der Symboldatei). Unter 8 mm den
      Kleinschnitt nehmen, unter 5 mm kein Symbol.</p>
      <table class="mins">
        <tr><th>Bildschirm</th><th></th></tr>
        <tr><td>Wortmarke</td><td>ab 96 px breit</td></tr>
        <tr><td>Wortmarke mit Claim</td><td>ab 240 px breit</td></tr>
        <tr><td>Symbol und Kachel</td><td>ab 32 px</td></tr>
        <tr><td>Kleinschnitt</td><td>16 bis 31 px</td></tr>
        <tr><td>Kleiner als 16 px</td><td>kein Logo</td></tr>
        <tr><td>Stick (Symbol)</td><td>ab ca. 15 mm, Kleinschnitt, Probestick</td></tr>
      </table>"""
    return f"""
<section class="page" id="seite-2">
{head(2)}
<div class="p2top">
  <div class="cs">
    <h2>Schutzraum</h2>
    <div class="csrow">
      <div>{clear_space_wordmark(118)}
        <p class="note"><b>Wortmarke:</b> rundum mindestens X frei. X ist die Höhe des n. Gilt auch für die Version
        mit Claim. Der Rand in der SVG-Datei ist kleiner als X und zählt nicht.</p></div>
      <div class="cssym">{clear_space_symbol(40)}
        <p class="note"><b>Symbol:</b> rundum mindestens Y frei, ein Viertel der S-Höhe. Auf der Kachel ist der
        Schutzraum schon drin.</p></div>
    </div>
    <div class="dos"><h2>So ja</h2><div class="exgrid g3x">{dos}</div></div>
  </div>
  <div class="sizes">
    <h2>Mindestgrössen</h2>
    {sizes}
  </div>
</div>
<div class="donts"><h2>So nicht</h2><div class="exgrid g5x">{donts}</div></div>
{FOOT}
</section>"""


# ------------------------------------------------------------------ CSS und Seite

CSS = f"""
{{FONTS}}
@page {{ size: 297mm 210mm; margin: 0; }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; padding: 0; background: #E9E5DC; }}
body {{ font-family: 'Manrope', 'Avenir Next', 'Segoe UI', Arial, sans-serif; color: {INK}; font-size: 7.2pt; line-height: 1.38;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
.page {{ width: 297mm; height: 210mm; padding: 10mm 13mm 8mm; background: {PAPIER}; position: relative; overflow: hidden;
  display: flex; flex-direction: column; break-after: page; margin: 0 auto 8mm; }}
@media print {{ html, body {{ background: {PAPIER}; }} .page {{ margin: 0; }} }}
.only-1 #seite-2, .only-2 #seite-1 {{ display: none; }}
.only-1 .page, .only-2 .page {{ margin: 0; }}
h1, h2 {{ color: {NAVY}; margin: 0; }}
h1 {{ font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; font-size: 25pt; line-height: 1; letter-spacing: -.01em; }}
h2 {{ font-weight: 600; font-size: 9pt; line-height: 1.2; margin: 0 0 2mm; }}
.h2note {{ font-weight: 400; font-size: 7.2pt; color: {INK}; margin-left: 1.5mm; }}
b {{ font-weight: 600; color: {NAVY}; }}
code {{ font-family: 'Manrope', sans-serif; font-weight: 600; color: {NAVY}; }}
.top {{ display: flex; align-items: center; gap: 3mm; padding-bottom: 3mm; border-bottom: .25mm solid {RULE}; }}
.top .mk {{ display: block; }}
.sep {{ width: .25mm; height: 4.5mm; background: {RULE}; }}
.doc {{ font-weight: 600; color: {NAVY}; font-size: 8.5pt; }}
.meta {{ margin-left: auto; font-size: 6.6pt; }}
.bottom {{ margin-top: auto; padding-top: 2.4mm; border-top: .25mm solid {RULE}; font-size: 6.3pt; }}
.intro {{ display: grid; grid-template-columns: 112mm 1fr; gap: 8mm; align-items: end; margin: 5mm 0 4.5mm; }}
.intro p {{ margin: 0; font-size: 8.2pt; line-height: 1.45; color: {INK}; max-width: 170mm; }}
.p1 {{ display: grid; grid-template-columns: 1fr 74mm; gap: 8mm; }}
.grid {{ display: grid; gap: 3mm; margin-bottom: 3.2mm; }}
.g2 {{ grid-template-columns: 1fr 1fr; }} .g3 {{ grid-template-columns: repeat(3, 1fr); }} .g4 {{ grid-template-columns: repeat(4, 1fr); }} .g5 {{ grid-template-columns: repeat(5, 1fr); }}
.tile {{ margin: 0; }}
.ground {{ border-radius: 1.6mm; display: flex; align-items: center; justify-content: center; gap: 3mm; position: relative; overflow: hidden; }}
.hairline {{ box-shadow: inset 0 0 0 .25mm {RULE}; }}
figcaption {{ font-size: 6.3pt; line-height: 1.32; margin-top: 1.2mm; }}
.mk {{ display: block; flex: none; }}
.flush .ground {{ padding: 0; }}
.split {{ display: flex; width: 100%; height: 100%; }}
.half {{ display: flex; align-items: center; justify-content: space-evenly; gap: 1.2mm; height: 100%; }}
.split .half:first-child {{ flex: 3; }} .split .half:last-child {{ flex: 2.2; }}
.row-c {{ display: flex; align-items: center; gap: 3mm; }}
.colours {{ border-left: .25mm solid {RULE}; padding-left: 6mm; }}
.col {{ display: grid; grid-template-columns: 13mm 1fr; gap: 3mm; margin-bottom: 2.6mm; align-items: start; }}
.sw {{ width: 13mm; height: 13mm; border-radius: 1.4mm; }}
.ct {{ display: flex; flex-direction: column; font-size: 6.4pt; line-height: 1.35; }}
.ct b {{ font-size: 7.4pt; }}
.hex {{ font-weight: 600; color: {NAVY}; }}
.ct b + .hex {{ margin-top: -.2mm; }}
.use {{ color: {INK}; font-style: normal; margin-top: .4mm; }}
.vals {{ color: {INK}; }}
.fn {{ font-size: 6.2pt; margin: 2.4mm 0 0; line-height: 1.38; }}
/* Seite 2 */
.p2top {{ display: grid; grid-template-columns: 1fr 86mm; gap: 8mm; margin-top: 5mm; }}
.csrow {{ display: grid; grid-template-columns: 122mm 1fr; gap: 6mm; align-items: start; }}
.cssym {{ display: flex; flex-direction: column; align-items: flex-start; }}
.diag {{ display: block; }}
.diag text {{ font-family: 'Manrope', sans-serif; font-weight: 600; fill: {TARTAN}; }}
.diag .xl {{ font-size: 58px; }} .diag .yl {{ font-size: 26px; }}
.note {{ font-size: 6.4pt; line-height: 1.38; margin: 1.6mm 0 0; max-width: 118mm; }}
.sizes {{ border-left: .25mm solid {RULE}; padding-left: 6mm; }}
.tsg {{ display: grid; grid-template-columns: 17mm 1fr; gap: 3.2mm 3mm; align-items: center; margin-top: 1mm; }}
.tsg span {{ font-size: 6.2pt; line-height: 1.25; }}
table.mins {{ border-collapse: collapse; margin-top: 2.6mm; width: 100%; font-size: 6.4pt; }}
.mins th {{ text-align: left; font-weight: 600; color: {NAVY}; padding: 0 0 .8mm; }}
.mins td {{ padding: .7mm 0; border-top: .2mm solid {RULE}; }}
.mins td:last-child {{ color: {NAVY}; font-weight: 600; }}
.dos {{ margin-top: 5mm; }}
.donts {{ margin-top: 5mm; }}
.exgrid {{ display: grid; gap: 2.6mm 3mm; }}
.g3x {{ grid-template-columns: repeat(3, 1fr); }}
.g5x {{ grid-template-columns: repeat(5, 1fr); }}
.ex {{ margin: 0; }}
.ex .ground {{ height: 25mm; }}
.dos .ex .ground {{ height: 22mm; }}
.sizes .note {{ margin-top: 3.4mm; }}
.badge {{ position: absolute; top: 1.4mm; left: 1.4mm; width: 3.4mm; height: 3.4mm; }}
.strike {{ position: absolute; inset: 0; background: linear-gradient(to top right, transparent calc(50% - .18mm), rgba(179,38,30,.55) calc(50% - .18mm), rgba(179,38,30,.55) calc(50% + .18mm), transparent calc(50% + .18mm)); }}
.panel {{ background: {NAVY}; padding: 2.2mm 3mm; border-radius: 1mm; }}
.fake {{ font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 600; font-size: 17pt; color: {NAVY}; }}
.lock {{ display: flex; align-items: center; gap: 1.6mm; }}
"""


def build_html(only=None):
    css = CSS.replace("{FONTS}", font_faces())
    cls = f' class="only-{only}"' if only else ""
    return f"""<!doctype html>
<html lang="de-CH"{cls}>
<head>
<meta charset="utf-8">
<title>Sponsuno Logo-Guide</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>{css}</style>
</head>
<body>
{page1()}
{page2()}
</body>
</html>
"""


# ------------------------------------------------------------------ Ausgabe

def chrome(*args):
    with tempfile.TemporaryDirectory() as prof:
        cmd = [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
               f"--user-data-dir={prof}", "--virtual-time-budget=4000", *args]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)


def render():
    os.makedirs(OUT, exist_ok=True)
    main = os.path.join(OUT, "logo-guide.html")
    open(main, "w", encoding="utf-8").write(build_html())
    pdf = os.path.join(OUT, "logo-guide.pdf")
    chrome("--no-pdf-header-footer", "--print-to-pdf-no-header", f"--print-to-pdf={pdf}", "file://" + main)
    tmp = tempfile.mkdtemp()
    try:
        for n in (1, 2):
            src = os.path.join(tmp, f"seite-{n}.html")
            open(src, "w", encoding="utf-8").write(build_html(only=n))
            png = os.path.join(OUT, f"logo-guide-seite-{n}.png")
            chrome("--window-size=1123,794", "--force-device-scale-factor=2", f"--screenshot={png}", "file://" + src)
            try:
                from PIL import Image
                im = Image.open(png).convert("RGB")
                im.save(png, "PNG", optimize=True)
            except ImportError:
                pass
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    return [main, pdf] + [os.path.join(OUT, f"logo-guide-seite-{n}.png") for n in (1, 2)]


# ------------------------------------------------------------------ Dateiliste im README

LOGO_USE = {
    "wortmarke-farbe": "Standardlogo auf hellem Grund: Briefkopf, Präsentation, Sponsorenwand, Banner, Dossier",
    "wortmarke-navy": "Einfarbig Navy auf hellem Grund, kleine Grössen (S unter ca. 60 px): E-Mail-Signatur, Dokumente",
    "wortmarke-schwarz": "Einfarbig schwarz: Zeitung, Stempel, Laserdruck, Gravur",
    "wortmarke-dunkel": "Auf Navy ab ca. 60 px S-Höhe: dunkle Folien, Trikot, Bande und Banner in Navy",
    "wortmarke-hell": "Einfarbig Ivory auf Navy, kleine Grössen (S unter ca. 60 px): Website-Header, E-Mail-Kopf",
    "wortmarke-weiss": "Einfarbig weiss: Siebdruck, Stick, Folie auf dunklem Textil oder Navy",
    "wortmarke-claim-farbe": "Mit Claim auf hellem Grund: Plakat, Flyer, Titelfolie, Rollup (ab 240 px / 50 mm)",
    "wortmarke-claim-dunkel": "Mit Claim auf Navy: dunkle Titelfolie, Banner (ab 240 px / 50 mm)",
    "symbol-farbe": "Symbol auf hellem Grund, nur wo die Wortmarke nicht passt (ab 32 px / 8 mm)",
    "symbol-dunkel": "Symbol auf Navy (ab 32 px / 8 mm)",
    "symbol-navy": "Symbol einfarbig Navy: Prägung, Ein-Farben-Druck",
    "symbol-hell": "Symbol einfarbig Ivory auf Navy",
    "symbol-tartan": "Symbol einfarbig Tartan, nur auf hellem Grund",
    "symbol-schwarz": "Symbol einfarbig schwarz",
    "symbol-weiss": "Symbol einfarbig weiss: Siebdruck, Folie, Prägung auf dunklem Textil oder Navy",
    "symbol-klein": "Kleinschnitt ohne Kachel: 16 bis 31 px, im Druck unter 8 mm, Stick",
    "symbol-kachel": "App-Icon, Profilbild, Avatar (ab 32 px)",
    "symbol-kachel-klein": "Kleinschnitt auf der Kachel: Favicon und Icons von 16 bis 31 px (Kopie: icons/favicon.svg)",
}
OTHER_USE = {
    "favicon": "Browser-Tab der Website (ins Web-Root kopieren, siehe head-snippet.html); favicon.svg ist eine Kopie von logo/svg/symbol-kachel-klein.svg",
    "apple-touch-icon": "Icon auf dem Startbildschirm von iPhone und iPad (Website)",
    "icon": "Icons für das Web-App-Manifest (Website); icon-512 ist dasselbe Bild wie logo/png/symbol-kachel-512.png",
    "icon-maskable": "Android-Icon mit Sicherheitszone (Website)",
    "site": "Web-App-Manifest (Website)",
    "head-snippet": "HTML-Zeilen für den `<head>` der Website",
    "profilbild": "Profilbild für Instagram, LinkedIn, WhatsApp",
    "linkedin-banner": "Titelbild für persönliche LinkedIn-Profile (1584 × 396); für die Firmenseite nach dem Hochladen den Ausschnitt prüfen",
    "og-bild": "Vorschaubild beim Teilen eines Links (Open Graph)",
    "e-mail-signatur": "Logo für die E-Mail-Signatur, mit Schutzraum (in halber Pixelbreite einsetzen: 240 px)",
    "logo-guide": "Logo-Guide, 2 Seiten A4 quer (HTML ist die Quelle, PDF zum Drucken und Weitergeben)",
    "logo-guide-seite": "Logo-Guide als Bild, z. B. für Chat oder E-Mail",
    "sponsuno-logo-praesentation": "Präsentation des Logos für das Team",
    "spec": "Alle Masse und Farbwerte, maschinenlesbar",
    "build": "Generator der SVG-Master",
    "export": "Generator der PNG, PDF, Icons und Social-Bilder",
    "guide": "Generator des Logo-Guides und dieser Dateiliste",
    "build_praesentation": "Generator der Präsentation",
    "board-spec": "Quelle der Präsentation",
    "praesentation": "Quelle der Präsentation",
}
SKIP_DIRS = {"vorschau"}
SIZE_RE = re.compile(r"-(\d+(x\d+)?)$")


def group_key(rel):
    d, name = os.path.split(rel)
    stem, ext = os.path.splitext(name)
    if d.startswith("logo/png") or d.startswith("logo-guide"):
        stem = SIZE_RE.sub("", stem) if d.startswith("logo/png") else re.sub(r"-seite-\d$", "-seite", stem)
        return (d, stem, ext)
    if d == "icons" and stem.startswith("icon-") and stem[5:].isdigit():
        return (d, "icon", ext)
    return (d, stem, ext)


def use_for(d, stem, ext):
    if stem == "README" and d == "_quellen":
        return "Hinweise zum Neubau"
    if stem == "markentexte":
        return "Claim, Beschreibung, Boilerplate, Bios, Signatur, Wortwahl"
    if d.startswith("logo/"):
        u = LOGO_USE.get(stem, "(Zweck ergänzen)")
        if ext == ".pdf":
            if stem.startswith("wortmarke"):
                return "Vektor-PDF für Druckerei, Textil, Stick. " + u
            return "Vektor-PDF für Druckerei und Textil (für Stick den Kleinschnitt). " + u
        if ext == ".png":
            return u + " (PNG für Office, Canva)"
        return u
    if d == "praesentation" and re.match(r"\d\d-", stem):
        return "Folie der Logo-Präsentation"
    key = SIZE_RE.sub("", stem)
    return OTHER_USE.get(stem) or OTHER_USE.get(key) or "(Zweck ergänzen)"


def link(rel):
    return f"[`{rel}`]({rel.replace(' ', '%20')})"


def file_table():
    groups = {}
    for root, dirs, files in os.walk(BRAND):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS and not x.startswith(".") and x != "__pycache__")
        for f in sorted(files):
            rel = os.path.relpath(os.path.join(root, f), BRAND)
            if f.startswith(".") or rel == "README.md":
                continue
            groups.setdefault(group_key(rel), []).append(rel)
    order = ["logo/svg", "logo/pdf", "logo/png", "icons", "social", "logo-guide", ".", "praesentation", "_quellen"]

    def rank(k):
        d = k[0] or "."
        for i, o in enumerate(order):
            if d == o or d.startswith(o + "/"):
                return (i, d, k[1], k[2])
        return (len(order), d, k[1], k[2])
    rows = []
    for k in sorted(groups, key=rank):
        files = groups[k]
        if k[0] == "praesentation" and re.match(r"\d\d-", k[1]):
            if not any(r[2] for r in rows):
                slides = sorted(f for kk, v in groups.items() if kk[0] == "praesentation" and re.match(r"\d\d-", kk[1]) for f in v)
                rows.append((f"`{slides[0]}` bis `{os.path.basename(slides[-1])}` ({len(slides)} Dateien)",
                             "Folien der Logo-Präsentation als Bilder (13 bis 18 sind die Anwendungsbeispiele: Trikot, Bande, "
                             "Startnummer, Visitenkarte, App-Icon, E-Mail)", True))
            continue
        rows.append((", ".join(link(f) for f in sorted(files, key=lambda x: (len(x), x))), use_for(*k), False))
    out = ["| Datei | Wofür |", "|---|---|"] + [f"| {a} | {b} |" for a, b, _ in rows]
    out += ["", "`_quellen/vorschau/` enthält nur Kontrollbilder der Master, keine Lieferdateien."]
    return "\n".join(out)


def update_readme():
    p = os.path.join(BRAND, "README.md")
    if not os.path.exists(p):
        return False
    txt = open(p, encoding="utf-8").read()
    new = re.sub(r"(<!-- dateien:start -->\n).*?(<!-- dateien:end -->)",
                 lambda m: m.group(1) + file_table() + "\n" + m.group(2), txt, flags=re.S)
    if new != txt:
        open(p, "w", encoding="utf-8").write(new)
    return True


if __name__ == "__main__":
    # --nur-liste: nur die Dateiliste im README erneuern, ohne Chrome
    files = [] if "--nur-liste" in sys.argv else render()
    for f in files:
        print(f"{os.path.relpath(f, REPO)}  {os.path.getsize(f) / 1024:.0f} KB")
    if update_readme():
        print("brand/README.md: Dateiliste erneuert")
