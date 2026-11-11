#!/usr/bin/env python3
"""Baut die Logo-Präsentation von Sponsuno: brand/praesentation/*.png und sponsuno-logo-praesentation.pdf.

Quellen sind nur die Master in brand/logo/svg/ (gebaut von brand/_quellen/build.py) und die Masse in
brand/_quellen/spec.json. Die Folien sind HTML/CSS/SVG (praesentation.html, hier im Ordner); headless Chrome macht
daraus die PNGs (1600 × 1000) und das PDF (Vektor, eine Folie pro Seite). Die Übersicht «Im Einsatz» kommt aus
presentation_board.py der logo-design-Skill (board-spec.json); deren englische Beschriftungen werden hier übersetzt.

Aus dem Repo-Ordner:
    python3 -I brand/_quellen/praesentation/build_praesentation.py

Braucht nur Python 3.9+ (Standardbibliothek) und Google Chrome oder Chromium. Die Folie 12 braucht zusätzlich die
logo-design-Skill (Pfad mit SPONSUNO_LOGO_SKILL=/pfad/zur/skill, sonst ~/.claude/skills/logo-design); ohne Skill bleibt die
vorhandene Folie 12-im-einsatz.png stehen. Nach einem Neubau 12-im-einsatz.png anschauen: die Übersetzung und die
Korrekturen (BOARD_FIX, build_board) ersetzen Text im HTML der Skill und greifen nicht mehr, wenn sich dieses ändert.

Das PDF ist Vektor bis auf drei Dinge, die Chrome als Bild einbettet: Folie 12 (Bildschirmfoto der Übersicht) und die
weichen Schatten unter Startnummer, Visitenkarte, Telefon und Mailfenster (Folien 15 bis 18). Alle Schriften sind
Manrope und Cormorant Garamond; Zeichen ausserhalb ihres Latin-Subsets (z. B. ≈, →, ●) nicht verwenden, sonst setzt
Chrome eine Systemschrift ein.
"""
import base64
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(os.path.dirname(HERE))
REPO = os.path.dirname(BRAND)
SVG_DIR = os.path.join(BRAND, "logo", "svg")
OUT = os.path.join(BRAND, "praesentation")
FONTS = os.path.join(REPO, "node_modules", "@fontsource")
SKILL = os.environ.get("SPONSUNO_LOGO_SKILL", os.path.expanduser("~/.claude/skills/logo-design"))
DECK = os.path.join(HERE, "praesentation.html")
PDF_NAME = "sponsuno-logo-praesentation.pdf"
W, H = 1600, 1000

NAVY, TARTAN, HELL, IVORY, PAPER, AKZENT = "#0B1830", "#BE4B2C", "#EC6942", "#F3EFE6", "#FBF9F4", "#A8401F"

with open(os.path.join(BRAND, "_quellen", "spec.json"), encoding="utf-8") as fh:
    SPEC = json.load(fh)

FOOT = "Sponsuno · Logo A · Schnitt, Palette Tartan"


# ---------------------------------------------------------------- helpers

def font_face():
    faces = [("Manrope", w, f"manrope/files/manrope-latin-{w}-normal.woff2") for w in (400, 600, 700, 800)]
    faces.append(("Cormorant Garamond", 600, "cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2"))
    out = []
    for fam, weight, rel in faces:
        with open(os.path.join(FONTS, rel), "rb") as fh:
            b64 = base64.b64encode(fh.read()).decode("ascii")
        out.append(f"@font-face{{font-family:'{fam}';font-weight:{weight};font-style:normal;font-display:block;"
                   f"src:url(data:font/woff2;base64,{b64}) format('woff2')}}")
    return "\n".join(out)


def src(name):
    """Relative path from praesentation.html to a master."""
    return f"../../logo/svg/{name}.svg"


def img(name, style="", cls=""):
    return f'<img src="{src(name)}" alt="" style="{style}"{f" class={chr(34)}{cls}{chr(34)}" if cls else ""}>'


def svg_text(name):
    with open(os.path.join(SVG_DIR, name + ".svg"), encoding="utf-8") as fh:
        return fh.read()


def data_uri(svg):
    return "data:image/svg+xml;charset=utf-8," + urllib.parse.quote(svg)


def wm_width_for_ink(ink_px):
    """Image width of a wordmark file whose visible ink is ink_px wide."""
    return ink_px * 1345 / SPEC["wordmark"]["ink_width_units"]


def fuss(dark=False):
    return f'<div class="fuss"><span>{FOOT}</span><span>Stand November 2026</span></div>'


def esc(s):
    return html.escape(s, quote=False)


# ---------------------------------------------------------------- CSS

CSS = """
:root{--navy:#0B1830;--tartan:#BE4B2C;--hell:#EC6942;--ivory:#F3EFE6;--paper:#FBF9F4;--akzent:#A8401F;
--muted:#535B6B;--line:#E2DCCF;--grund:#E4DFD5}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;background:#CFC9BE;font:400 20px/1.5 Manrope,system-ui,sans-serif;color:var(--navy)}
section.folie{width:1600px;height:1000px;margin:32px auto;position:relative;overflow:hidden;background:var(--paper);
  padding:72px 88px 96px}
html.einzeln body{background:transparent}
html.einzeln section.folie{margin:0}
section[hidden]{display:none!important}
@page{size:1600px 1000px;margin:0}
@media print{body{background:none}section.folie{margin:0;break-after:page}}
.kicker{font:600 17px/1.3 Manrope,sans-serif;color:var(--akzent);margin:0 0 12px}
h1,h2,h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:600;margin:0;letter-spacing:-.005em}
h2{font-size:58px;line-height:1.06}
h3{font-size:30px;line-height:1.15}
p{margin:0}
.lead{font-size:23px;line-height:1.5;max-width:960px;margin-top:16px}
.muted{color:var(--muted)}
.fuss{position:absolute;left:88px;right:88px;bottom:34px;display:flex;justify-content:space-between;font-size:14px;
  color:var(--muted)}
section.folie.dunkel{background:var(--navy);color:var(--ivory)}
.dunkel .fuss{color:rgba(243,239,230,.72)}
.dunkel .kicker{color:var(--hell)}
.panel{border-radius:16px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.p-ivory{background:var(--ivory)}.p-paper{background:var(--paper);box-shadow:inset 0 0 0 1px var(--line)}
.p-weiss{background:#fff;box-shadow:inset 0 0 0 1px var(--line)}.p-navy{background:var(--navy)}
.p-tartan{background:var(--tartan)}
.cap{font-size:16px;line-height:1.45;margin-top:12px}
.cap b{font-weight:600}
.cap code,.datei{font:600 14px/1.4 Manrope,sans-serif;color:var(--akzent)}
ul.punkte{margin:22px 0 0;padding:0;list-style:none}
ul.punkte li{position:relative;padding-left:26px;margin:0 0 14px;font-size:20px;line-height:1.5}
ul.punkte li:before{content:"";position:absolute;left:0;top:13px;width:12px;height:3px;background:var(--tartan)}
.raster{display:grid;gap:26px 24px}
.mock-cap{position:absolute;left:88px;bottom:40px;font-size:17px;line-height:1.4;color:var(--navy);max-width:1100px}
.mock-cap b{font-weight:600}
.mock-cap.hell{color:var(--ivory)}
"""


# ---------------------------------------------------------------- slides

