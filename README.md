<p align="center">
  <a href="https://sponsuno.ch">
    <img src="docs/banner.jpg" alt="Sponsuno – Sponsoring, das zusammenpasst." width="100%">
  </a>
</p>

<p align="center">
  <a href="https://sponsuno.ch"><img src="https://img.shields.io/badge/Live-ansehen-EDBE3A?style=for-the-badge&labelColor=1A1C20" alt="Live ansehen"></a>
  <img src="https://img.shields.io/badge/Status-im%20Aufbau-2A2D33?style=for-the-badge&labelColor=1A1C20" alt="Status: im Aufbau">
  <img src="https://img.shields.io/badge/Start-Deutschschweiz-EDBE3A?style=for-the-badge&labelColor=1A1C20" alt="Start: Deutschschweiz">
</p>
<p align="center">
  <img src="https://img.shields.io/badge/React-19-F8F4EA?style=flat-square&labelColor=2A2D33" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-F8F4EA?style=flat-square&labelColor=2A2D33" alt="TypeScript strict">
  <img src="https://img.shields.io/badge/Vite-8-F8F4EA?style=flat-square&labelColor=2A2D33" alt="Vite 8">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-F8F4EA?style=flat-square&labelColor=2A2D33" alt="Cloudflare Workers">
</p>

<p align="center">
  <b>Sponsuno bringt Sportlerinnen und Sportler, Sport- und Kulturvereine mit Firmen aus ihrer Region zusammen.</b><br>
  Ein persönlicher KI-Sponsoringmanager soll danach bei Anfragen, Terminen und Gegenleistungen helfen.<br>
  Das ist die Startseite dazu: ein Projekt im Youngpreneurs-Programm.
</p>

<p align="center">
  <a href="https://sponsuno.ch"><b>Live ansehen</b></a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#was-drin-steckt">Was drin steckt</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#technik">Technik</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#design-system">Design-System</a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#lokal-starten">Lokal starten</a>
</p>

<br>

## Was drin steckt

Eine kurze Startseite in sieben Blöcken (Hero mit Stickern, Leitsatz, Wortband, Ablauf in drei Schritten, zwei Türen, Warteliste, Footer mit Stickeralbum), drei Themenseiten (Kosten, Fragen, Über uns), Impressum und Datenschutz und eine Warteliste mit Double-Opt-in.

Die Bilder unten zeigen noch den früheren Stand (Design-System v1.0). Neue folgen, sobald das Design «Turnhalle» freigegeben ist.

<table>
  <tr>
    <td width="50%"><img src="docs/audiences.jpg" alt="Für wen Sponsuno gemacht ist: vier Fotokarten für Sportlerinnen und Sportler, Sportvereine, Kulturvereine und Firmen"><br><sub>Für wen: vier Fotokarten auf Kalk</sub></td>
    <td width="50%"><img src="docs/how.jpg" alt="So funktioniert Sponsuno: zwei Karten mit je vier nummerierten Schritten"><br><sub>Ablauf: zwei Spuren mit je vier Schritten</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/waitlist.jpg" alt="Warteliste auf Graphit: Titel links, Formular mit Rollenauswahl rechts"><br><sub>Warteliste auf Graphit</sub></td>
    <td width="50%"><img src="docs/kosten.jpg" alt="Themenseite Kosten: grafitfarbener Seitenkopf, darunter die Übersicht der Konditionen"><br><sub>Themenseite «Kosten»</sub></td>
  </tr>
</table>

### Auf dem Handy

<table>
  <tr>
    <td align="center" width="33%"><img src="docs/m-hero.jpg" alt="Mobile Startansicht" width="100%"><br><sub>Hero mit Produktbild</sub></td>
    <td align="center" width="33%"><img src="docs/m-fragen.jpg" alt="Themenseite Fragen auf dem Handy: grafitfarbener Seitenkopf, darunter die häufigen Fragen" width="100%"><br><sub>Häufige Fragen</sub></td>
    <td align="center" width="33%"><img src="docs/m-ueber-uns.jpg" alt="Themenseite Über uns auf dem Handy: das Team hinter Sponsuno" width="100%"><br><sub>Über uns</sub></td>
  </tr>
</table>

<br>

## Technik

Vite 8, React 19 und TypeScript im Strict-Modus, ohne UI- oder CSS-Framework. Jede Seite wird beim Build vorgerendert; die Themenseiten und Rechtsseiten laden kein JavaScript. Bewegung läuft über CSS-Scroll-Timelines (`animation-timeline: view()`) mit ruhigem Ersatz bei «Bewegung reduzieren». Alle Texte stehen typisiert in [`src/content.ts`](src/content.ts). Details, Budgets und Regeln: [AGENTS.md](AGENTS.md).

<br>

## Design-System

Alles folgt dem Sponsuno Design-System v2 «Turnhalle»: Tinte auf hellem Parkett, vier Linienfarben wie auf dem Boden einer Mehrzweckhalle und Sticker als verspielte Ebene. Farbe kommt als Linie, Sticker und als wenige volle Farbbänder.

