<p align="center">
  <a href="https://sponsuno.ch">
    <img src="docs/banner.jpg" alt="Sponsuno – Sponsoring, das zusammenpasst." width="100%">
  </a>
</p>

<p align="center">
  <a href="https://sponsuno.ch"><img src="https://img.shields.io/badge/Live-ansehen-C9A15B?style=for-the-badge&labelColor=1D2125" alt="Live ansehen"></a>
  <img src="https://img.shields.io/badge/Status-im%20Aufbau-2E343A?style=for-the-badge&labelColor=1D2125" alt="Status: im Aufbau">
  <img src="https://img.shields.io/badge/Start-Deutschschweiz-C9A15B?style=for-the-badge&labelColor=1D2125" alt="Start: Deutschschweiz">
</p>
<p align="center">
  <img src="https://img.shields.io/badge/React-19-F5F3EE?style=flat-square&labelColor=2E343A" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-strict-F5F3EE?style=flat-square&labelColor=2E343A" alt="TypeScript strict">
  <img src="https://img.shields.io/badge/Vite-8-F5F3EE?style=flat-square&labelColor=2E343A" alt="Vite 8">
  <img src="https://img.shields.io/badge/Cloudflare-Workers-F5F3EE?style=flat-square&labelColor=2E343A" alt="Cloudflare Workers">
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

Eine kurze Startseite (Hero mit Produktbild, Scroll-Geschichte, Für wen, Ablauf, Warteliste), fünf Themenseiten, vier Ratgeber, Impressum und Datenschutz, eine klickbare Produktvorschau mit Beispieldaten und eine (noch ruhende) Warteliste mit Double-Opt-in. Helles und dunkles Design, auf allen Seiten.

<table>
  <tr>
    <td width="50%"><img src="docs/audiences.jpg" alt="Für wen Sponsuno gemacht ist: vier Fotokarten für Sportlerinnen und Sportler, Sportvereine, Kulturvereine und Firmen"><br><sub>Für wen: vier Fotokarten auf Kalk</sub></td>
    <td width="50%"><img src="docs/how.jpg" alt="So funktioniert Sponsuno: zwei Karten mit je vier nummerierten Schritten"><br><sub>Ablauf: zwei Spuren mit je vier Schritten</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/waitlist.jpg" alt="Warteliste im dunklen Design: Titel links, Formular mit Rollenauswahl rechts, darunter der Footer mit der grossen Wortmarke"><br><sub>Warteliste und Footer im dunklen Design</sub></td>
    <td width="50%"><img src="docs/kosten.jpg" alt="Themenseite Kosten: grafitfarbener Seitenkopf, darunter die Übersicht der Konditionen"><br><sub>Themenseite «Kosten»</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/guide.jpg" alt="Ratgeber «Sponsoren finden» im dunklen Design mit nummeriertem Inhaltsverzeichnis"><br><sub>Ratgeber mit Inhaltsverzeichnis</sub></td>
    <td width="50%"><img src="docs/demo.jpg" alt="Produktvorschau: Übersicht der Sportlerin mit Terminen, Profil und KI-Manager"><br><sub>Produktvorschau mit Beispieldaten</sub></td>
  </tr>
</table>

### Auf dem Handy

<table>
  <tr>
    <td align="center" width="33%"><img src="docs/m-hero.jpg" alt="Mobile Startansicht" width="100%"><br><sub>Hero mit Produktbild</sub></td>
    <td align="center" width="33%"><img src="docs/m-guide.jpg" alt="Mobiler Ratgeber" width="100%"><br><sub>Ratgeber</sub></td>
    <td align="center" width="33%"><img src="docs/m-demo.jpg" alt="Mobiles Sponsor-Cockpit der Vorschau" width="100%"><br><sub>Sponsor-Cockpit</sub></td>
  </tr>
</table>

<br>

## Technik

Vite 8, React 19 und TypeScript im Strict-Modus, ohne UI- oder CSS-Framework. Jede Seite wird beim Build vorgerendert; die Themenseiten, Ratgeber und Rechtsseiten laden kein JavaScript. Bewegung läuft über CSS-Scroll-Timelines (`animation-timeline: view()`) mit ruhigem Ersatz bei «Bewegung reduzieren». Alle Texte stehen typisiert in [`src/content.ts`](src/content.ts). Details, Budgets und Regeln: [AGENTS.md](AGENTS.md).