def s_titel():
    return f"""<section class="folie dunkel" data-datei="01-titel">
<div style="position:absolute;left:88px;top:150px">{img('wortmarke-claim-dunkel', 'width:980px;display:block;margin-left:-16px')}</div>
<div style="position:absolute;left:88px;bottom:110px">
<h1 style="font-size:52px;line-height:1.1">Logo und Anwendungen</h1>
<p style="font-size:20px;margin-top:12px;color:rgba(243,239,230,.8)">Logo A · Schnitt in der Palette Tartan: Wortmarke, Symbol, Farben, Regeln und Beispiele</p>
</div>{fuss(True)}</section>"""


def s_idee():
    return f"""<section class="folie" data-datei="02-idee">
<div style="display:grid;grid-template-columns:620px 1fr;gap:80px;height:100%">
<div class="panel p-ivory" style="height:832px;margin-top:0">{img('symbol-farbe', 'width:540px')}</div>
<div style="padding-top:30px">
<p class="kicker">Die Idee</p>
<h2>Ein S, einmal geschnitten</h2>
<p class="lead">Eine Linie im Winkel von 45° öffnet das S in der Mitte. So entstehen zwei Teile, die genau
zusammenpassen: wie Sportlerinnen, Sportler und Vereine auf der einen Seite und Firmen aus der Region auf der anderen.</p>
<ul class="punkte">
<li>Ein Skelett, zwei Strichstärken: oben 37, unten 40 Einheiten. Die untere Hälfte trägt etwas mehr Gewicht.</li>
<li>Die Lücke liegt genau auf 45°. Sie trennt die Hälften auch ohne Farbe; darum wird sie nie verkleinert.</li>
<li>Fast punktsymmetrisch: um 180° gedreht bleibt das S ein S.</li>
<li>Seite 1 Navy, Seite 2 Tartan. Einfarbig funktioniert das Zeichen ohne Verlust, weil die Idee in der Form liegt.</li>
</ul></div></div>{fuss()}</section>"""


def s_wortmarke():
    return f"""<section class="folie" data-datei="03-wortmarke">
<p class="kicker">Wortmarke</p>
<h2>Die Wortmarke ist das Logo</h2>
<div class="panel p-ivory" style="height:420px;margin-top:34px">{img('wortmarke-farbe', 'width:1040px')}</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:34px;font-size:19px;line-height:1.5">
<p>Das S der Wortmarke ist dieselbe Zeichnung wie das Symbol. «ponsuno» ist Manrope 700, als Outlines gesetzt.</p>
<p>Es gibt bewusst keine Kombination aus Symbol und Wortmarke: «S Sponsuno» zeigt das S zweimal hintereinander und stottert.</p>
<p>Das Symbol steht nur dort, wo die Wortmarke keinen Platz hat: Favicon, App-Icon, Profilbild.</p>
</div>{fuss()}</section>"""


def s_claim():
    return f"""<section class="folie" data-datei="04-wortmarke-claim">
<p class="kicker">Wortmarke mit Claim</p>
<h2>Sponsoring, das zusammenpasst.</h2>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:34px">
<div><div class="panel p-ivory" style="height:470px">{img('wortmarke-claim-farbe', 'width:560px')}</div>
<p class="cap"><span class="datei">wortmarke-claim-farbe.svg</span> · auf hellen Gründen</p></div>
<div><div class="panel p-navy" style="height:470px">{img('wortmarke-claim-dunkel', 'width:560px')}</div>
<p class="cap"><span class="datei">wortmarke-claim-dunkel.svg</span> · auf Navy</p></div>
</div>
<p style="font-size:19px;margin-top:22px;max-width:1300px">Der Claim steht unter der Wortmarke und ist genau so breit wie «ponsuno»: vom Stamm des p bis zum letzten o.
Manrope 600, als Outlines. Ab 240 px Breite am Bildschirm und ab 50 mm im Druck; kleiner die Wortmarke ohne Claim.</p>
{fuss()}</section>"""


def tile(panel_cls, inner, title, datei, text, h=250):
    return (f'<div><div class="panel {panel_cls}" style="height:{h}px">{inner}</div>'
            f'<p class="cap"><b>{title}</b> · <span class="datei">{datei}</span><br><span class="muted">{text}</span></p></div>')


def s_wortmarke_fassungen():
    w = "width:280px"
    h = 230
    cells = [
        tile("p-ivory", img("wortmarke-farbe", w), "Farbe", "wortmarke-farbe.svg", "Standard auf hellen Gründen, ab ca. 60 px S-Höhe", h),
        tile("p-ivory", img("wortmarke-navy", w), "Navy", "wortmarke-navy.svg", "Einfarbig auf hellen Gründen, unter ca. 60 px S-Höhe", h),
        tile("p-weiss", img("wortmarke-schwarz", w), "Schwarz", "wortmarke-schwarz.svg", "Einfarbiger Druck, Stempel, Gravur", h),
        tile("p-ivory", img("wortmarke-navy", f"width:{wm_width_for_ink(96):.1f}px"), "Kleinste Grösse", "96 px",
             "Hier in echter Grösse; im Druck mindestens 25 mm breit", h),
        tile("p-navy", img("wortmarke-dunkel", w), "Dunkel", "wortmarke-dunkel.svg", "Auf Navy, ab ca. 60 px S-Höhe; 2,5 % dünner geschnitten", h),
        tile("p-navy", img("wortmarke-hell", w), "Hell", "wortmarke-hell.svg", "Einfarbig Ivory auf Navy, unter ca. 60 px S-Höhe (Website-Header)", h),
        tile("p-navy", img("wortmarke-weiss", w), "Weiss", "wortmarke-weiss.svg", "Einfarbig: Siebdruck, Stick, Folie auf dunklem Textil", h),
        ('<div style="padding:8px 4px 0;font-size:17px;line-height:1.5"><p style="font-weight:600;margin-bottom:8px">Zweifarbig oder einfarbig</p>'
         '<p>Ab ca. 60 px S-Höhe zweifarbig (Farbe, Dunkel), darunter einfarbig: auf Hell Navy, auf Navy Hell. Regel aus Runde 3, für Tartan noch nicht neu getestet.</p></div>'),
    ]
    return f"""<section class="folie" data-datei="05-wortmarke-fassungen">
<p class="kicker">Wortmarke</p><h2>Fassungen</h2>
<div class="raster" style="grid-template-columns:repeat(4,1fr);margin-top:30px;gap:22px 22px">{''.join(cells)}</div>{fuss()}</section>"""


def s_symbol_fassungen():
    w = "width:150px"
    h = 210
    cells = [
        tile("p-ivory", img("symbol-farbe", w), "Farbe", "symbol-farbe.svg", "Helle Gründe, ab 32 px", h),
        tile("p-ivory", img("symbol-navy", w), "Navy", "symbol-navy.svg", "Einfarbig auf Hell", h),
        tile("p-ivory", img("symbol-tartan", w), "Tartan", "symbol-tartan.svg", "Einfarbig auf Hell", h),
        tile("p-weiss", img("symbol-schwarz", w), "Schwarz", "symbol-schwarz.svg", "Schwarzweissdruck", h),
        tile("p-ivory", img("symbol-klein", w), "Kleinschnitt", "symbol-klein.svg", "16 bis 31 px, ohne Kachel", h),
        tile("p-ivory", img("symbol-kachel", "width:160px"), "Kachel", "symbol-kachel.svg", "App-Icon, Profilbild, ab 32 px", h),
        tile("p-navy", img("symbol-dunkel", w), "Dunkel", "symbol-dunkel.svg", "Auf Navy, dünner Schnitt", h),
        tile("p-navy", img("symbol-hell", w), "Hell", "symbol-hell.svg", "Einfarbig Ivory auf Navy", h),
        tile("p-navy", img("symbol-weiss", w), "Weiss", "symbol-weiss.svg", "Einfarbig: Siebdruck, Folie auf dunklem Textil", h),
        tile("p-ivory", img("symbol-kachel-klein", "width:160px"), "Kachel klein", "symbol-kachel-klein.svg", "Favicon, 16 bis 31 px", h),
        ('<div style="grid-column:span 2;padding:8px 4px 0;font-size:17px;line-height:1.5"><p style="font-weight:600;margin-bottom:8px">Faustregel</p>'
         '<p>Ab 32 px das Symbol oder die Kachel. Von 16 bis 31 px immer den Kleinschnitt. Unter 16 px kein Logo. '
         'Das Symbol nie direkt auf ein Foto oder eine Farbfläche, nur auf Papier, Weiss, Ivory oder Navy.</p></div>'),
    ]
    return f"""<section class="folie" data-datei="06-symbol-fassungen">
<p class="kicker">Symbol</p><h2>Fassungen</h2>
<div class="raster" style="grid-template-columns:repeat(6,1fr);margin-top:30px;gap:22px 18px">{''.join(cells)}</div>{fuss()}</section>"""


