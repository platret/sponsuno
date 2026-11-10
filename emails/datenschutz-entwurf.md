# Entwurf: Datenschutzerklärung, Abschnitt «Warteliste» mit Brevo

**Status: Entwurf, nicht live.** Stand: 10. November 2026. Keine Rechtsberatung.

Dieser Text ersetzt den heutigen Abschnitt «Warteliste» in `src/content.ts` → `legal.datenschutz` erst, wenn die Warteliste über Brevo freigeschaltet wird (Checkliste `team/warteliste-setup.md`). Vorher bleibt die Website, wie sie ist: Das Formular speichert nichts, und die Datenschutzerklärung sagt das.

Was noch fehlt, steht in **[eckigen Klammern]**. Nichts davon raten; die Angaben kommen aus Entscheiden und Dokumenten des Teams:

| Platzhalter | Kommt aus |
|---|---|
| Vertragspartner, Sitz, Speicherort, Unterauftragsverarbeiter, Link zum DPA | Schritt 2 der Checkliste (DPA von Brevo, als PDF abgelegt) |
| Speicherdauer, was bei Projektende passiert | Schritt 9 (Entscheid Aufbewahrung) |
| Nachweise der Einwilligung (Protokolle von Brevo), wie lange | Schritt 9 |
| Wer Anfragen beantwortet | Schritt 10 (intern, kommt nicht auf die Website) |
| Übermittlung ausserhalb der Schweiz und des EWR | Schritt 2 (Unterauftragsverarbeiter und ihre Standorte) |

Danach setzt Claude den Text in `content.ts` um, passt die übrigen Stellen an (Liste unten) und setzt `legal.updated` neu. Das Team liest die fertige Fassung, bevor sie live geht.

---

## Warteliste

Auf der Startseite können Sie sich auf die Warteliste von Sponsuno eintragen. Wir verwenden das Double-Opt-in-Verfahren: Sie stehen erst auf der Warteliste, wenn Sie den Link in unserer Bestätigungs-E-Mail angeklickt haben.

**Welche Daten wir bearbeiten**

- Ihre E-Mail-Adresse
- Ihre Auswahl im Formular («Sportlerin oder Sportler», «Sportverein», «Kulturverein» oder «Firma oder Sponsor»)
- Zeitpunkt der Anmeldung und der Bestätigung, wie sie Brevo als Nachweis Ihrer Einwilligung festhält [aus Schritt 9: welche Angaben Brevo dabei speichert, zum Beispiel IP-Adresse, aus dem DPA oder der Brevo-Dokumentation ergänzen, nicht raten]

**Wozu**

Wir schreiben Ihnen, sobald Sponsuno in Ihrer Region startet. Ihre Auswahl hilft uns, Ihnen die passende Nachricht zu schicken. Für anderes verwenden wir Ihre Adresse nicht, und wir geben sie nicht weiter, ausser an die unten genannten Dienstleister, die sie in unserem Auftrag bearbeiten.

**Wie die Anmeldung abläuft**

1. Sie senden das Formular ab. Ihre E-Mail-Adresse und Ihre Auswahl gehen an unsere Website bei Cloudflare (siehe «Hosting bei Cloudflare») und von dort an unseren E-Mail-Dienstleister Brevo. Die Website speichert dabei nichts und protokolliert keine E-Mail-Adressen.
2. Brevo schickt Ihnen eine E-Mail mit einem Bestätigungslink.
3. Erst wenn Sie den Link anklicken, nimmt Brevo Ihre Adresse in die Warteliste auf. Ohne Klick kommen Sie nicht auf die Liste. [aus Schritt 9: was mit nicht bestätigten Anmeldungen geschieht und wann sie gelöscht werden]
4. Nach der Bestätigung schicken wir Ihnen eine kurze Willkommens-E-Mail.

Zum Schutz vor Missbrauch zählt unsere Website, wie oft von derselben IP-Adresse und für dieselbe E-Mail-Adresse Anmeldungen eingehen. Die E-Mail-Adresse wird dafür nur in unkenntlicher Form (als Prüfsumme) verwendet. Diese Zähler liegen bei Cloudflare und verfallen nach etwa einer Minute; wir sehen sie nicht und werten sie nicht aus.

**E-Mail-Dienstleister Brevo**

Die Warteliste und der Versand der E-Mails laufen über Brevo, einen Dienst der [Vertragspartner, Rechtsform und Sitz aus dem DPA, Schritt 2]. Brevo bearbeitet Ihre Daten in unserem Auftrag; mit Brevo besteht eine Vereinbarung zur Auftragsbearbeitung ([Bezeichnung und Link des DPA aus Schritt 2]). Brevo speichert die Daten [Speicherort aus dem DPA]. [Falls Unterauftragsverarbeiter ausserhalb der Schweiz und des EWR: welche Länder und auf welcher Grundlage, aus Schritt 2; sonst diesen Satz streichen.]

**Wie lange**

[Aus Schritt 9: konkreter Zeitpunkt, zum Beispiel «bis zur Mitteilung über den Start in Ihrer Region, danach löschen wir Ihre Adresse» oder eine feste Frist. Nicht «bis auf Weiteres».] Endet das Projekt Sponsuno, löschen wir die Warteliste [Frist aus Schritt 9]. Die Nachweise Ihrer Einwilligung bewahren wir [Frist aus Schritt 9] auf.

**Abmelden**

Jede E-Mail, die wir Ihnen nach der Bestätigung schicken, enthält einen Link zum Abmelden. Sie können sich auch jederzeit mit einer kurzen E-Mail an hello@sponsuno.ch abmelden; dann löschen wir Ihre Adresse.

**Rechtsgrundlage**

Für Besucherinnen und Besucher aus der EU und dem EWR: Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit mit Wirkung für die Zukunft widerrufen können, zum Beispiel über den Abmeldelink.

**Ohne Anmeldung**

Wenn Sie sich lieber per E-Mail melden, finden Sie unsere Adresse unter dem Formular. Dafür gilt der Abschnitt «Kontakt per E-Mail».

---

## Was beim Freischalten sonst noch zu ändern ist (für Claude)

- `legal.datenschutz` → «Kurz zusammengefasst»: Den Punkt «Die Warteliste ist noch nicht freigeschaltet. Das Formular übermittelt nichts.» ersetzen, etwa: «Wenn Sie sich auf die Warteliste eintragen, speichert unser E-Mail-Dienstleister Brevo Ihre Adresse und Ihre Auswahl, erst nachdem Sie die Anmeldung bestätigt haben.»
- «Hosting bei Cloudflare»: Ein Satz, dass beim Absenden des Formulars E-Mail-Adresse und Auswahl über Cloudflare an Brevo gehen, ohne Protokollierung. Der Satz «Wir haben keine Protokollierung einzelner Zugriffe eingerichtet» bleibt wahr, solange `observability` in `wrangler.jsonc` aus ist.
- «Änderungen»: Den Halbsatz «spätestens bevor die Warteliste freigeschaltet wird» streichen.
- `legal.updated` auf den Monat der Freischaltung setzen.
- Die heutigen Absätze zum `mailto:`-Weg bleiben sinngemäss als «Ohne Anmeldung» (oben), weil das Formular die E-Mail-Adresse weiter anzeigt.
- `projectStatus` («Später»: Anmeldungen direkt speichern) und AGENTS.md (Copy-Regel 11, «Open before launch») nachführen.
- Prüfen, ob die Willkommens-E-Mail (`emails/src/willkommen.html`) und die Bestätigungsseite `/warteliste/bestaetigt/` mit dem fertigen Text übereinstimmen (Abmelden, Dauer).