<br>

## Design-System

Alles folgt dem Sponsuno Design-System v1.0 «Graphit, Messing, Kalk»: Graphit trägt, Kalk gibt Raum, Messing setzt Akzente. Laut ist nur die Schlaufe der Wortmarke.

<p>
  <img src="https://img.shields.io/badge/Graphit-1D2125-1D2125?style=for-the-badge&labelColor=1D2125" alt="Graphit #1D2125">
  <img src="https://img.shields.io/badge/Graphit%20hell-2E343A-2E343A?style=for-the-badge&labelColor=2E343A" alt="Graphit hell #2E343A">
  <img src="https://img.shields.io/badge/Messing-C9A15B-C9A15B?style=for-the-badge&labelColor=1D2125" alt="Messing #C9A15B">
  <img src="https://img.shields.io/badge/Messing%20dunkel-74592A-74592A?style=for-the-badge&labelColor=1D2125" alt="Messing dunkel #74592A">
  <img src="https://img.shields.io/badge/Kalk-F5F3EE-F5F3EE?style=for-the-badge&labelColor=1D2125" alt="Kalk #F5F3EE">
  <img src="https://img.shields.io/badge/Kalk%20dunkel-E6E1D6-E6E1D6?style=for-the-badge&labelColor=1D2125" alt="Kalk dunkel #E6E1D6">
</p>

| Rolle | Schrift |
| --- | --- |
| Titel | **Schibsted Grotesk** 700, Laufweite −0,025 em |
| Fliesstext, Buttons, Labels | **Schibsted Grotesk** 400 und 600; Labels in Versalien mit 0,15 em |

Die Wortmarke «sponsuno»: u und n teilen sich einen Stamm und werden zur Schlaufe. Die Schlaufe allein ist Favicon und App-Icon. Texte in Hochdeutsch mit Schweizer Schreibweise, sachlich und ohne Werbefloskeln. Was noch nicht entschieden ist, steht als offen da. Einzelheiten: [DESIGN.md](DESIGN.md).

<br>

## Lokal starten

Node 20.19 oder neuer in der 20er-Reihe, sonst 22.12 oder neuer (wie Vite 8).

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
├── demo/index.html         Klickbarer Prototyp (/demo/)
├── impressum/index.html    Impressum (/impressum/), vorgerendert, ohne JavaScript
├── datenschutz/index.html  Datenschutzerklärung (/datenschutz/), vorgerendert, ohne JavaScript
├── sponsoren-finden/ …     Vier Ratgeber (/sponsoren-finden/, /sponsoring-anfrage/, /sponsoring-dossier/,
│                           /kultursponsoring/), vorgerendert, ohne JavaScript
├── fuer-firmen/ …          Themenseiten aus dem Header (/fuer-firmen/, /ki-manager/, /kosten/, /fragen/,
│                           /ueber-uns/), vorgerendert, ohne JavaScript
├── src/
│   ├── App.tsx             Reihenfolge der Abschnitte, Scrollen, Anker-Links
│   ├── content.ts          Alle Texte der Seite, typisiert
│   ├── pages.ts            Alle Seiten mit Titel und Beschreibung (Head-Tags, Sitemap)
│   ├── components/         Ein Bauteil pro Abschnitt, dazu Header, Menü, Match, Emblem
│   ├── hooks/              Scroll-Reveals, Kippen, magnetische Buttons
│   ├── lib/                motion.ts, links.ts, theme.ts, templates.ts, storyLayout.ts
│   ├── styles/site.css     Design-Tokens aus dem CD und alle Styles
│   └── assets/             Logos und Symbolbild
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
  <img src="src/assets/Sponsuno_Icon.svg" alt="Sponsuno Icon" width="64">
</p>
<p align="center">
  <sub>Team Sponsuno · Youngpreneurs-Programm · Start in der Deutschschweiz</sub>
</p>