def s_klein():
    def item(name, px, label=None, w=None):
        st = f"width:{w if w else px}px;height:auto;display:block"
        return (f'<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:10px">'
                f'{img(name, st)}<span style="font-size:14px" class="muted">{label or f"{px} px"}</span></div>')
    row = ('<div style="display:grid;grid-template-columns:300px 1fr;align-items:end;padding:26px 0;'
           'border-top:1px solid var(--line)"><div><p style="font-weight:600;font-size:19px">{t}</p>'
           '<p class="muted" style="font-size:15px;margin-top:4px">{s}</p></div>'
           '<div style="display:flex;gap:44px;align-items:flex-end">{c}</div></div>')
    r1 = row.format(t="Kachel", s="Favicon und App-Icon", c="".join([
        item("symbol-kachel-klein", 16), item("symbol-kachel-klein", 24), item("symbol-kachel", 32),
        item("symbol-kachel", 48), item("symbol-kachel", 64), item("symbol-kachel", 128)]))
    r2 = row.format(t="Symbol", s="16 und 24 px im Kleinschnitt", c="".join([
        item("symbol-klein", 16), item("symbol-klein", 24), item("symbol-farbe", 32), item("symbol-farbe", 48),
        item("symbol-farbe", 64), item("symbol-farbe", 128)]))
    s60 = 60 * 1345 / SPEC["wordmark"]["s_height_units"]
    r3 = row.format(t="Wortmarke", s="Breite der sichtbaren Form", c="".join([
        item("wortmarke-navy", 96, "96 px, Navy", wm_width_for_ink(96)),
        item("wortmarke-navy", 160, "160 px, Navy", wm_width_for_ink(160)),
        item("wortmarke-farbe", 0, "Farbe ab ca. 60 px S-Höhe", s60)]))
    return f"""<section class="folie" data-datei="07-kleine-groessen">
<p class="kicker">Kleine Grössen</p><h2>In echter Pixelgrösse</h2>
<div style="margin-top:28px">{r1}{r2}{r3}</div>
<p class="muted" style="font-size:16px;margin-top:6px">Alle Grössen auf dieser Folie sind echte Bildschirmpixel (PNG in 1600 × 1000). Im PDF bleiben sie Vektoren.</p>
{fuss()}</section>"""


def s_farben():
    by = {c["name"]: c for c in SPEC["colours"]}
    show = [
        ("Navy", "Seite 1 auf Hell, dunkler Grund", "ca. PMS 289 C", "16,81:1 auf Papier", False),
        ("Tartan", "Seite 2 auf hellen Gründen", "ca. PMS 7599 C (bis 7618 C)", "4,72:1 auf Papier", False),
        ("Tartan hell", "Seite 2 auf Navy, nie auf Hell", "ca. PMS 7579 C oder 7618 C", "5,61:1 auf Navy", False),
        ("Ivory", "Seite 1 auf Navy, helles Band", "Papierweiss; auf Textil ca. PMS 9224 C (unsicher)", "15,41:1 mit Navy", True),
        ("Papier", "Heller Grund", "Papierweiss, nicht drucken", "16,81:1 mit Navy", True),
        ("Text-Akzent", "Tartan für Text auf Hell", "Im Druck Tartan verwenden", "5,84:1 auf Papier", False),
    ]
    cols = []
    for name, use, pms, kontrast, light in show:
        c = by[name]
        k = c["cmyk_coated_approx"]
        border = "box-shadow:inset 0 0 0 1px var(--line);" if light else ""
        cols.append(f"""<div><div style="height:250px;border-radius:14px;background:{c['hex']};{border}"></div>
<p style="font-weight:600;font-size:20px;margin-top:16px">{name}</p>
<p class="muted" style="font-size:15px;line-height:1.4;min-height:42px">{use}</p>
<div style="font-size:15px;line-height:1.65;margin-top:10px">
<div><b style="font-weight:600">HEX</b> {c['hex']}</div>
<div><b style="font-weight:600">RGB</b> {' '.join(str(v) for v in c['rgb'])}</div>
<div><b style="font-weight:600">CMYK</b> ca. {k['c']} {k['m']} {k['y']} {k['k']}</div>
<div style="line-height:1.4;margin-top:3px;min-height:42px"><b style="font-weight:600">Pantone</b> {pms}</div>
<div class="muted" style="margin-top:6px">{kontrast}</div></div></div>""")
    return f"""<section class="folie" data-datei="08-farben">
<p class="kicker">Farben</p><h2>Palette Tartan</h2>
<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:20px;margin-top:30px">{''.join(cols)}</div>
<p style="font-size:15px;line-height:1.5;margin-top:26px;max-width:1300px" class="muted">CMYK (gestrichenes Papier) und Pantone sind Näherungswerte:
vor dem ersten Druck mit Proof und gedrucktem Pantone-Muster prüfen (approximate, verify with a printed swatch). Kontrast nach WCAG.
Tartan hell nie auf hellen Gründen (2,99:1 auf Papier); Navy-Schrift nie auf Tartan-Fläche (3,56:1).</p>
{fuss()}</section>"""


def s_typo():
    lead = "Sponsuno bringt Sportlerinnen, Sportler und Vereine aus Sport und Kultur mit Firmen aus ihrer Region zusammen."
    return f"""<section class="folie" data-datei="09-typografie">
<p class="kicker">Typografie</p>
<p style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:104px;line-height:1.02;margin-top:6px">Sponsoring, das <span style="color:var(--akzent)">zusammenpasst.</span></p>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:48px;margin-top:56px;border-top:1px solid var(--line);padding-top:30px">
<div><p style="font-weight:600;font-size:19px">Titel · Cormorant Garamond 600</p>
<p style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:46px;line-height:1.15;margin-top:14px">Aa Bb Cc Ää Öö Üü<br>0123456789</p></div>
<div><p style="font-weight:600;font-size:19px">Text · Manrope 400 und 600</p>
<p style="font-size:20px;line-height:1.55;margin-top:14px">{lead}</p>
<p style="font-size:20px;font-weight:600;margin-top:10px;color:var(--akzent)">Auf die Warteliste</p></div>
<div><p style="font-weight:600;font-size:19px">Wortmarke · Manrope 700, Outlines</p>
<div style="margin-top:22px">{img('wortmarke-navy', 'width:300px;display:block;margin-left:-6px')}</div>
<p style="font-size:17px;line-height:1.5;margin-top:16px" class="muted">Die Wortmarke wird nie mit der Schrift nachgesetzt: immer die SVG-Datei verwenden.</p></div>
</div>
<div style="margin-top:36px;background:var(--navy);color:var(--ivory);border-radius:16px;padding:34px 44px;display:grid;grid-template-columns:1.1fr 1fr;gap:48px;align-items:center">
<p style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:40px;line-height:1.12">Heute kostet Sponsoring vor allem Zeit und Kontakte.</p>
<div><p style="font-weight:600;font-size:19px;color:var(--hell)">Ohne Kontakte kein Zugang</p>
<p style="font-size:18px;line-height:1.55;margin-top:6px">Wer niemanden kennt, weiss nicht, welche Firma Interesse hat und wer dort zuständig ist.</p></div></div>
<p class="muted" style="font-size:15px;margin-top:22px">Beide Schriften (Cormorant Garamond, Manrope) stehen unter der SIL Open Font License; Lizenztexte in src/assets/fonts/.</p>
{fuss()}</section>"""


