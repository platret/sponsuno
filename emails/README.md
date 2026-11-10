# E-Mails der Warteliste (Brevo)

Zwei fertige E-Mails für die Warteliste, gestaltet wie die Website (Navy, Gold, Ivory). Sie werden von Hand in Brevo eingefügt. Gehört zur Checkliste `team/warteliste-setup.md`, Schritt 7.

| Datei | Wozu | Betreff | Vorschautext (Preheader) |
|---|---|---|---|
| `dist/doi-bestaetigung.html` (+ `.txt`) | Bestätigungs-E-Mail (Double Opt-in) direkt nach dem Eintrag | Bitte bestätigen Sie Ihre Anmeldung | Ein Klick auf den Button, dann stehen Sie auf der Warteliste von Sponsuno. |
| `dist/willkommen.html` (+ `.txt`) | Willkommens-E-Mail nach dem Klick auf den Bestätigungslink | Danke, Sie stehen auf der Warteliste | Ihre Anmeldung ist bestätigt. Bis zum Start: Ratgeber und Produktvorschau. |

Absender beider E-Mails: **Sponsuno &lt;hello@sponsuno.ch&gt;**, Antwortadresse ebenfalls hello@sponsuno.ch. Erst nach Schritt 4 und 5 der Checkliste (Domain mit DKIM authentisiert, Absender bestätigt), sonst weisen Empfänger die E-Mails wegen DMARC `p=reject` ab.

Vorschaubilder (Desktop 600 px, Handy 375 und 320 px, hell und dunkel, dazu eine invertierte Ansicht wie in Gmail/Outlook im Dunkelmodus und eine Ansicht ohne Webfonts): `previews/*.png`.

## Bevor ihr testet: Bilder müssen online sein

Logo und Schriften liegen nicht in der E-Mail, sondern auf der Website unter `https://sponsuno.ch/email/` (Ordner `public/email/` im Repo). Sie sind erst erreichbar, wenn der Branch mit diesen Dateien auf `main` gemergt und deployed ist. Vorher zeigen Test-E-Mails statt des Logos nur den Text «Sponsuno».

Die Adressen unter `/email/` nie umbenennen oder löschen: Bereits verschickte E-Mails laden das Logo noch Jahre später von dort.

## 1. Bestätigungs-E-Mail (DOI) in Brevo anlegen

1. **Marketing → Templates → Email → Create Template** (Menünamen können sich bei Brevo leicht ändern).
2. Name: «Warteliste Bestätigung». Betreff und Vorschautext aus der Tabelle oben.
3. Absender: `Sponsuno`, `hello@sponsuno.ch`. Antwortadresse: `hello@sponsuno.ch`.
4. **Show advanced settings → Tag:** `optin` eintragen. Damit führt Brevo die Vorlage als DOI-Vorlage. Der API-Aufruf der Website verlangt eine DOI-Vorlage.
5. Als Editor **«Code your own»** wählen (je nach Ansicht auch «Paste your code» oder HTML-Editor), nicht den Drag-and-drop-Editor. Den ganzen Inhalt von `dist/doi-bestaetigung.html` einfügen und speichern. Nichts darin von Hand ändern (siehe «Änderungen» unten).
6. **Bestätigungslink:** ist schon drin. Button und Ersatzlink zeigen auf `{{ doubleoptin }}`, den Platzhalter, den Brevo beim Versand durch den persönlichen Bestätigungslink ersetzt. Im HTML-Editor gibt es deshalb kein «Link → Type: Double opt-in link» zum Anklicken; das ist nur die Variante im Drag-and-drop-Editor für denselben Platzhalter. Beim ersten Testversand prüfen, dass der Link zu einer Bestätigungsadresse von Brevo führt und nicht leer ist oder wörtlich «{{ doubleoptin }}» zeigt. Falls doch: Brevos API-Referenz (create-doi-contact) nennt für Anmeldungen über die API den Platzhalter `{{ params.DOIurl }}`. Dann in `src/doi-bestaetigung.html` und `.txt` alle `{{ doubleoptin }}` dadurch ersetzen und neu bauen; das Build-Skript lässt beide zu.
7. **Wohin der Link danach führt**, legt nicht die Vorlage fest, sondern der Aufruf der Website: `redirectionUrl` ist https://sponsuno.ch/warteliste/bestaetigt/ (Worker-Route `worker/waitlist.ts`, Seite «Danke, Ihre Anmeldung ist bestätigt»). In der Vorlage ist nichts einzustellen.
8. Falls Brevo ein Feld für eine **Textversion** anbietet: Inhalt von `dist/doi-bestaetigung.txt` einfügen. Sonst erzeugt Brevo die Textversion selbst.
9. Vorlage aktiv schalten und die **Vorlagen-ID** notieren (Zahl in der Übersicht), für Schritt 11 der Checkliste.

