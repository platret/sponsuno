"""Sponsuno Logo-Master (A · Schnitt, Palette Tartan v2) aus den freigegebenen Dateien von Runde 4.

Liest die Pfade der freigegebenen SVGs (brand-concepts/round4-farben/5-tartan/a-*.svg), ändert die Geometrie nicht,
setzt nur Farben, Titel und Beschreibungen neu und schreibt alle Master nach brand/logo/svg/.
Die Claim-Versionen setzen "Sponsoring, das zusammenpasst." in Manrope (Outlines aus @fontsource, mit GPOS-Kerning).
Ausserdem misst das Skript die Logos und schreibt brand/_quellen/spec.json.

Aufruf: siehe README.md in diesem Ordner.
"""
import json
import math
import os
import re
import sys

import pathops
from fontTools.pens.qu2cuPen import Qu2CuPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(HERE)
REPO = os.path.dirname(BRAND)
OUT = os.path.join(BRAND, 'logo', 'svg')
SRC = os.environ.get('SPONSUNO_ROUND4', os.path.join(os.path.dirname(REPO), 'brand-concepts', 'round4-farben', '5-tartan'))
FONTS = os.path.join(REPO, 'node_modules', '@fontsource', 'manrope', 'files')

# ---------------------------------------------------------------- Palette Tartan v2 (final)
NAVY = '#0B1830'      # Seite 1 auf Hell, dunkler Grund
TARTAN = '#BE4B2C'    # Seite 2 auf hellen Gründen
HELL = '#EC6942'      # Tartan hell: Seite 2 auf Navy
IVORY = '#F3EFE6'     # Seite 1 auf Navy, helles Band
PAPER = '#FBF9F4'     # heller Grund
AKZENT = '#A8401F'    # Text-Akzent: Tartan für Text auf hellen Gründen
BLACK = '#000000'
WHITE = '#FFFFFF'

CLAIM = 'Sponsoring, das zusammenpasst.'
CLAIM_WEIGHT = 600    # Manrope SemiBold: hält klein besser als 500, bleibt klar leichter als die Wortmarke (700)


# ---------------------------------------------------------------- geometry helpers (skia-pathops)
def P(d):
    p = pathops.Path()
    parse_path(d, p.getPen())
    return p


def union(*ps):
    r = ps[0]
    r = pathops.op(r, r, pathops.PathOp.UNION)
    for p in ps[1:]:
        r = pathops.op(r, p, pathops.PathOp.UNION)
    return r


def diff(a, b):
    return pathops.op(a, b, pathops.PathOp.DIFFERENCE)


def stroked(p, w):
    q = pathops.Path()
    q.addPath(p)
    q.stroke(w, pathops.LineCap.BUTT_CAP, pathops.LineJoin.MITER_JOIN, 4)
    q.convertConicsToQuads()
    return union(q)


def inset(p, d):
    """Shrink outlines by d units per side (optical thinning for light-on-dark)."""
    return diff(p, stroked(p, 2 * d))


def move(p, dx, dy):
    return p.transform(1, 0, 0, 1, dx, dy)


def tod(p, cubic=False):
    """Path -> SVG d. cubic=True merges TrueType quadratic runs into cubics (max error 0.05 units): fewer anchors."""
    pen = SVGPathPen(None, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    p.draw(Qu2CuPen(pen, 0.05, all_cubic=False) if cubic else pen)
    return pen.getCommands()


def bbox(*ps):
    bs = [p.bounds for p in ps]
    return (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))


# ---------------------------------------------------------------- read the approved sources
def read_paths(name):
    """Return [(fill, d), ...] and the viewBox of an approved round-4 SVG."""
    s = open(os.path.join(SRC, name), encoding='utf-8').read()
    vb = re.search(r'viewBox="([^"]+)"', s).group(1)
    paths = re.findall(r'<path fill="(#[0-9A-Fa-f]{6})" d="([^"]+)"/>', s)
    if not paths:
        sys.exit('no paths in ' + name)
    return [(f.upper(), d) for f, d in paths], vb


def split_subpaths(d):
    return [x for x in re.split(r'(?=M)', d) if x.strip()]


# ---------------------------------------------------------------- Manrope outlines with pair kerning
_fonts = {}
_kerns = {}