def s_schutzraum():
    wm = SPEC["wordmark"]
    x = SPEC["clear_space"]["wordmark"]["units"]
    ix, iy, ix2, iy2 = wm["ink_box_units"]
    iw, ih = ix2 - ix, iy2 - iy
    tart = TARTAN

    def marks(boxes, unit, label, fs):
        out = []
        for bx, by in boxes:
            out.append(f'<rect x="{bx:.2f}" y="{by:.2f}" width="{unit:.2f}" height="{unit:.2f}" fill="{tart}" fill-opacity=".14" '
                       f'stroke="{tart}" stroke-width="{unit/48:.2f}"/>'
                       f'<text x="{bx+unit/2:.2f}" y="{by+unit/2+fs*0.35:.2f}" text-anchor="middle" font-family="Manrope" '
                       f'font-weight="600" font-size="{fs}" fill="{AKZENT}">{label}</text>')
        return "".join(out)

    pad = 20
    vb = f"{ix-x-pad:.2f} {iy-x-pad:.2f} {iw+2*x+2*pad:.2f} {ih+2*x+2*pad:.2f}"
    wsvg = (f'<svg viewBox="{vb}" style="width:880px;display:block">'
            f'<rect x="{ix-x:.2f}" y="{iy-x:.2f}" width="{iw+2*x:.2f}" height="{ih+2*x:.2f}" fill="none" stroke="{tart}" '
            f'stroke-width="3" stroke-dasharray="14 10"/>'
            f'<rect x="{ix:.2f}" y="{iy:.2f}" width="{iw:.2f}" height="{ih:.2f}" fill="none" stroke="{NAVY}" stroke-opacity=".35" stroke-width="2"/>'
            + marks([(ix - x, iy + ih / 2 - x / 2), (ix2, iy + ih / 2 - x / 2), (ix + iw / 2 - x / 2, iy - x), (ix + iw / 2 - x / 2, iy2)], x, "X", 64)
            + f'<image href="{src("wortmarke-farbe")}" x="0" y="0" width="1345" height="304"/></svg>')
    sym = SPEC["symbol"]
    y = SPEC["clear_space"]["symbol"]["units"]
    sx, sy, sx2, sy2 = sym["ink_box_units"]
    sw, sh = sx2 - sx, sy2 - sy
    p2 = 8
    vb2 = f"{sx-y-p2:.2f} {sy-y-p2:.2f} {sw+2*y+2*p2:.2f} {sh+2*y+2*p2:.2f}"
    ssvg = (f'<svg viewBox="{vb2}" style="height:420px;display:block">'
            f'<rect x="{sx-y:.2f}" y="{sy-y:.2f}" width="{sw+2*y:.2f}" height="{sh+2*y:.2f}" fill="none" stroke="{tart}" '
            f'stroke-width="1.2" stroke-dasharray="6 4"/>'
            f'<rect x="{sx:.2f}" y="{sy:.2f}" width="{sw:.2f}" height="{sh:.2f}" fill="none" stroke="{NAVY}" stroke-opacity=".35" stroke-width=".8"/>'
            + marks([(sx - y, sy + sh / 2 - y / 2), (sx2, sy + sh / 2 - y / 2), (sx + sw / 2 - y / 2, sy - y), (sx + sw / 2 - y / 2, sy2)], y, "Y", 24)
            + f'<image href="{src("symbol-farbe")}" x="0" y="0" width="256" height="256"/></svg>')
    mins = [
        ("Wortmarke", "96 px breit am Bildschirm, 25 mm im Druck"),
        ("Wortmarke mit Claim", "240 px am Bildschirm, 50 mm im Druck"),
        ("Symbol und Kachel", "Ab 32 px. Von 16 bis 31 px den Kleinschnitt, unter 16 px kein Logo"),
        ("Symbol im Druck", "Ab 8 mm, darunter Kleinschnitt, unter 5 mm nicht. Stick ab ca. 15 mm, mit Garnmuster prüfen"),
    ]
    mcols = "".join(f'<div><p style="font-weight:600;font-size:18px">{t}</p><p style="font-size:16px;line-height:1.45;margin-top:4px" class="muted">{d}</p></div>'
                    for t, d in mins)
    return f"""<section class="folie" data-datei="10-schutzraum">
<p class="kicker">Schutzraum und Mindestgrössen</p><h2>Platz lassen</h2>
<div style="display:grid;grid-template-columns:960px 1fr;gap:24px;margin-top:26px">
<div><div class="panel p-ivory" style="height:470px">{wsvg}</div>
<p class="cap"><b>X = Höhe des n</b> <span class="muted">(144 Einheiten, gut die Hälfte der Wortmarkenhöhe). Rund um die sichtbare Form, auch beim Claim.</span></p></div>
<div><div class="panel p-ivory" style="height:470px">{ssvg}</div>
<p class="cap"><b>Y = ein Viertel der S-Höhe.</b> <span class="muted">Auf der Kachel ist der Schutzraum eingebaut.</span></p></div>
</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;margin-top:26px;border-top:1px solid var(--line);padding-top:20px">{mcols}</div>
{fuss()}</section>"""


def cross():
    return (f'<svg viewBox="0 0 40 40" style="position:absolute;right:16px;top:16px;width:34px;height:34px">'
            f'<circle cx="20" cy="20" r="19" fill="{AKZENT}"/><path d="M13 13 27 27M27 13 13 27" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>')