Was in dieser E-Mail bewusst fehlt: Werbung, Personalisierung (keine Anrede mit Namen, keine Kontaktattribute; die Felder sind vor der Bestätigung leer) und ein Abmeldelink (wer nicht bestätigt, steht auf keiner Liste). So verlangt es Brevo für DOI-Vorlagen. Bitte nichts davon ergänzen.

## 2. Willkommens-E-Mail in Brevo anlegen

Die Website meldet Personen über die Brevo-API mit Double Opt-in an. Brevo setzt den Kontakt erst nach dem Klick auf den Bestätigungslink auf die Liste «Warteliste». Genau dieses Ereignis löst die Willkommens-E-Mail aus.

**Vorlage:**

1. **Marketing → Templates → Email → Create Template**, Name «Warteliste Willkommen». Betreff und Vorschautext aus der Tabelle oben, Absender und Antwortadresse wie oben.
2. **Kein** Tag `optin` (das ist keine DOI-Vorlage).
3. «Code your own», Inhalt von `dist/willkommen.html` einfügen, speichern, aktiv schalten. Textversion aus `dist/willkommen.txt`, falls Brevo ein Feld dafür hat.
4. Der Abmeldelink ist schon drin (`{{ unsubscribe }}` im Fuss, «Von der Warteliste abmelden»). Brevo verlangt ihn in jeder E-Mail an eine Liste. Nicht entfernen.

**Versand per Automation (empfohlen):**

1. **Automations → Create an automation → Create from scratch** (oder die Vorlage «Welcome message»).
2. Einstiegspunkt: **Contact added to list** → Liste «Warteliste».
3. Schritt: **Send an email** → Vorlage «Warteliste Willkommen». Keine Wartezeit davor.
4. Prüfen, dass die Automation nur für **neu hinzugefügte** Kontakte startet. Wer später Kontakte von Hand importiert, löst sie sonst ebenfalls aus.
5. Automation aktivieren.

Warum nicht die «final confirmation email» von Brevo: Diese Einstellung gibt es nur bei Formularen, die direkt in Brevo gebaut sind. Unser Formular läuft über die eigene Website und die API; dort ist die Automation der Weg. Ob die Automation im aktuellen Gratisplan enthalten ist und welche Limiten gelten, auf der Preisseite von Brevo nachsehen.

Hinweis Gratisplan: Brevo kann im Gratisplan ein eigenes Logo oder einen Hinweis unter die E-Mail setzen. Das lässt sich in den Vorlagen nicht verhindern.

## 3. Testversand

Zuerst in Brevo **Send a test** (an eigene Adressen), danach einmal den ganzen Ablauf über die Vorschau-URL des Pull Requests (Checkliste, Schritt 12). Prüfen in:

