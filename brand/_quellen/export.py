#!/usr/bin/env python3
"""Sponsuno: Lieferdateien aus den SVG-Mastern (brand/logo/svg/).

Schreibt
  brand/logo/png/   transparente PNGs: Wortmarken 600 und 1800 px breit, Symbole 512 und 1024 px,
                    Kleinschnitt 16 und 24 px
  brand/logo/pdf/   Vektor-PDFs für Druckerei, Stick und Textil (Seite = Tinte plus Schutzraum)
  brand/icons/      favicon.ico (16/32/48), favicon.svg, apple-touch-icon.png, icon-192/512.png,
                    icon-maskable-512.png, site.webmanifest, head-snippet.html
  brand/social/     profilbild-1080.png, linkedin-banner-1584x396.png, og-bild-1200x630.png,
                    e-mail-signatur.png

icons/ ist ein fertiger Satz fürs Web-Root. Zwei Dateien darin sind Kopien: icons/favicon.svg ist
logo/svg/symbol-kachel-klein.svg, icons/icon-512.png ist dasselbe Bild wie logo/png/symbol-kachel-512.png.
Nie von Hand bearbeiten: Master ändern (build.py) und dieses Skript neu laufen lassen.

Die Logo-Geometrie wird nie verändert. Das Skript liest nur die Pfade der Master und setzt sie in
Rahmen (viewBox, Kachel, Seite). Raster und PDF macht headless Chrome (Chrome, Chromium, Edge oder Brave).
Für Masse braucht es fontTools (wie build.py).

Aus dem Repo-Ordner:
  <python mit fonttools> -I brand/_quellen/export.py
"""
import base64
import concurrent.futures
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import time
import zlib
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.svgLib.path import parse_path

HERE = Path(__file__).resolve().parent
BRAND = HERE.parent
REPO = BRAND.parent
SVG_DIR = BRAND / "logo" / "svg"
OUT_PNG = BRAND / "logo" / "png"
OUT_PDF = BRAND / "logo" / "pdf"
OUT_ICONS = BRAND / "icons"
OUT_SOCIAL = BRAND / "social"
FONTS = REPO / "node_modules" / "@fontsource"

SPEC = json.loads((HERE / "spec.json").read_text(encoding="utf-8"))
COL = {c["name"]: c["hex"] for c in SPEC["colours"]}
NAVY, IVORY, TARTAN_HELL = COL["Navy"], COL["Ivory"], COL["Tartan hell"]
X_WORDMARK = SPEC["clear_space"]["wordmark"]["units"]  # Schutzraum Wortmarke (x-Höhe)
Y_SYMBOL = SPEC["clear_space"]["symbol"]["units"]       # Schutzraum Symbol (1/4 S-Höhe)

# Texte für Social-Grafiken, wörtlich von der Website: Claim = hero.titleStart + titleAccent (src/content.ts),
# Startsignal = hero.badge (laut AGENTS.md auch die Zeile des heutigen Share-Bilds), footer.sub fürs Manifest
CLAIM = "Sponsoring, das zusammenpasst."
LAUNCH = "Bald verfügbar in der Deutschschweiz"
FOOTER_SUB = "Sponsoren finden für Sport und Kultur in der Deutschschweiz."
DOMAIN = "sponsuno.ch"

CHROME_CANDIDATES = [
    os.environ.get("CHROME", ""),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "google-chrome", "google-chrome-stable", "chromium", "chromium-browser",
]


# ----------------------------------------------------------------------------- Master lesen

def master(name):
    return (SVG_DIR / f"{name}.svg").read_text(encoding="utf-8")


def paths_of(svg):
    return re.findall(r'<path fill="([^"]+)" d="([^"]+)"/>', svg)


def view_box(svg):
    return [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]


def body_of(svg):
    """Nur die Pfade, ohne <title>/<desc>."""
    return "".join(f'<path fill="{f}" d="{d}"/>' for f, d in paths_of(svg))