def s_nicht():
    farbe = svg_text("wortmarke-farbe")
    hell_auf_papier = data_uri(farbe.replace(TARTAN, HELL))
    # harter Schatten als flache graue Kopie (bleibt im PDF Vektor; ein CSS-Filter würde gerastert)
    schatten = data_uri(farbe.replace(TARTAN, "#CFC8BB").replace(NAVY, "#CFC8BB"))
    w = "width:330px"
    cells = [
        (f'<div class="panel p-paper" style="height:230px">{cross()}<img src="{hell_auf_papier}" alt="" style="{w}"></div>',
         "Tartan hell auf hellem Grund", "Zu wenig Kontrast (2,99:1). Auf Hell immer Tartan #BE4B2C."),
        (f'<div class="panel p-navy" style="height:230px">{cross()}{img("wortmarke-farbe", w)}</div>',
         "Farbfassung auf Navy", "Auf Navy immer wortmarke-dunkel, klein wortmarke-hell."),
        (f'<div class="panel p-tartan" style="height:230px">{cross()}{img("wortmarke-navy", w)}</div>',
         "Navy auf Tartan-Fläche", "3,56:1 ist zu wenig. Auf farbigem Grund ein Feld in Papier, Weiss oder Navy dahinter."),
        (f'<div class="panel p-ivory" style="height:230px;gap:22px">{cross()}{img("symbol-farbe", "height:92px;margin-right:-22px")}{img("wortmarke-farbe", "width:300px")}</div>',
         "Symbol vor der Wortmarke", "«S Sponsuno» stottert. Es gibt bewusst kein Lockup."),
        (f'<div class="panel p-ivory" style="height:230px">{cross()}{img("wortmarke-navy", "width:300px;transform:scaleX(1.3)")}</div>',
         "Verzerren oder neu setzen", "Nie strecken, stauchen, nachsetzen oder die Hälften des S verschieben."),
        (f'<div class="panel p-ivory" style="height:230px">{cross()}<div style="position:relative;{w}">'
         f'<img src="{schatten}" alt="" style="position:absolute;left:4px;top:6px;width:100%">'
         f'<img src="{src("wortmarke-farbe")}" alt="" style="position:relative;display:block;width:100%"></div></div>',
         "Effekte", "Keine Schatten, Konturen oder Verläufe. Die Lücke im S nie verkleinern."),
    ]
    html_cells = "".join(f'<div>{p}<p class="cap"><b>{t}</b><br><span class="muted">{d}</span></p></div>' for p, t, d in cells)
    return f"""<section class="folie" data-datei="11-bitte-nicht">
<p class="kicker">Regeln</p><h2>Bitte nicht</h2>
<div class="raster" style="grid-template-columns:repeat(3,1fr);margin-top:30px">{html_cells}</div>{fuss()}</section>"""


def s_einsatz():
    return """<section class="folie" data-datei="12-im-einsatz" data-bild="1" style="padding:0">
<img src="../../praesentation/12-im-einsatz.png" alt="" style="width:1600px;height:1000px;display:block"></section>"""


# ---------------------------------------------------------------- sport mock-ups

JERSEY_FRONT = ("M210 40 Q300 112 390 40 L470 62 L582 172 L516 248 L470 208 L470 612 Q300 628 130 612 L130 208 "
                "L84 248 L18 172 L130 62 Z")
JERSEY_BACK = ("M210 40 Q300 62 390 40 L470 62 L582 172 L516 248 L470 208 L470 612 Q300 628 130 612 L130 208 "
               "L84 248 L18 172 L130 62 Z")


def m_trikot():
    wm_d = svg_text("wortmarke-dunkel")
    wm_h = svg_text("wortmarke-hell")
    front = f"""<svg viewBox="0 0 600 640" style="width:600px;display:block">
<path d="{JERSEY_FRONT}" fill="{NAVY}"/>
<path d="M210 40 Q300 22 390 40 Q300 112 210 40 Z" fill="#060E1D"/>
<path d="M206 38 Q300 118 394 38" fill="none" stroke="{TARTAN}" stroke-width="15" stroke-linejoin="round"/>
<path d="M582 172 L516 248 M18 172 L84 248" stroke="{TARTAN}" stroke-width="14"/>
<image href="{data_uri(wm_d)}" x="318" y="150" width="128" height="28.9"/>
<text x="300" y="368" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="54" fill="{IVORY}">Muster AG</text>
</svg>"""
    back = f"""<svg viewBox="0 0 600 640" style="width:600px;display:block">
<path d="{JERSEY_BACK}" fill="{NAVY}"/>
<path d="M206 39 Q300 64 394 39" fill="none" stroke="{TARTAN}" stroke-width="15"/>
<path d="M582 172 L516 248 M18 172 L84 248" stroke="{TARTAN}" stroke-width="14"/>
<image href="{data_uri(wm_h)}" x="235" y="92" width="130" height="29.4"/>
<text x="300" y="440" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="250" fill="{IVORY}">10</text>
</svg>"""
    return f"""<section class="folie" data-datei="13-trikot" style="background:var(--grund);padding:0">
<div style="position:absolute;left:130px;top:90px">{front}<p style="text-align:center;font-size:16px;margin-top:14px" class="muted">Vorne</p></div>
<div style="position:absolute;right:130px;top:90px">{back}<p style="text-align:center;font-size:16px;margin-top:14px" class="muted">Hinten</p></div>
<p class="mock-cap"><b>Trikot</b> · Wortmarke dunkel auf der Brust, Kragen und Ärmelsaum in Tartan, im Nacken die Wortmarke einfarbig hell. «Muster AG» steht für den Sponsor. Kein Symbol: Auf dem Trikot hat die Wortmarke Platz.</p>
</section>"""


def m_bande():
    def panel(kind, wpx, hpx):
        if kind == "navy":
            return f'<div style="width:{wpx}px;height:{hpx}px;background:{NAVY};display:flex;align-items:center;justify-content:center">{img("wortmarke-dunkel", f"height:{hpx*0.40:.0f}px")}</div>'
        if kind == "paper":
            return f'<div style="width:{wpx}px;height:{hpx}px;background:{PAPER};display:flex;align-items:center;justify-content:center">{img("wortmarke-farbe", f"height:{hpx*0.40:.0f}px")}</div>'
        return (f'<div style="width:{wpx}px;height:{hpx}px;background:#fff;display:flex;align-items:center;justify-content:center;'
                f'font:700 {hpx*0.30:.0f}px Manrope;color:#3A3F47">Muster AG</div>')
    strip = "".join(panel(k, 400, 96) for k in ("navy", "paper", "muster", "navy"))
    rows = "".join(f'<div style="height:22px;background:{"#BDB6AA" if i % 2 else "#C9C2B6"}"></div>' for i in range(10))
    return f"""<section class="folie" data-datei="14-bande" style="background:var(--grund);padding:0">
<div style="position:absolute;left:0;right:0;top:0;height:330px;display:flex;flex-direction:column">{rows}<div style="flex:1;background:#AFA89C"></div></div>
<div style="position:absolute;left:0;top:330px;display:flex;width:1600px;box-shadow:0 6px 0 rgba(0,0,0,.18)">{strip}</div>
<div style="position:absolute;left:0;right:0;top:426px;height:144px;background:#3F6B4A"></div>
<div style="position:absolute;left:0;right:0;top:470px;height:5px;background:#E9EFE8;opacity:.85"></div>
<div style="position:absolute;left:88px;right:88px;top:620px;display:grid;grid-template-columns:1fr 1fr;gap:28px">
<div><div style="height:200px;background:{NAVY};border-radius:6px;display:flex;align-items:center;justify-content:center">{img('wortmarke-dunkel', 'height:100px')}</div>
<p class="cap"><b>LED-Bande auf Navy</b> · <span class="datei">wortmarke-dunkel.svg</span></p></div>
<div><div style="height:200px;background:{PAPER};border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px var(--line)">{img('wortmarke-farbe', 'height:100px')}</div>
<p class="cap"><b>Bande auf Papier</b> · <span class="datei">wortmarke-farbe.svg</span></p></div>
</div>
<p class="mock-cap" style="bottom:34px"><b>Bande</b> · im Wechsel mit dem Sponsor («Muster AG»). Rund um die Wortmarke bleibt mindestens die Höhe des n frei. Auf der echten Bande ist das S weit über 60 px hoch, darum zweifarbig.</p>
</section>"""