- [ ] **Gmail im Browser** (hell und mit dunklem Design): Logo sichtbar, Button gold, Text vollständig, kein «[Nachricht gekürzt] Gesamte Nachricht anzeigen» am Ende.
- [ ] **Gmail-App** iOS und Android, Dunkelmodus ein: Gmail färbt selbst um. Der Kopf darf heller werden; das Logo steht dann als dunkles Schild mit heller Schrift darauf (das Logo-Bild hat dafür eine Navy-Fläche, die auf dem normalen Kopf unsichtbar ist) und muss gut lesbar sein. Vergleich: `previews/*-600-inverted.png`.
- [ ] **Apple Mail** (Mac und iPhone), hell und dunkel: Im Dunkelmodus erscheint die eigene dunkle Fassung (Navy-Karte, Ivory-Schrift). Hier laden auch die Webfonts (Cormorant, Manrope).
- [ ] **Outlook** (Windows-App, falls vorhanden, sonst Outlook im Browser): Button als goldenes Rechteck mit Text, Schrift Georgia/Arial, Breite höchstens 600 px.
- [ ] **Handy schmal** (z. B. iPhone SE): nichts abgeschnitten, Button über die ganze Breite.
- [ ] Inbox-Vorschau zeigt den Vorschautext aus der Tabelle, nicht «Warteliste» oder Fragmente.
- [ ] Alle Links: Bestätigungslink (eine Adresse von Brevo, führt danach zur Bestätigungsseite), Datenschutz, beide Ratgeber (Sponsoren finden, Kultursponsoring), Produktvorschau, Für Firmen, Abmelden (Abmeldeseite von Brevo erscheint, Kontakt ist danach abgemeldet).
- [ ] In der empfangenen E-Mail «Original anzeigen»: `dkim=pass` mit `header.d=sponsuno.ch` und `dmarc=pass`.
- [ ] Bilder blockiert (Outlook, manche Firmenkonten): Statt des Logos ist der Alternativtext «Sponsuno» sichtbar. (Farbe und Grösse gelten nicht überall; das klassische Outlook für Windows zeigt ihn in seiner eigenen Schrift.)
- [ ] Outlook für Windows: Die Link-Karten der Willkommens-E-Mail haben innen Abstand zum Rahmen (Text und Pfeil kleben nicht am Rand).

Gefundene Darstellungsfehler mit Screenshot und Name des Programms an Claude schicken.

## Anbindung an die Website (Worker-Route)

Die Website schickt Anmeldungen an `POST /api/warteliste` (Cloudflare Worker, `worker/waitlist.ts`), der Brevo mit Double Opt-in aufruft. Die Route ist eingebaut, aber **schlafend**: Ohne API-Schlüssel und IDs antwortet sie «not_configured», und das Formular bleibt beim E-Mail-Weg. Freischalten in dieser Reihenfolge:

1. Team: Secret `BREVO_API_KEY` im Worker `sponsuno` setzen (Checkliste, Schritt 8). Für Tests auf PR-Vorschauen zusätzlich `npx wrangler preview base-config secret put BREVO_API_KEY` (gilt für Vorschauen, die danach entstehen).
2. Claude: Listen-ID und Vorlagen-ID der DOI-Vorlage in `wrangler.jsonc` eintragen (`vars` und `previews.vars`: `BREVO_LIST_ID`, `BREVO_DOI_TEMPLATE_ID`), dazu die Datenschutzerklärung aus `datenschutz-entwurf.md` fertigstellen.
3. Team: In GitHub die Repository-Variable `VITE_WAITLIST_ENDPOINT` auf `/api/warteliste` setzen (Settings → Secrets and variables → Actions → Variables). Erst damit schickt das Formular Anmeldungen ab; der nächste Deploy schaltet es um.
4. Test nach Checkliste, Schritt 12.

**Schutz vor Missbrauch:** Die Route begrenzt Anmeldungen pro Minute (pro IP-Adresse und pro E-Mail-Adresse) und pro Tag: höchstens 140 Bestätigungs-E-Mails für die ganze Website (unter den 300 E-Mails pro Tag des Gratisplans, weil jede Anmeldung zwei E-Mails kostet) und höchstens 2 an dieselbe Adresse. Ist die Tagesgrenze erreicht, bietet das Formular bis zum nächsten Tag den E-Mail-Weg an. Restrisiko: Ein Skript mit vielen Adressen kann die Tagesgrenze aufbrauchen. Passiert das, wäre der nächste Schritt Cloudflare Turnstile (ein unsichtbarer Bot-Test); das braucht einen Entscheid des Teams, einen Eintrag in der Datenschutzerklärung und einen zweiten Worker-Secret. Wechselt das Team auf einen bezahlten Brevo-Plan, kann Claude die Grenze (`DAILY_CAP` in `worker/guard.ts`) anheben.