def bounds(path_list):
    xs0, ys0, xs1, ys1 = [], [], [], []
    for _fill, d in path_list:
        pen = BoundsPen(None)
        parse_path(d, pen)
        b = pen.bounds
        xs0.append(b[0]); ys0.append(b[1]); xs1.append(b[2]); ys1.append(b[3])
    return min(xs0), min(ys0), max(xs1), max(ys1)


class _FlattenPen(BasePen):
    def __init__(self):
        super().__init__(None)
        self.pts = []
        self._cur = (0, 0)

    def _moveTo(self, p):
        self.pts.append(p); self._cur = p

    def _lineTo(self, p):
        self.pts.append(p); self._cur = p

    def _curveToOne(self, p1, p2, p3):
        p0 = self._cur
        for i in range(1, 17):
            t = i / 16; u = 1 - t
            self.pts.append((u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
                             u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1]))
        self._cur = p3

    def _qCurveToOne(self, p1, p2):
        p0 = self._cur
        for i in range(1, 17):
            t = i / 16; u = 1 - t
            self.pts.append((u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
                             u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]))
        self._cur = p2


def max_radius(path_list, cx, cy):
    """Grösster Abstand der Kontur vom Punkt (cx, cy), für Kreis-Beschnitt und Maskable-Safe-Zone."""
    r = 0.0
    for _f, d in path_list:
        pen = _FlattenPen()
        parse_path(d, pen)
        r = max(r, max(math.hypot(x - cx, y - cy) for x, y in pen.pts))
    return r


def svg_doc(vb, body, w, h, title=None, extra_attrs=""):
    t = f"<title>{title}</title>" if title else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(f"{v:g}" for v in vb)}" '
            f'width="{w}" height="{h}"{extra_attrs}>{t}{body}</svg>')


def fit_view_box(vb, w, h):
    """viewBox so erweitern, dass er genau w×h px füllt (Inhalt mittig, nichts beschnitten)."""
    x, y, vw, vh = vb
    if vw / vh > w / h:
        nh = vw * h / w
        return [x, y - (nh - vh) / 2, vw, nh]
    nw = vh * w / h
    return [x - (nw - vw) / 2, y, nw, vh]


def full_tile(name):
    """Kachel-Master mit vollflächigem Quadrat statt abgerundeter Kachel (iOS und Android runden selbst)."""
    p = paths_of(master(name))
    assert p[0][0] == NAVY, "erster Pfad der Kachel muss die Navy-Kachel sein"
    return [(NAVY, "M0 0H256V256H0Z")] + p[1:]


# ----------------------------------------------------------------------------- Chrome

def find_chrome():
    for c in CHROME_CANDIDATES:
        if not c:
            continue
        if os.path.isabs(c) and os.path.exists(c):
            return c
        found = shutil.which(c)
        if found:
            return found
    sys.exit("Kein Chrome/Chromium gefunden (Pfad mit CHROME=/pfad/zu/chrome angeben).")


CHROME = None
CHROME_FLAGS = ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
                "--no-default-browser-check", "--use-mock-keychain", "--password-store=basic",
                "--disable-extensions", "--force-device-scale-factor=1", "--force-color-profile=srgb"]


def _stop(proc):
    if proc.poll() is None:
        proc.terminate()
        try:
            proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            proc.kill()


def screenshot(html, png, w, h):
    """HTML (String) als PNG w×h; transparent, wo die Seite transparent ist."""
    with tempfile.TemporaryDirectory(prefix="sponsuno-export-") as tmp:
        page = os.path.join(tmp, "page.html")
        Path(page).write_text(html, encoding="utf-8")
        shot = os.path.join(tmp, "shot.png")
        for _attempt in range(3):
            cmd = [CHROME, *CHROME_FLAGS, "--default-background-color=00000000", f"--window-size={w},{h}",
                   f"--screenshot={shot}", f"--user-data-dir={os.path.join(tmp, 'profile')}", "file://" + page]
            proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            deadline, last = time.time() + 60, -1
            while time.time() < deadline:
                if os.path.exists(shot):
                    size = os.path.getsize(shot)
                    if size > 0 and size == last:
                        break
                    last = size
                if proc.poll() is not None and os.path.exists(shot):
                    break
                time.sleep(0.25)
            try:
                proc.wait(timeout=1)
            except subprocess.TimeoutExpired:
                pass
            _stop(proc)
            if os.path.exists(shot) and png_size(shot) == (w, h):
                break
        else:
            raise RuntimeError(f"Chrome-Screenshot fehlgeschlagen: {png}")
        shutil.move(shot, png)