def m_startnummer():
    holes = "".join(f'<div style="position:absolute;{p};width:20px;height:20px;border-radius:50%;background:#D5D0C6;box-shadow:inset 0 0 0 4px #A9A398"></div>'
                    for p in ("left:22px;top:22px", "right:22px;top:22px", "left:22px;bottom:22px", "right:22px;bottom:22px"))
    bib = f"""<div style="position:relative;width:940px;height:640px;background:#fff;border-radius:10px;transform:rotate(-1.5deg);
box-shadow:0 18px 40px rgba(0,0,0,.35);overflow:hidden">
<div style="position:absolute;left:64px;top:50px">{img('wortmarke-navy', 'width:230px;display:block')}</div>
<div style="position:absolute;right:64px;top:50px;font:700 26px Manrope;color:#3A3F47;border:2px solid #D6D1C7;border-radius:8px;padding:6px 16px">Muster AG</div>
<div style="position:absolute;left:0;right:0;top:118px;text-align:center;font:800 330px/1 Manrope;color:{NAVY};letter-spacing:-.02em">247</div>
<div style="position:absolute;left:0;right:0;bottom:0;height:86px;background:{TARTAN};display:flex;align-items:center;padding:0 64px;font:600 32px Manrope;color:#fff">Vorname Nachname</div>
{holes}
</div>"""
    return f"""<section class="folie" data-datei="15-startnummer" style="background:{NAVY};padding:0">
<div style="position:absolute;left:330px;top:110px">{bib}</div>
<p class="mock-cap hell"><b>Startnummer</b> · die Nummer dominiert, die Wortmarke steht klein in der Ecke (Navy, da das S hier kleiner als 60 px ist). Unten Tartan mit weisser Schrift (4,96:1).</p>
</section>"""


def m_visitenkarte():
    cw, ch = 680, 440
    front = (f'<div style="width:{cw}px;height:{ch}px;background:{NAVY};border-radius:10px;box-shadow:0 16px 36px rgba(0,0,0,.28);'
             f'display:flex;align-items:center;justify-content:center">{img("wortmarke-dunkel", "width:380px")}</div>')
    back = f"""<div style="width:{cw}px;height:{ch}px;background:{PAPER};border-radius:10px;box-shadow:0 16px 36px rgba(0,0,0,.22);position:relative;padding:56px 60px">
<p style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:34px;line-height:1.1">Sponsoring, das zusammenpasst.</p>
<div style="position:absolute;left:60px;bottom:52px">
<p style="font:600 30px/1.2 Manrope">Vorname Nachname</p>
<p style="font:400 20px/1.4 Manrope;margin-top:6px" class="muted">Funktion</p>
<p style="font:600 20px/1.5 Manrope;margin-top:26px;color:{AKZENT}">hello@sponsuno.ch</p>
<p style="font:400 20px/1.5 Manrope">sponsuno.ch</p></div></div>"""
    return f"""<section class="folie" data-datei="16-visitenkarte" style="background:var(--grund);padding:0">
<div style="position:absolute;left:88px;top:230px">{front}<p class="muted" style="font-size:16px;margin-top:20px">Vorderseite · <span class="datei">wortmarke-dunkel.svg</span></p></div>
<div style="position:absolute;right:88px;top:230px">{back}<p class="muted" style="font-size:16px;margin-top:20px">Rückseite · Claim in Cormorant Garamond, Text in Manrope</p></div>
<p class="mock-cap"><b>Visitenkarte</b> · 85 × 55 mm. Vorne die Wortmarke dunkel auf Navy, hinten Papier mit Namen und Kontakt; E-Mail im Text-Akzent.</p>
</section>"""


def m_homescreen():
    names = ["Sponsuno", "Kalender", "Notizen", "Wetter", "Karten", "Musik", "Fotos", "Uhr",
             "Rechner", "Kamera", "Mail", "Dateien", "Bücher", "Podcasts", "Erinnerungen", "Einstellungen"]
    greys = ["#B9B4AB", "#A9A49B", "#C3BEB4", "#9F9A91"]
    cells = []
    for i, n in enumerate(names):
        if i == 0:
            icon = img("symbol-kachel", "width:76px;height:76px;display:block")
        else:
            icon = f'<div style="width:76px;height:76px;border-radius:17px;background:{greys[i % 4]}"></div>'
        cells.append(f'<div style="display:flex;flex-direction:column;align-items:center;gap:7px">{icon}'
                     f'<span style="font:500 13px Manrope;color:#1F242C;white-space:nowrap">{n}</span></div>')
    dock = "".join(f'<div style="width:76px;height:76px;border-radius:17px;background:{g}"></div>' for g in greys)
    phone = f"""<div style="width:440px;height:900px;border-radius:64px;background:#14171C;padding:14px;box-shadow:0 24px 50px rgba(0,0,0,.3)">
<div style="width:100%;height:100%;border-radius:52px;background:#D8D2C6;position:relative;overflow:hidden">
<div style="display:flex;justify-content:space-between;padding:22px 38px 0;font:600 17px Manrope;color:#1F242C"><span>9:41</span><span style="width:110px;height:30px;border-radius:15px;background:#14171C;position:absolute;left:50%;top:14px;transform:translateX(-50%)"></span><svg width="40" height="12" viewBox="0 0 40 12" aria-hidden="true"><circle cx="6" cy="6" r="5" fill="#1F242C"/><circle cx="20" cy="6" r="5" fill="#1F242C"/><circle cx="34" cy="6" r="5" fill="#1F242C"/></svg></div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);row-gap:26px;padding:56px 24px 0">{''.join(cells)}</div>
<div style="position:absolute;left:16px;right:16px;bottom:16px;height:108px;border-radius:36px;background:rgba(255,255,255,.35);display:flex;justify-content:space-around;align-items:center;padding:0 10px">{dock}</div>
</div></div>"""

    def sz(name, px, lbl=None):
        return (f'<div style="display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:10px">'
                f'{img(name, f"width:{px}px;height:{px}px;display:block")}<span class="muted" style="font-size:14px">{lbl or f"{px} px"}</span></div>')
    light = "".join([sz("symbol-kachel", 180), sz("symbol-kachel", 120), sz("symbol-kachel", 60), sz("symbol-kachel", 40),
                     sz("symbol-kachel-klein", 24), sz("symbol-kachel-klein", 16)])
    def szd(name, px):
        return sz(name, px).replace('class="muted" style="font-size:14px"', 'style="font-size:14px;color:#C9C6BF"')
    dark = "".join([szd("symbol-kachel", 120), szd("symbol-kachel", 60), szd("symbol-kachel-klein", 24)])
    return f"""<section class="folie" data-datei="17-app-icon-homescreen" style="background:var(--grund);padding:0">
<div style="position:absolute;left:150px;top:50px">{phone}</div>
<div style="position:absolute;left:720px;top:150px;right:88px">
<p class="kicker">App-Icon</p><h3 style="font-size:40px">Die Kachel in echter Grösse</h3>
<div style="display:flex;gap:30px;align-items:flex-end;margin-top:34px">{light}</div>
<p class="muted" style="font-size:15px;margin-top:12px">Ab 32 px <span class="datei">symbol-kachel.svg</span>, darunter <span class="datei">symbol-kachel-klein.svg</span>.</p>
<div style="display:flex;gap:30px;align-items:flex-end;margin-top:34px;background:#1C1C1E;border-radius:16px;padding:28px 30px 18px;width:fit-content">{dark}</div>
<p class="muted" style="font-size:15px;margin-top:12px">Auf dunklem Hintergrund trägt das helle S; die Navy-Kachel selbst tritt zurück.</p>
</div>
<p class="mock-cap" style="left:720px"><b>App-Icon auf dem Homescreen</b> · alle anderen Icons sind neutrale Platzhalter.</p>
</section>"""