## Änderungen (für Claude oder wer am Repo arbeitet)

Nie die Dateien in `dist/` von Hand bearbeiten. Text und Gestaltung stehen in `src/`:

- `src/doi-bestaetigung.html`, `src/willkommen.html`: Betreff, Vorschautext und Inhalt; `src/*.txt`: Textversionen.
- `src/layout.html`: Kopf (Logo, Goldlinie), Karte, Fuss, Dunkelmodus und Handy-Regeln.
- `src/inline.css`: Farben, Schriften, Abstände; das Build-Skript schreibt sie in jedes Element (`style=""`), weil Gmail und Outlook Stylesheets teils ignorieren.

Dann im Repo:

```bash
npm run emails                 # baut dist/*.html und dist/*.txt und prüft sie
npm run emails -- --previews   # zusätzlich previews/*.png (Playwright-Chromium: npx playwright install chromium)
npm run emails -- --assets     # erzeugt public/email/ neu (Logo-PNG, Schriften)
```

Danach die neuen Dateien committen und die geänderte HTML-Datei in Brevo neu einfügen (Brevo übernimmt nichts automatisch).

Das Skript bricht ab, wenn eine Regel verletzt ist: E-Mail ab 102 KB (Gmail kürzt dann), «ß», Tabelle ohne `role="presentation"`, Bild ohne Alternativtext, Personalisierung (`{{ contact.… }}`, `{{ params.… }}` ausser `{{ params.DOIurl }}`), fehlender Bestätigungslink (`{{ doubleoptin }}` oder `{{ params.DOIurl }}`) bzw. `{{ unsubscribe }}`-Link, Dateiname unter `/email/` mit anderen Zeichen als `a-z`, `0-9`, `.` und `-` (Cloudflare leitet etwa ein «@» mit einem Redirect um).

Die Postadresse und die E-Mail-Adresse im Fuss kommen aus dem Impressum (`src/content.ts` → `legal.contact`). Ändert sich die Adresse dort: `npm run emails` und in Brevo neu einfügen.

**Neues Logo:** Das Logo ist eine einzige Datei, `public/email/wordmark-light-2x.png`, erzeugt aus `src/assets/wordmark-light.svg` (Einstellung `WORDMARK` in `scripts/emails.mjs`). Neues SVG dort ablegen oder `WORDMARK.source` umstellen, dann `npm run emails -- --assets --previews`. Der Dateiname bleibt gleich; nach dem Deploy zeigen alle E-Mails, auch bereits verschickte, das neue Logo (Browser-Cache bis 1 Tag). Das Logo muss hell auf Navy funktionieren; das Skript legt es auf eine abgerundete Navy-Fläche (`WORDMARK.plate`), die Ecken bleiben transparent.

**Texte:** Gleiche Regeln wie auf der Website (AGENTS.md, «Rules for copy»): Schweizer Rechtschreibung, «Sie», nichts erfunden (keine Daten, Zahlen, Partner), höchstens ein Startsignal («Sponsuno startet bald in der Deutschschweiz»), Youngpreneurs nicht erwähnen. Die Bestätigungs-E-Mail bleibt ohne Werbung und ohne Personalisierung.

## Quellen

- Brevo-Platzhalter `{{ doubleoptin }}` und `{{ unsubscribe }}`: Brevo Help Center, «Personalize your messages with dynamic content (Brevo Template Language)», https://help.brevo.com/hc/en-us/articles/4402386448530
- DOI-Vorlage (Tag `optin`, keine Werbung, keine Personalisierung): Brevo Help Center, «Create a custom double opt-in (DOI) email template», https://help.brevo.com/hc/en-us/articles/360019540880
- API-Anmeldung mit DOI (`templateId`, `redirectionUrl`; Platzhalter `{{ params.DOIurl }}` als Alternative zu `{{ doubleoptin }}`): https://developers.brevo.com/reference/create-doi-contact