def font(weight):
    if weight not in _fonts:
        _fonts[weight] = TTFont(os.path.join(FONTS, f'manrope-latin-{weight}-normal.woff2'))
    return _fonts[weight]


def _kern_table(f):
    """Pair kerning (GPOS lookup type 2, formats 1 and 2, XAdvance of the first glyph) as a lookup function."""
    gpos = f['GPOS'].table
    subs = []
    feat_lookups = set()
    for fr in gpos.FeatureList.FeatureRecord:
        if fr.FeatureTag == 'kern':
            feat_lookups.update(fr.Feature.LookupListIndex)
    for i in sorted(feat_lookups):
        lk = gpos.LookupList.Lookup[i]
        for st in lk.SubTable:
            if lk.LookupType == 9:
                st = st.ExtSubTable
            if getattr(st, 'LookupType', 2) == 2 or lk.LookupType == 2:
                subs.append(st)

    def kern(a, b):
        for st in subs:
            cov = st.Coverage.glyphs
            if a not in cov:
                continue
            if st.Format == 1:
                ps = st.PairSet[cov.index(a)]
                for pvr in ps.PairValueRecord:
                    if pvr.SecondGlyph == b:
                        v = pvr.Value1
                        return getattr(v, 'XAdvance', 0) or 0 if v else 0
            elif st.Format == 2:
                c1 = st.ClassDef1.classDefs.get(a, 0)
                c2 = st.ClassDef2.classDefs.get(b, 0)
                v = st.Class1Record[c1].Class2Record[c2].Value1
                x = (getattr(v, 'XAdvance', 0) or 0) if v else 0
                if x:
                    return x
        return 0
    return kern


def set_text(s, weight, size, x=0.0, base=0.0, track=0.0):
    """Outline a string. size = font size in SVG units, track in 1/1000 em. Returns (Path, advance)."""
    f = font(weight)
    gs = f.getGlyphSet()
    cmap = f.getBestCmap()
    upm = f['head'].unitsPerEm
    if weight not in _kerns:
        _kerns[weight] = _kern_table(f)
    kern = _kerns[weight]
    sc = size / upm
    names = [cmap[ord(ch)] for ch in s]
    cx = x
    out = []
    for i, g in enumerate(names):
        p = pathops.Path()
        gs[g].draw(TransformPen(p.getPen(), (sc, 0, 0, -sc, cx, base)))
        out.append(p)
        cx += gs[g].width * sc
        if i + 1 < len(names):
            cx += kern(g, names[i + 1]) * sc + track * size / 1000
    return union(*out), cx - x


def font_metrics(weight):
    f = font(weight)
    upm = f['head'].unitsPerEm
    gs = f.getGlyphSet()
    # stem: width of the 'l' outline
    p = pathops.Path()
    gs[f.getBestCmap()[ord('l')]].draw(p.getPen())
    b = p.bounds
    return dict(upm=upm, cap=f['OS/2'].sCapHeight / upm, x=f['OS/2'].sxHeight / upm, stem=(b[2] - b[0]) / upm)


# ---------------------------------------------------------------- SVG writer
def svg_doc(vb, layers, title, desc):
    x, y, w, h = [float(v) for v in vb.split()]
    W = ('%g' % w)
    H = ('%g' % h)
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{W}" height="{H}" role="img" aria-label="Sponsuno">',
           f'<title>{title}</title>',
           f'<desc>{desc}</desc>']
    for fill, d in layers:
        out.append(f'<path fill="{fill}" d="{d}"/>')
    out.append('</svg>')
    return '\n'.join(out) + '\n'


written = []


def write(name, vb, layers, title, desc):
    s = svg_doc(vb, layers, title, desc)
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as fh:
        fh.write(s)
    written.append(name)


def one_colour(paths, fill):
    """All subpaths of a file merged into one path in one colour. Pieces do not overlap, so concatenating is exact."""
    return [(fill, ''.join(d for _, d in paths))]