def m_email():
    side = "".join(f'<div style="padding:10px 18px;border-radius:8px;{"background:#E9E4DA;font-weight:600" if i == 0 else ""}">{t}</div>'
                   for i, t in enumerate(["Posteingang", "Markiert", "Gesendet", "Entwürfe", "Archiv"]))
    body = f"""<div style="width:620px;margin:0 auto;background:#fff;border-radius:6px;overflow:hidden;box-shadow:0 0 0 1px #ECE7DD">
<div style="background:{NAVY};padding:26px 36px">{img('wortmarke-hell', 'width:170px;display:block')}</div>
<div style="padding:34px 36px 30px">
<p style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:36px;line-height:1.1">Danke, Sie stehen auf der Warteliste</p>
<p style="font-size:16px;line-height:1.6;margin-top:16px">Ihre Anmeldung ist bestätigt. Sponsuno bringt Sportlerinnen, Sportler, Sport- und Kulturvereine mit passenden Sponsoren aus ihrer Region zusammen, und der KI-Manager hilft danach bei der Partnerschaft.</p>
<p style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:25px;margin-top:22px">So geht es weiter</p>
<p style="font-size:16px;line-height:1.6;margin-top:8px">Sponsuno startet bald in der Deutschschweiz. Wir schreiben Ihnen zum Start.</p>
<div style="margin-top:18px;border:1px solid #E6E0D4;border-radius:10px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center">
<div><p style="font-size:13px;color:{AKZENT};font-weight:600">Ratgeber</p><p style="font-size:16px;font-weight:600">Sponsoren finden</p></div><svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true"><path d="M1 8H19M13 2L19 8L13 14" fill="none" stroke="{AKZENT}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
<p style="font-size:16px;line-height:1.6;margin-top:20px">Freundliche Grüsse<br>Das Sponsuno-Team</p>
</div></div>"""
    win = f"""<div style="width:1424px;height:800px;background:#fff;border-radius:14px;box-shadow:0 18px 44px rgba(0,0,0,.18);overflow:hidden;display:grid;grid-template-columns:240px 1fr">
<div style="background:#F4F1EA;padding:22px 14px;font-size:16px;color:#2A2F38"><div style="display:flex;gap:8px;padding:0 6px 22px"><i style="width:12px;height:12px;border-radius:50%;background:#D9D3C8"></i><i style="width:12px;height:12px;border-radius:50%;background:#D9D3C8"></i><i style="width:12px;height:12px;border-radius:50%;background:#D9D3C8"></i></div>{side}</div>
<div style="display:flex;flex-direction:column;min-height:0">
<div style="padding:22px 36px;border-bottom:1px solid #EEE9E0">
<p style="font:600 20px Manrope">Danke, Sie stehen auf der Warteliste</p>
<p class="muted" style="font-size:15px;margin-top:4px">Sponsuno &lt;hello@sponsuno.ch&gt;</p></div>
<div style="flex:1;background:#F6F3EC;padding:28px 0;overflow:hidden">{body}</div></div></div>"""
    return f"""<section class="folie" data-datei="18-e-mail" style="background:var(--grund);padding:0">
<div style="position:absolute;left:88px;top:56px">{win}</div>
<p class="mock-cap" style="bottom:42px"><b>E-Mail</b> · Kopf in Navy mit der Wortmarke hell (das S ist hier nur gut 20 px hoch, darum einfarbig); Text der Willkommens-E-Mail aus emails/src/willkommen.html (gekürzt).</p>
</section>"""


def s_dateien():
    rows = [
        ("wortmarke-farbe.svg", "Logo auf hellen Gründen, ab ca. 60 px S-Höhe", "Papier, Ivory, Weiss"),
        ("wortmarke-navy.svg", "Kleine Grössen auf Hell (S unter ca. 60 px), Dokumente", "Papier, Ivory, Weiss"),
        ("wortmarke-schwarz.svg", "Einfarbiger Druck, Stempel, Gravur", "Weiss"),
        ("wortmarke-dunkel.svg", "Logo auf Navy ab ca. 60 px S-Höhe (Bande, Trikot, Visitenkarte vorne)", "Navy"),
        ("wortmarke-hell.svg", "Klein auf Navy: Website-Header, E-Mail-Kopf, Link-Vorschau", "Navy"),
        ("wortmarke-weiss.svg", "Einfarbig: Siebdruck, Stick, Folie", "Navy, dunkles Textil"),
        ("wortmarke-claim-farbe.svg", "Mit Claim, ab 240 px / 50 mm", "Papier, Ivory, Weiss"),
        ("wortmarke-claim-dunkel.svg", "Mit Claim auf Navy, ab 240 px / 50 mm", "Navy"),
        ("symbol-farbe.svg", "Symbol ab 32 px, wo die Wortmarke nicht passt", "Papier, Ivory, Weiss"),
        ("symbol-navy.svg · symbol-tartan.svg", "Einfarbig, z. B. Prägung, Ein-Farben-Druck", "Hell"),
        ("symbol-schwarz.svg", "Schwarzweissdruck", "Weiss"),
        ("symbol-dunkel.svg · symbol-hell.svg", "Symbol auf Navy, zweifarbig oder einfarbig", "Navy"),
        ("symbol-weiss.svg", "Einfarbig: Siebdruck, Folie, Prägung", "Navy, dunkles Textil"),
        ("symbol-klein.svg", "Symbol von 16 bis 31 px, im Druck unter 8 mm, Stick", "Hell"),
        ("symbol-kachel.svg", "App-Icon, Profilbild (social/profilbild-1080.png), ab 32 px", "Beliebig"),
        ("symbol-kachel-klein.svg", "Favicon, 16 bis 31 px", "Beliebig"),
    ]
    tr = "".join(f'<tr><td class="datei" style="font-size:15px">{a}</td><td>{b}</td><td class="muted">{c}</td></tr>' for a, b, c in rows)
    return f"""<section class="folie" data-datei="19-dateien">
<p class="kicker">Dateien</p><h2>Welche Datei wofür</h2>
<table style="width:100%;border-collapse:collapse;margin-top:18px;font-size:15.5px;line-height:1.25">
<thead><tr style="text-align:left"><th style="font-weight:600;padding:6px 0;width:440px">Datei</th><th style="font-weight:600">Wofür</th><th style="font-weight:600;width:300px">Hintergrund</th></tr></thead>
<tbody>{tr}</tbody></table>
<p class="muted" style="font-size:15px;margin-top:14px">Alle Master liegen in brand/logo/svg/, Masse und Farben in brand/_quellen/spec.json.</p>
<style>section[data-datei="19-dateien"] td{{padding:5.5px 18px 5.5px 0;border-top:1px solid var(--line)}}</style>
{fuss()}</section>"""


SLIDES = [s_titel, s_idee, s_wortmarke, s_claim, s_wortmarke_fassungen, s_symbol_fassungen, s_klein, s_farben, s_typo,
          s_schutzraum, s_nicht, s_einsatz, m_trikot, m_bande, m_startnummer, m_visitenkarte, m_homescreen, m_email,
          s_dateien]


# ---------------------------------------------------------------- Chrome

def find_chrome():
    for p in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/Applications/Chromium.app/Contents/MacOS/Chromium"):
        if os.path.exists(p):
            return p
    for n in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser"):
        p = shutil.which(n)
        if p:
            return p
    sys.exit("Chrome/Chromium nicht gefunden")


CHROME = None


def chrome(url, extra, timeout=90):
    with tempfile.TemporaryDirectory() as prof:
        cmd = [CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
               "--no-default-browser-check", "--use-mock-keychain", "--password-store=basic", "--disable-extensions",
               "--allow-file-access-from-files", "--virtual-time-budget=4000", f"--user-data-dir={prof}", *extra, url]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=timeout)