def print_pdf(html, pdf):
    with tempfile.TemporaryDirectory(prefix="sponsuno-export-") as tmp:
        page = os.path.join(tmp, "page.html")
        Path(page).write_text(html, encoding="utf-8")
        out = os.path.join(tmp, "out.pdf")
        cmd = [CHROME, *CHROME_FLAGS, "--no-pdf-header-footer", "--print-to-pdf-no-header",
               f"--print-to-pdf={out}", f"--user-data-dir={os.path.join(tmp, 'profile')}", "file://" + page]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)
        if not os.path.exists(out):
            raise RuntimeError(f"Chrome-PDF fehlgeschlagen: {pdf}")
        shutil.move(out, pdf)


def png_size(path):
    with open(path, "rb") as fh:
        head = fh.read(24)
    if head[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    return struct.unpack(">II", head[16:24])


def write_ico(pngs, ico):
    """.ico mit eingebetteten PNGs (alle aktuellen Browser, Windows ab Vista)."""
    blobs = [Path(p).read_bytes() for p in pngs]
    offset = 6 + 16 * len(blobs)
    out = struct.pack("<HHH", 0, 1, len(blobs))
    for p, blob in zip(pngs, blobs):
        w, h = png_size(p)
        out += struct.pack("<BBBBHHII", w % 256, h % 256, 0, 0, 1, 32, len(blob), offset)
        offset += len(blob)
    Path(ico).write_bytes(out + b"".join(blobs))


# ----------------------------------------------------------------------------- HTML-Hüllen

def raster_page(svg, w, h, bg="transparent"):
    return (f"<!doctype html><html><head><meta charset='utf-8'><style>html,body{{margin:0;padding:0;"
            f"width:{w}px;height:{h}px;overflow:hidden;background:{bg}}}svg{{display:block}}</style></head>"
            f"<body>{svg}</body></html>")


def font_face(family, weight, file):
    data = base64.b64encode((FONTS / file).read_bytes()).decode("ascii")
    return (f"@font-face{{font-family:'{family}';font-weight:{weight};font-style:normal;"
            f"src:url(data:font/woff2;base64,{data}) format('woff2')}}")


def fonts_css():
    return "".join([
        font_face("Cormorant Garamond", 600, "cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2"),
        font_face("Manrope", 400, "manrope/files/manrope-latin-400-normal.woff2"),
        font_face("Manrope", 600, "manrope/files/manrope-latin-600-normal.woff2"),
    ])


# ----------------------------------------------------------------------------- Aufträge

def png_jobs():
    """(html, ziel, w, h) für logo/png/."""
    jobs = []
    wordmarks = ["wortmarke-farbe", "wortmarke-navy", "wortmarke-schwarz", "wortmarke-dunkel", "wortmarke-hell",
                 "wortmarke-weiss",
                 "wortmarke-claim-farbe", "wortmarke-claim-dunkel"]
    for name in wordmarks:
        svg = master(name)
        vb = view_box(svg)
        for w in (600, 1800):
            h = round(w * vb[3] / vb[2])
            doc = svg_doc(fit_view_box(vb, w, h), body_of(svg), w, h)
            jobs.append((raster_page(doc, w, h), OUT_PNG / f"{name}-{w}.png", w, h))
    symbols = ["symbol-farbe", "symbol-navy", "symbol-tartan", "symbol-schwarz", "symbol-dunkel", "symbol-hell",
               "symbol-weiss",
               "symbol-kachel"]
    for name in symbols:
        svg = master(name)
        for s in (512, 1024):
            jobs.append((raster_page(svg_doc(view_box(svg), body_of(svg), s, s), s, s),
                         OUT_PNG / f"{name}-{s}.png", s, s))
    svg = master("symbol-klein")  # Kleinschnitt: nur 16 bis 31 px (ab 32 px der Master, siehe spec.json)
    for s in (16, 24):
        jobs.append((raster_page(svg_doc(view_box(svg), body_of(svg), s, s), s, s),
                     OUT_PNG / f"symbol-klein-{s}.png", s, s))
    return jobs


def icon_jobs(tmp):
    jobs = []
    small = master("symbol-kachel-klein")
    rounded = master("symbol-kachel")
    # nur für favicon.ico: 16 px im Kleinschnitt, ab 32 px der Master auf der Kachel (Regel in spec.json)
    for s in (16, 32, 48):
        src = small if s < 32 else rounded
        jobs.append((raster_page(svg_doc([0, 0, 256, 256], body_of(src), s, s), s, s),
                     Path(tmp) / f"favicon-{s}.png", s, s))
    for s in (192, 512):  # "any": abgerundete Kachel, transparente Ecken
        jobs.append((raster_page(svg_doc([0, 0, 256, 256], body_of(rounded), s, s), s, s),
                     OUT_ICONS / f"icon-{s}.png", s, s))
    square = full_tile("symbol-kachel")
    body_sq = "".join(f'<path fill="{f}" d="{d}"/>' for f, d in square)
    jobs.append((raster_page(svg_doc([0, 0, 256, 256], body_sq, 180, 180), 180, 180),
                 OUT_ICONS / "apple-touch-icon.png", 180, 180))
    # Maskable: S muss im Kreis mit 40 % Radius (Safe Zone 80 %) liegen; Ziel 36 %, damit es nicht anstösst
    s_paths = square[1:]
    r = max_radius(s_paths, 128, 128)
    k = min(1.0, 0.36 * 256 / r)
    vb = [128 - 128 / k, 128 - 128 / k, 256 / k, 256 / k]
    body_mask = f'<rect x="{vb[0]:g}" y="{vb[1]:g}" width="{vb[2]:g}" height="{vb[3]:g}" fill="{NAVY}"/>' + \
        "".join(f'<path fill="{f}" d="{d}"/>' for f, d in s_paths)
    jobs.append((raster_page(svg_doc(vb, body_mask, 512, 512), 512, 512),
                 OUT_ICONS / "icon-maskable-512.png", 512, 512))
    return jobs, r, k


def social_jobs():
    jobs = []
    css = fonts_css()
    # Profilbild: wie apple-touch-icon, vollflächig, für Kreis-Beschnitt
    square = full_tile("symbol-kachel")
    body_sq = "".join(f'<path fill="{f}" d="{d}"/>' for f, d in square)
    jobs.append((raster_page(svg_doc([0, 0, 256, 256], body_sq, 1080, 1080), 1080, 1080),
                 OUT_SOCIAL / "profilbild-1080.png", 1080, 1080))

    # LinkedIn-Banner: Wortmarke mit Claim (Master) mittig. Mitte, weil LinkedIn links unten das Profilbild
    # darüberlegt und mobil seitlich beschneidet.
    claim = master("wortmarke-claim-dunkel")
    cb = bounds(paths_of(claim))
    ink_w = 560
    k = ink_w / (cb[2] - cb[0])
    W, H = 1584, 396
    vb = [cb[0] - (W / k - (cb[2] - cb[0])) / 2, cb[1] - (H / k - (cb[3] - cb[1])) / 2, W / k, H / k]
    banner = svg_doc(vb, f'<rect x="{vb[0]:g}" y="{vb[1]:g}" width="{vb[2]:g}" height="{vb[3]:g}" fill="{NAVY}"/>'
                     + body_of(claim), W, H)
    jobs.append((raster_page(banner, W, H, NAVY), OUT_SOCIAL / "linkedin-banner-1584x396.png", W, H))

    # OG-Bild: Aufbau wie scripts/og/og-image.html der Website, in der Tartan-Palette, ohne Verlauf.
    # Wortmarke einfarbig hell: das S ist hier knapp 40 px hoch und in Link-Vorschauen noch kleiner (unter 60 px S-Höhe
    # einfarbig, siehe spec.json rules.twotone_wordmark)
    wm = master("wortmarke-hell")
    wb = bounds(paths_of(wm))
    wm_w = 250
    wm_h = round(wm_w * (wb[3] - wb[1]) / (wb[2] - wb[0]))
    wm_svg = svg_doc([wb[0], wb[1], wb[2] - wb[0], wb[3] - wb[1]], body_of(wm), wm_w, wm_h,
                     extra_attrs=' role="img" aria-label="Sponsuno"')
    og = f"""<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><style>{css}
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}
body{{box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;
padding:80px 88px 72px;background:{NAVY};color:{IVORY};-webkit-font-smoothing:antialiased}}
svg{{display:block}}
.rule{{width:72px;height:3px;background:{TARTAN_HELL};margin-bottom:34px}}
h1{{margin:0;font:600 96px/1 'Cormorant Garamond',Georgia,serif;letter-spacing:-0.01em;color:{IVORY}}}
.line{{margin:0;display:flex;justify-content:space-between;align-items:baseline;gap:32px;
font:400 25px/1.4 Manrope,system-ui,sans-serif;color:rgba(243,239,230,.74)}}
.domain{{font-weight:600;color:{TARTAN_HELL}}}
</style></head><body>{wm_svg}<div><div class="rule"></div><h1>{CLAIM}</h1></div>
<p class="line"><span>{LAUNCH}</span><span class="domain">{DOMAIN}</span></p></body></html>"""
    jobs.append((og, OUT_SOCIAL / "og-bild-1200x630.png", 1200, 630))

    # E-Mail-Signatur: wortmarke-navy (zweifarbig erst ab ca. 60 px S-Höhe), 2× für 240 px Anzeigebreite,
    # rundum Schutzraum X, deckend weiss, damit sie im Dunkelmodus von Mail-Programmen nicht verschwindet
    nv = master("wortmarke-navy")
    nb = bounds(paths_of(nv))
    vbn = [nb[0] - X_WORDMARK, nb[1] - X_WORDMARK, nb[2] - nb[0] + 2 * X_WORDMARK, nb[3] - nb[1] + 2 * X_WORDMARK]
    w = 480
    h = round(w * vbn[3] / vbn[2])
    jobs.append((raster_page(svg_doc(fit_view_box(vbn, w, h), body_of(nv), w, h), w, h, "#FFFFFF"),
                 OUT_SOCIAL / "e-mail-signatur.png", w, h))
    return jobs


def pdf_specs():
    """Vektor-PDFs. Seite = Tintenkante plus Schutzraum (Wortmarke X, Symbol Y; Kachel = Schutzraum)."""
    MM_WORDMARK = 120.0  # Tintenbreite der Wortmarke in mm
    MM_SYMBOL = 40.0     # S-Höhe des Symbols in mm
    MM_TILE = 60.0       # Kantenlänge der Kachel in mm
    rows = [
        ("wortmarke-farbe", "Sponsuno Wortmarke Farbe", X_WORDMARK, None, "wordmark"),
        ("wortmarke-dunkel", "Sponsuno Wortmarke dunkel (auf Navy)", X_WORDMARK, NAVY, "wordmark"),
        ("wortmarke-schwarz", "Sponsuno Wortmarke Schwarz", X_WORDMARK, None, "wordmark"),
        ("symbol-farbe", "Sponsuno Symbol Farbe", Y_SYMBOL, None, "symbol"),
        ("symbol-kachel", "Sponsuno Symbol Kachel", 0, None, "tile"),
    ]
    specs = []
    for name, title, pad, ground, kind in rows:
        svg = master(name)
        if kind == "tile":
            b = (0, 0, 256, 256)
            mm_per_unit = MM_TILE / 256
        else:
            b = bounds(paths_of(svg))
            mm_per_unit = (MM_WORDMARK / (b[2] - b[0])) if kind == "wordmark" else (MM_SYMBOL / (b[3] - b[1]))
        vb = [b[0] - pad, b[1] - pad, (b[2] - b[0]) + 2 * pad, (b[3] - b[1]) + 2 * pad]
        pt_per_unit = mm_per_unit / 25.4 * 72
        specs.append(dict(name=name, title=title, svg=svg, vb=vb, ground=ground,
                          w_pt=vb[2] * pt_per_unit, h_pt=vb[3] * pt_per_unit, dst=OUT_PDF / f"{name}.pdf"))
    return specs


def pdf_html(s, page_w, page_h, art_w, art_h):
    """Seite page_w×page_h pt; Grafik art_w×art_h pt, viewBox mittig erweitert, falls die Seite etwas grösser ist."""
    vb = fit_view_box(s["vb"], art_w, art_h)
    body = body_of(s["svg"])
    if s["ground"]:  # Grund als Vektorfläche im SVG und zusätzlich als Seitenhintergrund
        body = f'<rect x="{vb[0]:g}" y="{vb[1]:g}" width="{vb[2]:g}" height="{vb[3]:g}" fill="{s["ground"]}"/>' + body
    doc = svg_doc([round(v, 4) for v in vb], body, f"{art_w:.4f}pt", f"{art_h:.4f}pt")
    bg = s["ground"] or "transparent"
    return (f"<!doctype html><html><head><meta charset='utf-8'><title>{s['title']}</title><style>"
            f"@page{{size:{page_w:.4f}pt {page_h:.4f}pt;margin:0}}html,body{{margin:0;padding:0;"
            f"width:{art_w:.4f}pt;height:{art_h:.4f}pt;overflow:hidden;background:{bg};"
            f"-webkit-print-color-adjust:exact;print-color-adjust:exact}}svg{{display:block}}</style></head>"
            f"<body>{doc}</body></html>")


def build_pdf(s):
    """Chrome rundet die Seitengrösse leicht (bis ca. 0,3 pt). Darum zweimal: erst die Seite drucken,
    dann die Grafik genau auf die erhaltene MediaBox setzen, damit nichts beschnitten wird."""
    print_pdf(pdf_html(s, s["w_pt"], s["h_pt"], s["w_pt"], s["h_pt"]), str(s["dst"]))
    _pages, box, _img, _ops = pdf_report(s["dst"])
    bw, bh = box[2] - box[0], box[3] - box[1]
    if abs(bw - s["w_pt"]) > 0.01 or abs(bh - s["h_pt"]) > 0.01:
        print_pdf(pdf_html(s, s["w_pt"], s["h_pt"], bw, bh), str(s["dst"]))
        _pages, box2, _img, _ops = pdf_report(s["dst"])
        if box2 != box:
            raise RuntimeError(f"{s['dst'].name}: Seitengrösse nicht stabil ({box} / {box2})")


# ----------------------------------------------------------------------------- Web-Dateien

def write_web_files():
    shutil.copyfile(SVG_DIR / "symbol-kachel-klein.svg", OUT_ICONS / "favicon.svg")
    manifest = {
        "name": "Sponsuno",
        "short_name": "Sponsuno",
        "description": FOOTER_SUB,
        "lang": "de-CH",
        "start_url": "/",
        "display": "browser",
        "theme_color": NAVY,
        "background_color": NAVY,
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    (OUT_ICONS / "site.webmanifest").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
                                                encoding="utf-8")
    (OUT_ICONS / "head-snippet.html").write_text(
        "<!-- Sponsuno: Favicon und App-Icons. Die Dateien aus brand/icons/ (ausser dieser) ins Web-Root\n"
        "     kopieren (bei dieser Website: public/). favicon.svg und favicon.ico zeigen den Kleinschnitt\n"
        "     auf der Navy-Kachel, der auf hellen und dunklen Tabs hält. sizes=\"32x32\" beim .ico sorgt dafür,\n"
        "     dass Chrome das SVG bevorzugt. -->\n"
        '<link rel="icon" href="/favicon.ico" sizes="32x32">\n'
        '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n'
        '<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n'
        '<link rel="manifest" href="/site.webmanifest">\n'
        f'<meta name="theme-color" content="{NAVY}">\n', encoding="utf-8")


# ----------------------------------------------------------------------------- Prüfungen

def pdf_report(path):
    """Seitenzahl, Seitengrösse und ob irgendwo ein Rasterbild steckt."""
    raw = Path(path).read_bytes()
    pages = len(re.findall(rb"/Type\s*/Page\b", raw))
    mb = re.search(rb"/MediaBox\s*\[\s*([\d.\s-]+)\]", raw)
    box = [float(v) for v in mb.group(1).split()] if mb else None
    images = len(re.findall(rb"/Subtype\s*/Image", raw))
    ops = 0
    for m in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", raw, re.S):
        try:
            data = zlib.decompress(m.group(1))
        except zlib.error:
            continue
        ops += len(re.findall(rb"\s[cl]\s", data))
        images += len(re.findall(rb"/Subtype\s*/Image", data))
    return pages, box, images, ops


def main():
    global CHROME
    CHROME = find_chrome()
    for d in (OUT_PNG, OUT_PDF, OUT_ICONS, OUT_SOCIAL):
        d.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="sponsuno-ico-") as ico_tmp:
        ijobs, r, k = icon_jobs(ico_tmp)
        jobs = png_jobs() + ijobs + social_jobs()
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            futs = {pool.submit(screenshot, html, str(dst), w, h): dst for html, dst, w, h in jobs}
            for f in concurrent.futures.as_completed(futs):
                f.result()
        write_ico([os.path.join(ico_tmp, f"favicon-{s}.png") for s in (16, 32, 48)], OUT_ICONS / "favicon.ico")
    write_web_files()

    pspecs = pdf_specs()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        list(pool.map(build_pdf, pspecs))

    # Bericht
    problems = []
    for _html, dst, w, h in jobs:
        if dst.parent == Path(ico_tmp):
            continue
        size = png_size(dst)
        kb = dst.stat().st_size / 1024
        if size != (w, h):
            problems.append(f"{dst.name}: {size} statt {(w, h)}")
        if kb > 1000:
            problems.append(f"{dst.name}: {kb:.0f} KB (über 1 MB)")
        print(f"  {dst.relative_to(BRAND)}  {w}×{h}  {kb:.0f} KB")
    print(f"  icons/favicon.ico  16/32/48  {(OUT_ICONS / 'favicon.ico').stat().st_size / 1024:.0f} KB")
    print(f"  Maskable: S-Radius {r:.1f} von 128 Einheiten, Faktor {k:.3f} (Safe Zone 40 %, Ziel 36 %)")
    for s in pspecs:
        dst = s["dst"]
        pages, box, images, ops = pdf_report(dst)
        wmm, hmm = (box[2] - box[0]) / 72 * 25.4, (box[3] - box[1]) / 72 * 25.4
        print(f"  {dst.relative_to(BRAND)}  {wmm:.2f}×{hmm:.2f} mm (Soll {s['w_pt'] / 72 * 25.4:.2f}×"
              f"{s['h_pt'] / 72 * 25.4:.2f})  Seiten {pages}  Rasterbilder {images}  Pfad-Operatoren {ops}")
        if pages != 1:
            problems.append(f"{dst.name}: {pages} Seiten")
        if images:
            problems.append(f"{dst.name}: enthält Rasterbilder")
        if ops == 0:
            problems.append(f"{dst.name}: keine Vektorpfade gefunden")
    if problems:
        print("PROBLEME:\n  " + "\n  ".join(problems))
        sys.exit(1)
    print("ok")


if __name__ == "__main__":
    main()