# ---------------------------------------------------------------- build
def main():
    os.makedirs(OUT, exist_ok=True)
    wl, wvb = read_paths('a-wordmark-light.svg')      # [S oben navy, S unten tartan, ponsuno navy]
    wd, _ = read_paths('a-wordmark-dark.svg')         # [ivory: ponsuno + S oben, hell: S unten], 2,5 % dünner
    sl, svb = read_paths('a-symbol-light.svg')        # [oben navy, unten tartan]
    sd, _ = read_paths('a-symbol-dark.svg')           # [oben ivory, unten hell], 2,5 % dünner
    app, _ = read_paths('a-app-icon.svg')             # [Kachel navy, oben ivory, unten hell]
    fav, _ = read_paths('a-favicon-16.svg')           # [Kachel navy, oben ivory, unten hell], Kleinschnitt
    assert [f for f, _ in wl] == [NAVY, TARTAN, NAVY], wl
    assert [f for f, _ in wd] == [IVORY, HELL], [f for f, _ in wd]
    assert [f for f, _ in sl] == [NAVY, TARTAN] and [f for f, _ in sd] == [IVORY, HELL]
    assert [f for f, _ in app] == [NAVY, IVORY, HELL] and [f for f, _ in fav] == [NAVY, IVORY, HELL]

    pos = 'Positiv-Master (Runde 3 v4, Palette Tartan v2)'
    neg = 'Negativ-Master: Striche 2,5 % dünner für hell auf dunkel'
    # ---- Wortmarke
    write('wortmarke-farbe.svg', wvb, [(NAVY, wl[0][1]), (TARTAN, wl[1][1]), (NAVY, wl[2][1])],
          'Sponsuno Wortmarke, Farbe',
          f'{pos}. S oben Navy {NAVY}, S unten Tartan {TARTAN}, "ponsuno" Navy. Für helle Gründe (Papier {PAPER}, Weiss, Ivory).')
    write('wortmarke-dunkel.svg', wvb, wd,
          'Sponsuno Wortmarke, dunkel',
          f'{neg}. Ivory {IVORY} und Tartan hell {HELL}, transparenter Hintergrund. Nur auf Navy {NAVY} oder ähnlich dunklem Grund.')
    write('wortmarke-navy.svg', wvb, one_colour(wl, NAVY), 'Sponsuno Wortmarke, Navy',
          f'{pos}, einfarbig Navy {NAVY}. Für helle Gründe und kleine Grössen (Website-Header).')
    write('wortmarke-schwarz.svg', wvb, one_colour(wl, BLACK), 'Sponsuno Wortmarke, Schwarz',
          f'{pos}, einfarbig Schwarz. Für Schwarzweiss-Druck, Stempel, Gravur, Fax, Zeitungsinserate.')
    write('wortmarke-hell.svg', wvb, one_colour(wd, IVORY), 'Sponsuno Wortmarke, hell',
          f'{neg}, einfarbig Ivory {IVORY}, transparent. Auf Navy {NAVY} bei kleinen Grössen (S unter ca. 60 px), z. B. Website-Header.')
    write('wortmarke-weiss.svg', wvb, one_colour(wd, WHITE), 'Sponsuno Wortmarke, Weiss',
          f'{neg}, einfarbig Weiss, transparent. Für einfarbige Produktion (Siebdruck, Stick, Folie) auf dunklem Textil oder Navy.')
    # ---- Symbol
    write('symbol-farbe.svg', svb, sl, 'Sponsuno Symbol, Farbe',
          f'{pos}. Obere Hälfte Navy {NAVY}, untere Hälfte Tartan {TARTAN}. Für helle Gründe, ab 32 px.')
    write('symbol-dunkel.svg', svb, sd, 'Sponsuno Symbol, dunkel',
          f'{neg}. Ivory {IVORY} oben, Tartan hell {HELL} unten, transparent. Nur auf Navy oder ähnlich dunklem Grund.')
    write('symbol-navy.svg', svb, one_colour(sl, NAVY), 'Sponsuno Symbol, Navy', f'{pos}, einfarbig Navy {NAVY}.')
    write('symbol-tartan.svg', svb, one_colour(sl, TARTAN), 'Sponsuno Symbol, Tartan',
          f'{pos}, einfarbig Tartan {TARTAN}. Für Papier, Weiss und Ivory (Kontrast 4,3 bis 5,0:1); nicht auf Navy.')
    write('symbol-schwarz.svg', svb, one_colour(sl, BLACK), 'Sponsuno Symbol, Schwarz', f'{pos}, einfarbig Schwarz.')
    write('symbol-hell.svg', svb, one_colour(sd, IVORY), 'Sponsuno Symbol, hell',
          f'{neg}, einfarbig Ivory {IVORY}, transparent. Auf Navy, einfarbig.')
    write('symbol-weiss.svg', svb, one_colour(sd, WHITE), 'Sponsuno Symbol, Weiss',
          f'{neg}, einfarbig Weiss, transparent. Für einfarbige Produktion (Siebdruck, Folie, Prägung) auf dunklem Grund.')
    # ---- Kleinschnitt und Kacheln
    write('symbol-klein.svg', svb, [(NAVY, fav[1][1]), (TARTAN, fav[2][1])], 'Sponsuno Symbol, Kleinschnitt',
          f'Kleinschnitt für 16 bis 31 px: Strich 43, Lücke 27, mittig auf dem Pixelraster. Navy {NAVY} und Tartan {TARTAN} für helle Gründe.')
    write('symbol-kachel.svg', svb, app, 'Sponsuno App-Icon',
          f'Negativ-Master auf 80 % auf abgerundeter Navy-Kachel (Radius 52 von 256). App-Icon, Avatar, ab 32 px.')
    write('symbol-kachel-klein.svg', svb, fav, 'Sponsuno Favicon',
          f'Kleinschnitt auf der Navy-Kachel, Ivory {IVORY} und Tartan hell {HELL}. Favicon 16 bis 31 px; hält auf hellen und dunklen Tabs.')

    # ---- Wortmarke mit Claim (gestapelt, linksbündig)
    W_PATHS_L = [P(d) for _, d in wl]
    W_PATHS_D = [P(d) for _, d in wd]
    wb = bbox(*W_PATHS_L)                       # ink box of the positive wordmark
    s_box = bbox(W_PATHS_L[0], W_PATHS_L[1])    # the S
    ponsuno = W_PATHS_L[2]
    base_w = 224.0                              # wordmark baseline (Runde 3)
    fm = font_metrics(CLAIM_WEIGHT)
    # Claim stacked under the word, set exactly as wide as "ponsuno": left edge on the p stem, right edge on the last o.
    # Gives a cap height of about 25 % of the S, so the claim stays clearly second. Beside the word was rejected:
    # the wordmark is already 5:1, a claim next to it makes the lock-up about 8:1 and too small in headers.
    track = 10                                  # +10/1000 em: a touch open, like small text set from a display face
    probe, _ = set_text(CLAIM, CLAIM_WEIGHT, 100.0, 0, 0, track)
    pb = ponsuno.bounds
    size = 100.0 * (pb[2] - pb[0]) / (probe.bounds[2] - probe.bounds[0])
    claim_cap = fm['cap'] * size
    claim, adv = set_text(CLAIM, CLAIM_WEIGHT, size, 0, 0, track)
    cb = claim.bounds
    gap = 0.5 * (224.0 - 79.82)                 # half the x-height of the wordmark between p-descender and claim caps
    claim_base = wb[3] + gap + claim_cap
    claim = move(claim, pb[0] - cb[0], claim_base)
    cb = claim.bounds
    W = int(wvb.split()[2])                     # same width as the wordmark viewBox (claim stays inside the word)
    H = math.ceil(cb[3] + wb[1])                # same space below the claim as above the S
    vbc = f'0 0 {W} {H}'
    write('wortmarke-claim-farbe.svg', vbc, [(NAVY, wl[0][1]), (TARTAN, wl[1][1]), (NAVY, wl[2][1]), (NAVY, tod(claim, cubic=True))],
          'Sponsuno Wortmarke mit Claim, Farbe',
          f'Wortmarke Farbe mit Claim «{CLAIM}» in Manrope {CLAIM_WEIGHT} (Outlines), Navy {NAVY}. Für helle Gründe.')
    # No optical thinning on the claim: 2.5 % of its 8-unit stem would be 0.1 units, below any visible difference.
    write('wortmarke-claim-dunkel.svg', vbc, [(IVORY, wd[0][1]), (HELL, wd[1][1]), (IVORY, tod(claim, cubic=True))],
          'Sponsuno Wortmarke mit Claim, dunkel',
          f'Negativ-Master mit Claim «{CLAIM}» in Manrope {CLAIM_WEIGHT} (Outlines), Ivory {IVORY}. Transparent, nur auf Navy.')

    spec = measure(wvb, W_PATHS_L, W_PATHS_D, s_box, ponsuno, sl, fav, app, dict(
        viewBox=vbc, font=f'Manrope {CLAIM_WEIGHT}', size_units=round(size, 2), tracking_per_mille=track,
        cap_height_units=round(claim_cap, 2), cap_height_pct_of_S=round(100 * claim_cap / (s_box[3] - s_box[1]), 1), baseline=round(claim_base, 2),
        gap_descender_to_claim_caps_units=round(gap, 2), alignment='linksbündig am p-Stamm, rechts bündig mit dem letzten o (gleiche Breite wie "ponsuno")',
        width_units=round(cb[2] - cb[0], 2), wordmark_ink_width_units=round(wb[2] - wb[0], 2)))
    with open(os.path.join(HERE, 'spec.json'), 'w', encoding='utf-8') as fh:
        json.dump(spec, fh, ensure_ascii=False, indent=2)
        fh.write('\n')
    print('wrote', len(written), 'SVGs to', OUT)
    for n in written:
        print('  ', n)
    print('wrote spec.json')