def shot(url, png, w=W, h=H, scale=1.0):
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "shot.png")
        chrome(url, [f"--window-size={w},{h}", f"--force-device-scale-factor={scale}", f"--screenshot={out}"])
        if not os.path.exists(out):
            raise RuntimeError("kein Screenshot: " + url)
        shutil.move(out, png)


# ---------------------------------------------------------------- board (presentation_board.py)

BOARD_FIX = [
    ("Business cards", "Visitenkarten"), ("App icon", "App-Icon"), ("Social profile", "Social-Media-Profil"),
    ("Storefront / signage", "Schild am Eingang"), ("Browser tab", "Browser-Tab"),
    ("<b>Alex Morgan</b><br>Founder<br>alex@sponsuno.com", "<b>Vorname Nachname</b><br>Funktion<br>hello@sponsuno.ch"),
    ("Sponsuno — Home", "Sponsuno"), ("@sponsuno · ", ""), ("https://sponsuno.com", "sponsuno.ch"),
    ("background:#161616", f"background:{NAVY}"), ("Im Einsatz · in use", "Im Einsatz"),
]


def build_board(fonts):
    script = os.path.join(SKILL, "scripts", "presentation_board.py")
    target = os.path.join(OUT, "12-im-einsatz.png")
    if not os.path.exists(script):
        print("Skill nicht gefunden, 12-im-einsatz.png bleibt wie es ist:", script)
        return
    with tempfile.TemporaryDirectory() as tmp:
        raw = os.path.join(tmp, "board.html")
        subprocess.run([sys.executable, "-I", script, os.path.join(HERE, "board-spec.json"), "-o", raw], check=True)
        with open(raw, encoding="utf-8") as fh:
            doc = fh.read()
        css = re.search(r"<style>(.*?)</style>", doc, re.S).group(1)
        slides = re.findall(r'<section class="slide">.*?</section>', doc, re.S)
        use = next(s for s in slides if 'class="mock"' in s)
        for a, b in BOARD_FIX:
            use = use.replace(a, b)
        # favicon tab: the real favicon (small cut on the tile), not the 16 px master
        kachel = "data:image/svg+xml;base64," + base64.b64encode(svg_text("symbol-kachel-klein").encode()).decode()
        use = re.sub(r'(<div class="tab"><img class="[^"]*" src=")[^"]+(")', lambda m: m.group(1) + kachel + m.group(2), use)

        def b64(name):
            return "data:image/svg+xml;base64," + base64.b64encode(svg_text(name).encode()).decode()
        checks = {}
        # Website: der echte Header ist auf jeder Seite Navy; das S ist dort klein, also wortmarke-hell
        use, checks["website"] = re.subn(r'<div class="nav"><img class="[^"]*" src="[^"]+"',
                                         f'<div class="nav"><img class="" src="{b64("wortmarke-hell")}"', use)
        # Social-Media-Profil: Profilbild ist die Kachel (wie social/profilbild-1080.png), nicht das Farbsymbol
        use, checks["social"] = re.subn(r'<div class="av"><img class="[^"]*" src="[^"]+" style="[^"]*">',
                                        f'<div class="av" style="background:{NAVY}"><img src="{b64("symbol-kachel")}" '
                                        'style="width:100%;height:100%;display:block">', use)
        # Visitenkarte, Navy-Seite: Wortmarke dunkel wie auf Folie 16, nicht das Symbol
        use, checks["card"] = re.subn(r'(<div class="bc2" style="[^"]*">)<img class="[^"]*" src="[^"]+" style="[^"]*">',
                                      lambda m: m.group(1) + f'<img src="{b64("wortmarke-dunkel")}" style="width:160px">', use)
        missing = [k for k, n in checks.items() if n != 1]
        if missing:
            sys.exit("12-im-einsatz: Ersetzung greift nicht mehr (HTML der Skill geändert?): " + ", ".join(missing))
        use = re.sub(r"<h2>.*?</h2>", "<h2>Übersicht</h2>", use, count=1, flags=re.S)
        use = re.sub(r'<div class="foot">.*?</div>', f'<div class="foot"><span>{FOOT}</span><span>Stand November 2026</span></div>', use, flags=re.S)
        over = (fonts + "body,.slide{font-family:Manrope,system-ui,sans-serif;color:#0B1830}"
                "body{background:#FBF9F4;margin:0}.slide{margin:0;box-shadow:none;min-height:800px;height:800px;background:#FBF9F4}"
                ".kicker{text-transform:none;letter-spacing:0;font:600 14px/1.3 Manrope;color:#A8401F;margin-bottom:10px}"
                ".slide h2{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:46px;line-height:1.06;letter-spacing:-.005em}"
                ".foot{font-size:11.2px;color:#535B6B;bottom:27px;left:70px;right:70px}.slide{padding:58px 70px 70px}"
                ".mock{margin-top:22px}.m .lbl{font-size:12px;color:#0B1830;background:rgba(255,255,255,.85)}"
                ".sign{background:#8C8F93}.screen{background:#DDE2E7}"
                ".web .nav{background:#0B1830;color:rgba(243,239,230,.85);border-bottom:0}"
                ".web .hero2 b{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:21px}")
        page = (f"<!doctype html><html lang='de-CH'><head><meta charset='utf-8'><style>{css}</style><style>{over}</style></head>"
                f"<body>{use}</body></html>")
        fixed = os.path.join(tmp, "board-de.html")
        with open(fixed, "w", encoding="utf-8") as fh:
            fh.write(page)
        shot("file://" + fixed, target, 1280, 800, 1.25)
    print("geschrieben", os.path.relpath(target, REPO))


# ---------------------------------------------------------------- main

def main():
    global CHROME
    CHROME = find_chrome()
    os.makedirs(OUT, exist_ok=True)
    fonts = font_face()
    build_board(fonts)
    sections = [f() for f in SLIDES]
    script = ("<script>var m=location.hash.match(/folie=(\\d+)/);if(m){document.documentElement.className='einzeln';"
              "document.querySelectorAll('section.folie').forEach(function(s,i){s.hidden=(i+1)!=+m[1]});}</script>")
    doc = (f"<!doctype html><html lang='de-CH'><head><meta charset='utf-8'><title>Sponsuno · Logo-Präsentation</title>"
           f"<style>{fonts}\n{CSS}</style></head><body>{''.join(sections)}{script}</body></html>")
    with open(DECK, "w", encoding="utf-8") as fh:
        fh.write(doc)
    print("geschrieben", os.path.relpath(DECK, REPO), f"({len(sections)} Folien)")
    names = re.findall(r'<section class="folie[^"]*" data-datei="([^"]+)"( data-bild="1")?', doc)
    only = set(sys.argv[1:])
    for i, (name, is_img) in enumerate(names, 1):
        if is_img or (only and name not in only):
            continue
        png = os.path.join(OUT, name + ".png")
        shot("file://" + DECK + f"#folie={i}", png)
        print("geschrieben", os.path.relpath(png, REPO))
    if not only:
        with tempfile.TemporaryDirectory() as tmp:
            pdf = os.path.join(tmp, "deck.pdf")
            chrome("file://" + DECK, [f"--print-to-pdf={pdf}", "--no-pdf-header-footer", "--print-to-pdf-no-header"])
            if not os.path.exists(pdf):
                raise RuntimeError("kein PDF")
            shutil.move(pdf, os.path.join(OUT, PDF_NAME))
        print("geschrieben", os.path.join("brand/praesentation", PDF_NAME))


if __name__ == "__main__":
    main()