<p>
  <img src="https://img.shields.io/badge/Tinte-1A1C20-1A1C20?style=for-the-badge&labelColor=1A1C20" alt="Tinte #1A1C20">
  <img src="https://img.shields.io/badge/Parkett-F8F4EA-F8F4EA?style=for-the-badge&labelColor=1A1C20" alt="Parkett #F8F4EA">
  <img src="https://img.shields.io/badge/Blau-1F4E9C-1F4E9C?style=for-the-badge&labelColor=1A1C20" alt="Blau #1F4E9C">
  <img src="https://img.shields.io/badge/Rot-C23B24-C23B24?style=for-the-badge&labelColor=1A1C20" alt="Rot #C23B24">
  <img src="https://img.shields.io/badge/Gr%C3%BCn-1A7552-1A7552?style=for-the-badge&labelColor=1A1C20" alt="Grün #1A7552">
  <img src="https://img.shields.io/badge/Gelb-EDBE3A-EDBE3A?style=for-the-badge&labelColor=1A1C20" alt="Gelb #EDBE3A">
</p>

| Rolle | Schrift |
| --- | --- |
| Titel und grosse Wörter | **Archivo Wide** 800 (Archivo, Breite 125), Laufweite −0,02 em |
| Fliesstext, Buttons, Labels | **Schibsted Grotesk** 400 und 600; Labels in Versalien mit 0,15 em |

Die Wortmarke «sponsuno»: u und n teilen sich einen Stamm und werden zur Schlaufe. Die Schlaufe allein ist Favicon und App-Icon. Texte in Hochdeutsch mit Schweizer Schreibweise, sachlich und ohne Werbefloskeln. Was noch nicht entschieden ist, steht als offen da. Einzelheiten: [DESIGN.md](DESIGN.md).

<br>

## Lokal starten

Node 22.18 oder neuer (wie in `package.json`).

```bash
git clone https://github.com/platret/sponsuno.git
cd sponsuno
npm install
npm run dev
```

Dann http://localhost:5173/ öffnen. Weitere Befehle: `npm run build` (Typprüfung, Build und Vorrendern nach `dist/`), `npm run preview` (den Build lokal ansehen), `npm run typecheck`.

```
sponsuno/
├── index.html              Vite-Einstieg, Schriften, Meta-Tags
├── 404.html                Seite für unbekannte Adressen, vorgerendert
├── impressum/index.html    Impressum (/impressum/), vorgerendert, ohne JavaScript
├── datenschutz/index.html  Datenschutzerklärung (/datenschutz/), vorgerendert, ohne JavaScript
├── kosten/ …               Themenseiten aus dem Header (/kosten/, /fragen/, /ueber-uns/), vorgerendert, ohne JavaScript
├── warteliste/bestaetigt/  Seite nach der Bestätigung der Warteliste (noindex)
├── src/
│   ├── App.tsx             Reihenfolge der Abschnitte, Scrollen, Anker-Links
│   ├── content.ts          Alle Texte der Seite, typisiert
│   ├── pages.ts            Alle Seiten mit Titel und Beschreibung (Head-Tags, Sitemap)
│   ├── components/         Ein Bauteil pro Abschnitt, dazu Header, Menü, Match-Karte; kit/ mit Stickern, Icons und Hallenlinien
│   ├── lib/                motion.ts, links.ts, eggs.ts (Easter Eggs); storyLayout.ts und templates.ts nur für geparkte Teile
│   ├── styles/             tokens.css (Design-Tokens aus dem CD), site.css, sections/ (ein Stylesheet pro Abschnitt)
│   └── assets/             Logos, Wortmarken, Schriften, Porträts des Teams (photos/; die Stockfotos dort sind geparkt)
├── worker/                 Cloudflare Worker, nur für /api/* (Warteliste)
├── emails/                 E-Mails der Warteliste (npm run emails, Anleitung im README dort)
├── public/                 Icons, robots.txt, _headers (Cache und Sicherheit), _redirects (301 der geparkten Seiten)
├── scripts/prerender.mjs   Vorrendern beim Build, Head-Tags und sitemap.xml
├── scripts/og/, icons.mjs  Quellen für Vorschaubild und Icons in public/
├── .github/workflows/      Vorschau bei Pull Requests, Deploy von main (Cloudflare)
├── wrangler.jsonc          Cloudflare Worker: Domains und Assets
├── AGENTS.md               Regeln und Architektur für jede Session
├── DESIGN.md               Farben, Schrift, Komponenten, Bewegung
└── docs/                   Bilder für dieses README
```

Deploy: Jeder Push auf `main` baut die Seite und veröffentlicht sie über Cloudflare Workers auf https://sponsuno.ch. Pull Requests bekommen eine Vorschau-URL. Details in [AGENTS.md](AGENTS.md#deploy).

<br>

## Vor dem Launch

Die aktuelle Liste steht in [AGENTS.md → Open before launch](AGENTS.md#open-before-launch): Warteliste mit Brevo, Provisionsmodell, Namens- und Markenprüfung, Freigabe des Design-Systems durch das Team, Fotos.

<br>

## Mitarbeiten

Bevor du etwas änderst: [AGENTS.md](AGENTS.md) (Architektur, Regeln für Texte, Leistung, Barrierefreiheit, Deploy) und [DESIGN.md](DESIGN.md) (Farben, Schrift, Komponenten, Bewegung). Beide gelten für Menschen und KI-Sessions gleichermassen.

<br>

<p align="center">
  <img src="docs/icon.svg" alt="Sponsuno Icon" width="64">
</p>
<p align="center">
  <sub>Team Sponsuno · Youngpreneurs-Programm · Start in der Deutschschweiz</sub>
</p>