# ---------------------------------------------------------------- measurements for spec.json
def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def lum(h):
    def ch(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(v) for v in rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def cr(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return round((la + 0.05) / (lb + 0.05), 2)


def wcag(r):
    if r >= 7:
        return 'AAA Text'
    if r >= 4.5:
        return 'AA Text'
    if r >= 3:
        return 'AA Grosstext und Grafik (>= 3:1)'
    return 'ungenügend (< 3:1)'


def measure(wvb, WL, WD, s_box, ponsuno, sl, fav, app, claim):
    # wordmark
    wb = bbox(*WL)
    vb = [float(v) for v in wvb.split()]
    s_h = s_box[3] - s_box[1]
    ink_h = wb[3] - wb[1]
    ink_w = wb[2] - wb[0]
    # x-height: top of the 'n' stem (flat) to baseline 224, measured on the outline of "ponsuno"
    xh = 224.0 - 79.82                          # 'n' / 'u' stem tops in the approved file (Manrope 700, 267 u/em)
    # symbol
    sp = [P(d) for _, d in sl]
    sb = bbox(*sp)
    fp = [P(d) for _, d in fav[1:]]
    fb = bbox(*fp)
    ap = [P(d) for _, d in app[1:]]
    ab = bbox(*ap)

    colours = [
        ('Navy', NAVY, 'Seite 1 auf Hell (obere S-Hälfte, "ponsuno"), dunkler Grund', (100, 80, 35, 60), 'ca. PMS 289 C'),
        ('Tartan', TARTAN, 'Seite 2 auf hellen Gründen (untere S-Hälfte)', (10, 80, 90, 10), 'ca. PMS 7599 C (Bereich 7599 C bis 7618 C)'),
        ('Tartan hell', HELL, 'Seite 2 auf Navy; nie auf hellen Gründen', (0, 70, 75, 0), 'ca. PMS 7579 C (leuchtender) oder 7618 C (gedämpfter); am Muster entscheiden'),
        ('Ivory', IVORY, 'Seite 1 auf Navy, helles Band', (3, 4, 9, 0), 'Papierweiss (nicht drucken); als Volltonfarbe auf Textil ein warmes Off-White wie PMS 9224 C (unsicher)'),
        ('Papier', PAPER, 'heller Grund', (1, 1, 4, 0), 'Papierweiss (nicht drucken)'),
        ('Text-Akzent', AKZENT, 'Tartan für Text auf hellen Gründen (Links, Hervorhebungen)', (15, 82, 100, 25), 'ca. PMS 7599 C (für Text meist nicht nötig: im Druck Tartan verwenden)'),
    ]
    grounds = [('Papier', PAPER), ('Ivory', IVORY), ('Navy', NAVY), ('Weiss', WHITE)]
    col = []
    for name, h, use, cmyk, pms in colours:
        col.append(dict(
            name=name, hex=h, rgb=list(rgb(h)), use=use,
            cmyk_coated_approx=dict(c=cmyk[0], m=cmyk[1], y=cmyk[2], k=cmyk[3], approx=True,
                                    note='Schätzwert für gestrichenes Papier (ISO Coated v2 / FOGRA39), nicht per ICC-Profil gerechnet. Vor dem Druck mit Proof prüfen.'),
            pantone_approx=dict(value=pms, approx=True, note='approximativ, mit gedrucktem Pantone-Muster prüfen (approximate, verify with a printed swatch).'),
            contrast={g: dict(ratio=cr(h, gh), wcag=wcag(cr(h, gh))) for g, gh in grounds if gh != h},
        ))
    halves = dict(
        hell_navy_vs_tartan=cr(NAVY, TARTAN), dunkel_ivory_vs_tartan_hell=cr(IVORY, HELL),
        note='Die Hälften trennen sich über Farbe und die 45°-Lücke; die Lücke nie verkleinern (trägt die Trennung bei Farbsehschwäche).')

    X = xh
    clear_sym = 0.25 * (sb[3] - sb[1])
    return dict(
        name='Sponsuno, Logo A · Schnitt, Palette Tartan v2',
        source=dict(geometry='brand-concepts/round3-s/c-schnitt (v4, sdraw4.py / build4.py)',
                    colour='brand-concepts/round4-farben/5-tartan (recolor_v2.py)',
                    generator='brand/_quellen/build.py'),
        colours=col,
        logo_halves_contrast=halves,
        rules=dict(
            never=['Tartan hell auf hellen Gründen (2,99:1 auf Papier)', 'Tartan (#BE4B2C) als Fläche hinter Navy-Schrift (3,56:1)',
                   'Farbsymbol/-wortmarke auf Navy (dafür die dunkel-Versionen)', 'Lücke im S verkleinern, Hälften verschieben, Wortmarke neu setzen',
                   'Symbol vor die Wortmarke stellen ("S Sponsuno" stottert; es gibt bewusst kein Lockup)'],
            twotone_wordmark=dict(
                light_ground='Papier, Weiss, Ivory: wortmarke-farbe ab ca. 60 px S-Höhe (≈ 390 px Tintenbreite); darunter wortmarke-navy.',
                navy_ground='Navy: wortmarke-dunkel ab ca. 60 px S-Höhe; darunter wortmarke-hell (einfarbig Ivory). Website-Header auf Navy: wortmarke-hell.',
                print='Die 60 px gelten für Bildschirme. Für den Druck gibt es keinen getesteten Wert; bei kleinen Drucksachen (Visitenkarte, Briefkopf) beide Fassungen im Probedruck vergleichen. Grosse Flächen (Bande, Schild, Trikot) sind zweifarbig.',
                status='Regel aus Runde 3 (Gold), für Tartan nicht neu getestet, auf Navy nie getestet. wortmarke-hell ist die einfarbige Entsprechung von wortmarke-navy für Navy.',
            ),
            grounds='Erlaubte Gründe: Papier, Weiss, Ivory (Farbversion oder einfarbig Navy/Schwarz/Tartan-Symbol) und Navy (dunkel, hell, weiss). Fotos nur mit einer Navy-Fläche hinter dem Logo, nie direkt. Auf roten, orangen oder bunten Gründen ein Feld in Papier, Weiss oder Navy dahinter.',
            white='wortmarke-weiss / symbol-weiss (#FFFFFF) nur für einfarbige Produktion (Siebdruck, Stick, Folie, Prägung) auf dunklem Textil oder Navy; am Bildschirm und im Druck auf Navy die Ivory-Fassungen.',
        ),
        wordmark=dict(
            viewBox=wvb,
            aspect_ratio_viewBox=round(vb[2] / vb[3], 3),
            ink_box_units=[round(v, 2) for v in wb],
            ink_width_units=round(ink_w, 2), ink_height_units=round(ink_h, 2),
            aspect_ratio_ink=round(ink_w / ink_h, 3),
            s_height_units=round(s_h, 2), baseline_units=224.0,
            x_height_units=round(xh, 2),
            padding_units='24 links/rechts im viewBox; oben 27,9, unten 15,9 bis zur Unterlänge des p',
            letters='S eigene Zeichnung (Strich 37/40, Lücke 13 bei 45°); "ponsuno" Manrope 700 Outlines, 267 Einheiten/em, Laufweite +5/1000 em',
        ),
        clear_space=dict(
            wordmark=dict(unit='X = x-Höhe der Wortmarke (Höhe des n)', units=round(X, 2),
                          pct_of_wordmark_ink_height=round(100 * X / ink_h, 1),
                          pct_of_S_height=round(100 * X / s_h, 1),
                          rule='Rund um die Tintenkante der Wortmarke (inkl. Unterlänge des p) mindestens X frei. Gilt auch für die Claim-Version. Die viewBox-Ränder (24 Einheiten) sind kleiner als X und zählen nicht als Schutzraum.'),
            symbol=dict(unit='Y = ein Viertel der S-Höhe (≈ untere Strichstärke 40 plus Lücke 13)',
                        units=round(clear_sym, 2), pct_of_symbol_height=25.0,
                        rule='Rund um das Symbol mindestens Y frei. Auf der Kachel ist der Schutzraum eingebaut (Kachel = Schutzraum).'),
        ),
        minimum_sizes=dict(
            wordmark_screen=dict(min_width_px=96, at_min_S_height_px=round(96 * s_h / ink_w, 1),
                                 note='Bildbreite der Tinte. Unter ca. 18 px Bildhöhe wird die Lücke im S zur Kerbe; das S liest sich noch.'),
            wordmark_print=dict(min_width_mm=25, at_min_S_height_mm=round(25 * s_h / ink_w, 2)),
            wordmark_claim_screen=dict(min_width_px=240, note='Claim dann ca. 12 px Schriftgrösse (Versalhöhe ca. 9 px); darunter Wortmarke ohne Claim. Punkt und i-Punkt werden darunter zu klein.'),
            wordmark_claim_print=dict(min_width_mm=50, note='Claim dann ca. 7 pt.'),
            symbol_master_screen=dict(min_px=32, note='symbol-farbe / -dunkel / -kachel ab 32 px Kantenlänge.'),
            symbol_small_cut=dict(range_px='16 bis 31', files=['symbol-klein.svg', 'symbol-kachel-klein.svg'],
                                  note='Unter 32 px immer den Kleinschnitt (Strich 43, Lücke 27). Unter 16 px kein Logo. px = CSS-Pixel; favicon.svg wird darum auch auf Retina-Bildschirmen im Kleinschnitt gezeigt. favicon.ico: 16 px Kleinschnitt, 32 und 48 px Master auf der Kachel.',
                                  test='11.11.2026: symbol-kachel neben symbol-kachel-klein und symbol-farbe neben symbol-klein bei 16, 24, 32 und 48 px (Chrome, 1x; Kachel auf Weiss und Navy, Symbol auf Weiss), vergrössert verglichen. 16 px: Kleinschnitt klar besser lesbar. 24 px: beide lesbar, der Kleinschnitt füllt die Kachel besser. 32 und 48 px: Master sauberer, der Kleinschnitt wirkt zu schwer. Darum bleibt die Grenze bei 32 px.'),
            symbol_print=dict(min_mm=8, note='Symbol unter 8 mm: Kleinschnitt; unter 5 mm nicht verwenden. Stick: ab ca. 15 mm, Kleinschnitt (symbol-klein, zweifarbig; eine einfarbige Kleinschnitt-Datei fehlt noch), mit Garnmuster prüfen. Massgebend ist die Kantenlänge der Symboldatei (S dann ca. 78 %).'),
        ),
        symbol=dict(viewBox='0 0 256 256', ink_box_units=[round(v, 2) for v in sb],
                    height_units=round(sb[3] - sb[1], 2), width_units=round(sb[2] - sb[0], 2),
                    small_cut_ink_box_units=[round(v, 2) for v in fb],
                    tile=dict(radius_units=52, radius_pct=round(100 * 52 / 256, 1), app_icon_S_height_pct=round(100 * (ab[3] - ab[1]) / 256, 1),
                              small_cut_S_height_pct=round(100 * (fb[3] - fb[1]) / 256, 1))),
        claim=claim,
        typography=dict(
            wordmark='Manrope 700 (Outlines, OFL), eigenes S',
            claim=f'Manrope {CLAIM_WEIGHT} (Outlines, OFL)',
            website='Cormorant Garamond 600 (Titel), Manrope 400/600 (Text)'),
    )


if __name__ == '__main__':
    main()
