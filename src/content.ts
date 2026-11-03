// All visible copy of the landing page lives here. Rules for writing it are in AGENTS.md (Swiss spelling,
// formal "Sie", nothing presented as decided or working that the team has not decided or built).

export type SectionId = 'ablauf' | 'ki-manager' | 'kosten' | 'fragen';

export const nav: { id: SectionId; label: string }[] = [
  { id: 'ablauf', label: 'So funktioniert es' },
  { id: 'ki-manager', label: 'KI-Manager' },
  { id: 'kosten', label: 'Kosten' },
  { id: 'fragen', label: 'Fragen' },
];

export const cta = {
  waitlist: 'Auf die Warteliste',
  waitlistShort: 'Warteliste',
};

// Clickable prototype with fictional data (second Vite entry, /demo/)
export const demo = {
  href: 'demo/',
  nav: 'Demo',
  link: 'Demo ansehen',
  linkNote: 'Klickbarer Prototyp mit fiktiven Daten',
};

export type Role = 'athlete' | 'sportverein' | 'kulturverein' | 'sponsor';

export const hero = {
  badge: 'Youngpreneurs-Projekt · Start in der Deutschschweiz',
  titleStart: 'Sponsoring, das',
  // The soft hyphen (\u00AD) lets "zusammenpasst" break cleanly on narrow screens.
  titleAccent: 'zusammen\u00ADpasst.',
  lead: 'Sponsuno bringt Sportlerinnen, Sportler und Vereine aus Sport und Kultur mit Firmen aus ihrer Region zusammen.',
  ctaSeeker: { label: 'Ich suche Sponsoren', role: 'athlete' as Role },
  ctaSponsor: { label: 'Ich möchte sponsern', role: 'sponsor' as Role },
};

// Fictional example for the hero card. Keep the label whenever this changes.
// The photo is a stock photo (Pexels, see photoCredits), not the person described: hence "Symbolbild".
export const match = {
  label: 'Beispiel mit fiktiven Angaben',
  athlete: {
    role: 'Sucht Unterstützung',
    name: 'Langstrecken-Mountainbikerin',
    meta: 'Zürcher Oberland',
    need: 'Material und Reisekosten',
    photoAlt: 'Mountainbikerin mit Helm und Sportbrille auf einem Waldweg',
  },
  sponsor: { role: 'Möchte sponsern', mark: 'V', name: 'Velogeschäft', meta: 'Zürcher Oberland', need: 'Material und Saisonbeitrag' },
  criteria: ['Region', 'Unterstützung', 'Branche', 'Budget'],
  result: 'Passt in 4 von 4 Kriterien',
  imageNote: 'Symbolbild',
};

export const proof = {
  items: [
    'Entstanden aus Gesprächen mit Sportlerinnen, Sportlern und einem Trainer',
    'Youngpreneurs-Programm',
    'Für Sport und Kultur in der Deutschschweiz',
  ],
  disciplinesLabel: 'Zum Beispiel für',
  disciplines: ['Mountainbike', 'Unihockey', 'Musikgesellschaft', 'Beachvolleyball', 'Theaterverein', 'Triathlon', 'Chor', 'Turnverein'],
};

// Audience section under the proof line. The photos are stock photos (Symbolbilder, see photoCredits):
// the people shown have nothing to do with Sponsuno. Keep the note whenever the photos change.
export type AudienceImage = 'athlete' | 'sportverein' | 'kulturverein' | 'firma';

export const audience = {
  title: 'Für wen Sponsuno gedacht ist',
  intro: 'Für alle, die in ihrer Region Unterstützung suchen oder geben möchten, im Sport wie in der Kultur.',
  items: [
    {
      image: 'athlete',
      label: 'Sportlerinnen und Sportler',
      text: 'Sie trainieren neben Ausbildung oder Beruf und suchen Unterstützung für Material, Startgelder oder Reisen.',
      alt: 'Eine Person läuft auf einem schmalen Bergweg durch grüne Hänge mit blühenden Alpenrosen.',
    },
    {
      image: 'sportverein',
      label: 'Sportvereine',
      text: 'Ehrenamtliche Vorstände, die Partner für Trikots, Trainingslager oder Turniere suchen.',
      alt: 'Ein Ruderboot mit drei Personen von oben auf einem Fluss in der Abendsonne.',
    },
    {
      image: 'kulturverein',
      label: 'Kulturvereine',
      text: 'Musikgesellschaften, Chöre und Theatervereine, die Instrumente, Kostüme oder Aufführungen finanzieren müssen.',
      alt: 'Musikanten in Tracht und Filzhut spielen Posaune, vorne ein Notenhalter.',
    },
    {
      image: 'firma',
      label: 'Firmen aus der Region',
      text: 'Gewerbe und KMU, die sich vor Ort engagieren möchten: mit Geld, Material oder Dienstleistungen.',
      alt: 'Zwei Handwerker in Arbeitsschürzen besprechen sich an der Werkbank einer Schreinerei.',
    },
  ] satisfies { image: AudienceImage; label: string; text: string; alt: string }[],
  noteBefore: 'Symbolbilder: Die abgebildeten Personen haben keinen Bezug zu Sponsuno. Bildnachweise im ',
  noteLink: 'Impressum',
  noteLinkHref: 'impressum/',
  noteAfter: '.',
};

export const problem = {
  title: 'Heute kostet Sponsoring vor allem Zeit und Kontakte.',
  intro: 'Das haben uns vier Sportlerinnen und Sportler und ein Tennistrainer im Herbst 2026 erzählt. Drei Punkte kamen mehrfach zur Sprache.',
  items: [
    {
      title: 'Ohne Kontakte kein Zugang',
      text: 'Wer niemanden kennt, weiss nicht, welche Firma Interesse hat und wer dort zuständig ist. Bei mehreren Befragten kamen die Sponsoren vor allem aus dem Bekanntenkreis.',
    },
    {
      title: 'Der Aufwand läuft neben Training und Ehrenamt',
      text: 'Dossiers schreiben, Anfragen verschicken, Absagen einstecken und Partner betreuen. All das passiert in der freien Zeit.',
    },
    {
      title: 'Was beide Seiten erwarten, bleibt offen',
      text: 'Gegenleistungen sind oft nicht klar vereinbart. Später bleibt unklar, ob sich die Partnerschaft für beide gelohnt hat.',
    },
  ],
};

export type Track = 'seeker' | 'sponsor';

export const howItWorks = {
  title: 'So ist Sponsuno gedacht',
  intro: 'Zwei Seiten, ein gemeinsamer Ablauf: vom ersten Profil bis zur Bilanz nach der Saison.',
  switchLabel: 'Ablauf anzeigen für',
  stepLabel: 'Schritt',
  tracks: {
    seeker: {
      label: 'Sportler und Vereine',
      steps: [
        { title: 'Profil anlegen', text: 'Region, Sportart oder Sparte, was Sie brauchen und was Sie als Gegenleistung bieten. Vorlagen helfen beim Ausfüllen.' },
        { title: 'Passende Firmen sehen', text: 'Sponsuno schlägt Firmen vor, die nach Region, Budget, Branche und Art der Unterstützung zu Ihnen passen.' },
        { title: 'Anfrage senden', text: 'Der KI-Manager entwirft die Anfrage aus Ihrem Profil. Sie prüfen und entscheiden, was rausgeht.' },
        { title: 'Vereinbaren und betreuen', text: 'Gegenleistungen und Termine sind festgehalten. Am Ende schauen beide Seiten gemeinsam zurück.' },
      ],
    },
    sponsor: {
      label: 'Firmen',
      steps: [
        { title: 'Firmenprofil anlegen', text: 'Region, Budget, Ziele und welche Unterstützung Sie geben möchten: Geld, Material oder Dienstleistungen.' },
        { title: 'Vorschläge erhalten', text: 'Sie sehen Sportlerinnen, Sportler und Vereine aus Ihrer Region, die zu Ihrer Firma passen.' },
        { title: 'Anfragen prüfen', text: 'Sie schlagen ein Gespräch vor oder sagen ab. Ohne Dossierstapel und ohne kalte Anfragen.' },
        { title: 'Vereinbaren und Wirkung prüfen', text: 'Gegenleistungen werden vor Beginn festgehalten. Nach der Saison ziehen Sie gemeinsam Bilanz.' },
      ],
    },
  },
};

export const aiManager = {
  title: 'Ein KI-Manager für alles, was neben Training und Vereinsarbeit liegen bleibt.',
  intro: 'Nach der Vermittlung fängt die Arbeit erst an. Der geplante KI-Sponsoringmanager soll Ihnen Schreibarbeit abnehmen und den Überblick behalten. Entwürfe gehen erst raus, wenn Sie sie geprüft haben.',
  draft: {
    app: 'Ihr KI-Sponsoringmanager',
    label: 'Entwurf: Anfrage an ein Sportgeschäft',
    text: 'Guten Tag. Ich fahre Langstreckenrennen im Mountainbike und trainiere im Zürcher Oberland. Für die Saison 2027 suche ich einen Materialpartner aus der Region …',
    status: 'Wartet auf Ihre Prüfung',
    primary: 'Prüfen',
    secondary: 'Später',
  },
  reminder: {
    title: 'An Termine erinnern',
    label: 'In sechs Wochen',
    text: 'Der Vertrag mit dem Velogeschäft endet. Gespräch zur Verlängerung vorschlagen?',
  },
  deliverables: {
    title: 'Gegenleistungen im Blick',
    items: [
      { text: 'Logo auf dem Trikot', done: true, note: 'Erledigt' },
      { text: 'Drei Beiträge auf Instagram', done: false, note: '2 von 3' },
      { text: 'Besuch am Firmenanlass', done: false, note: 'Offen' },
    ],
  },
  caption: 'Beispielansicht. Der KI-Manager ist in Entwicklung.',
  demoLink: 'Im Demo ausprobieren',
};

export const support = {
  title: 'Nicht jede Unterstützung ist Geld.',
  intro: 'Material oder Ausrüstung helfen oft genauso viel. Sponsuno soll Geld- und Sachleistungen vermitteln. Ziel sind Partnerschaften, die länger als eine Saison halten.',
  kinds: [
    { icon: 'money', title: 'Geld', text: 'Beiträge an Saison, Reisen, Startgelder oder Vereinsprojekte.' },
    { icon: 'gear', title: 'Material und Ausrüstung', text: 'Velos, Bälle, Trikots oder Instrumente. Denkbar ist auch gebrauchtes, gut erhaltenes Material.' },
    { icon: 'shared', title: 'Geteilte Technik', text: 'Eine Idee, die wir prüfen: Vereine nutzen zum Beispiel Veranstaltungstechnik gemeinsam.' },
  ] as const,
};

export const pricing = {
  title: 'Provision statt Abo',
  intro: 'So ist das Modell geplant. Was noch offen ist, steht hier als offen.',
  rows: [
    { label: 'Abo oder Grundgebühr', value: 'Keines geplant', state: 'decided' as const },
    { label: 'Vermittlung', value: 'Provision, wenn eine Partnerschaft zustande kommt', state: 'decided' as const },
    { label: 'Höhe der Provision und zahlende Seite', value: 'Wird vor dem Start festgelegt', state: 'open' as const },
    { label: 'Fotos, Videos und Inhalte für Sponsoren', value: 'Separat buchbar geplant', state: 'decided' as const },
  ],
  note: 'Bei der Festlegung berücksichtigen wir ausdrücklich auch kleine Sponsoringbeträge.',
  openLabel: 'offen',
};

export const faq = {
  title: 'Fragen, die wir oft hören',
  introBefore: 'Ihre Frage fehlt? Tragen Sie sich auf der ',
  introLink: 'Warteliste',
  introAfter: ' ein, wir melden uns.',
  items: [
    {
      q: 'Bleibt nach der Provision genug übrig?',
      a: 'Das klären wir vor dem Start. Höhe der Provision und welche Seite sie trägt, sind noch nicht festgelegt. Dabei berücksichtigen wir ausdrücklich auch kleine Sponsoringbeträge.',
    },
    {
      q: 'Sind die Firmen wirklich interessiert?',
      a: 'Sponsoren sollen sich selbst anmelden und angeben, was sie suchen und was sie bieten. Die Vorschläge sollen auf diesen Angaben beruhen, nicht auf gekauften Adresslisten.',
    },
    {
      q: 'Muss ich trotzdem alles selbst machen?',
      a: 'Das Gespräch mit dem Sponsor führen Sie selbst. Vorlagen und der KI-Manager sollen Ihnen Schreibarbeit, Erinnerungen und den Überblick abnehmen.',
    },
    {
      q: 'Lohnt sich der Aufwand für die Gegenleistungen?',
      a: 'Gegenleistungen werden vor Beginn vereinbart. So sehen Sie früh, ob Aufwand und Unterstützung zusammenpassen, und können ablehnen, bevor Sie etwas zusagen.',
    },
    {
      q: 'Für wen ist Sponsuno gedacht?',
      a: 'Für Sportlerinnen und Sportler, Sport- und Kulturvereine sowie Firmen, die in ihrer Region sponsern möchten. Wir starten in der Deutschschweiz.',
    },
    {
      q: 'Wann geht es los?',
      a: 'Sponsuno ist im Aufbau. Wer auf der Warteliste steht, erfährt zuerst, wann es losgeht.',
    },
  ],
};

// Founders section (id="team"), between FAQ and waitlist. Team decision (2026-11-03): full names allowed here.
// Nothing else personal (no ages, schools, home addresses, private e-mails, social handles).
// Without a photo the card shows a monogram. To add a real, consented photo later: put a square JPEG
// (at least 240 x 240 px, under 40 KB) in src/assets/photos/, import it at the top of this file and set
// `photo: { src: importedFile, alt: 'Porträt von …' }` on the person.
export type TeamMember = {
  name: string;
  /** Provisional focus in the team */
  focus: string;
  photo?: { src: string; alt: string };
};

const teamMembers: TeamMember[] = [
  { name: 'Aurel Eugster', focus: 'Medien und Content' },
  { name: 'Alex Platret', focus: 'Technik' },
  { name: 'Maurice Strässle', focus: 'Branding, Marketing, Sales und Partnerschaften' },
  { name: 'Dozie Ilunga', focus: 'Organisation und Prozesse' },
];

export const team = {
  title: 'Wer hinter Sponsuno steht',
  intro: 'Wir sind vier Gründer im Youngpreneurs-Programm und bauen Sponsuno aus Gesprächen mit Sportlerinnen, Sportlern und einem Trainer auf. Die Aufgaben im Team sind vorläufig verteilt.',
  members: teamMembers,
};

export const waitlist = {
  title: 'Als Erste erfahren, wann es losgeht.',
  intro: 'Tragen Sie sich ein. Wir melden uns, sobald es in der Deutschschweiz losgeht.',
  legend: 'Ich bin',
  roles: [
    { value: 'athlete', label: 'Sportlerin oder Sportler' },
    { value: 'sportverein', label: 'Sportverein' },
    { value: 'kulturverein', label: 'Kulturverein' },
    { value: 'sponsor', label: 'Firma oder Sponsor' },
  ] satisfies { value: Role; label: string }[],
  emailLabel: 'E-Mail-Adresse',
  placeholder: 'name@beispiel.ch',
  submit: 'Auf die Warteliste',
  hint: 'Wir verwenden Ihre Adresse nur für Nachrichten zum Start von Sponsuno.',
  invalid: 'Bitte geben Sie eine gültige E-Mail-Adresse ein, zum Beispiel name@beispiel.ch.',
  failed: 'Die Anmeldung hat nicht geklappt. Bitte versuchen Sie es in ein paar Minuten nochmals.',
  success: 'Danke. Sie stehen auf der Warteliste. Wir melden uns, sobald es losgeht.',
  // Shown while no VITE_WAITLIST_ENDPOINT is configured: the form works, but nothing is stored
  previewNote: 'Vorschau: Die Warteliste ist noch nicht freigeschaltet. Ihre Adresse wird nicht gespeichert.',
  previewSuccess: 'So sieht die Bestätigung aus. Gespeichert wurde nichts, die Warteliste ist noch nicht freigeschaltet.',
};

// Footer link hrefs: '#id' = section of the landing page, 'path/' = page relative to the site root
// (resolved with the base path by siteHref() in lib/links.ts, so they work from every page).
export type FooterLink = { href: string; label: string };

export const footer = {
  sub: 'Sponsoring für Sport und Kultur in der Deutschschweiz. Sponsuno ist im Aufbau.',
  columns: [
    {
      title: 'Plattform',
      links: [
        { href: '#ablauf', label: 'So funktioniert es' },
        { href: '#ki-manager', label: 'KI-Manager' },
        { href: '#kosten', label: 'Kosten' },
        { href: 'demo/', label: 'Demo' },
      ],
    },
    {
      title: 'Mehr',
      links: [
        { href: '#fragen', label: 'Fragen' },
        { href: '#team', label: 'Team' },
        { href: '#warteliste', label: 'Warteliste' },
        { href: '#top', label: 'Nach oben' },
      ],
    },
    {
      title: 'Rechtliches',
      links: [
        { href: 'impressum/', label: 'Impressum' },
        { href: 'datenschutz/', label: 'Datenschutz' },
      ],
    },
  ] satisfies { title: string; links: FooterLink[] }[],
  copyright: '© 2026 Team Sponsuno',
  program: 'Ein Projekt im Youngpreneurs-Programm',
};

export const stickyCta = {
  text: 'Sponsuno ist im Aufbau.',
  button: 'Auf die Warteliste',
};

export const menu = {
  open: 'Menü öffnen',
  close: 'Menü schliessen',
  label: 'Menü',
};

// ---------- Legal pages: Impressum (/impressum/) and Datenschutzerklärung (/datenschutz/) ----------
// Rendered by src/components/LegalPage.tsx and prerendered at build time. Rules:
// - Never invent contact data. Unknown fields stay null and render as pending (legal.pending).
//   The contact data is legally required as soon as the pages are public (DSG Art. 19 Abs. 2 lit. a,
//   DSGVO Art. 13 Abs. 1 lit. a): fill it in before deploying. The build warns while a field is null.
//   No @sponsuno addresses until a domain exists (AGENTS.md, copy rule 8).
// - No statement about a commercial-register entry, either way.
// - Team decision (2026-11-03): the four founders appear with full names here and in the founders section.
//   Nothing else personal about them (no ages, schools, home addresses, private e-mails, social handles).
// - Update `legal.updated` and the Datenschutz text before the waitlist endpoint is switched on.

/** A link inside legal text. `href` is either absolute (https://…) or a page path relative to the site root ('demo/'). */
export type LegalLink = { label: string; href: string };
/** Plain text, or text with inline links. */
export type LegalText = string | (string | LegalLink)[];

export type LegalBlock =
  | { type: 'p'; text: LegalText }
  | { type: 'list'; items: LegalText[] }
  | { type: 'h3'; text: string }
  /** The four responsible persons */
  | { type: 'persons' }
  /** Postal address and e-mail from legal.contact (null fields show the pending note) */
  | { type: 'contact' }
  /** Image credits: photoCredits plus the AI-generated images */
  | { type: 'credits' };

export type LegalSection = { id: string; title: string; blocks: LegalBlock[] };

export type LegalPageContent = {
  title: string;
  intro: LegalText;
  sections: LegalSection[];
};

/** A stock or commissioned photo used on the site. Filled in by whoever adds a photo; listed in the Impressum. */
export type PhotoCredit = {
  /** What the photo shows and where it is used, e.g. 'Unihockey-Training, Abschnitt "Nicht nur Geld"' */
  subject: string;
  photographer: string;
  /** Platform or archive, e.g. 'Unsplash' */
  source: string;
  /** Page of the photo at the source */
  sourceUrl: string;
  /** Licence name, e.g. 'Unsplash-Lizenz' */
  licence: string;
  licenceUrl?: string;
};

/** Every third-party photo on the site, in page order. Listed in the Impressum. Originals stay outside the repo. */
export const photoCredits: PhotoCredit[] = [
  {
    subject: 'Mountainbikerin in der Beispielkarte (Startseite), Symbolbild',
    photographer: 'Corneliu Stefan Esanu',
    source: 'Pexels',
    sourceUrl: 'https://www.pexels.com/photo/woman-riding-on-a-mountain-bike-23410483/',
    licence: 'Pexels-Lizenz',
    licenceUrl: 'https://www.pexels.com/de-de/lizenz/',
  },
  {
    subject: 'Traillauf auf einem Bergweg, Abschnitt «Für wen Sponsuno gedacht ist», Symbolbild',
    photographer: 'Alin Serban',
    source: 'Pexels',
    sourceUrl: 'https://www.pexels.com/photo/trail-runner-in-green-mountain-landscape-30932860/',
    licence: 'Pexels-Lizenz',
    licenceUrl: 'https://www.pexels.com/de-de/lizenz/',
  },
  {
    subject: 'Ruderteam auf dem Fluss, Abschnitt «Für wen Sponsuno gedacht ist», Symbolbild',
    photographer: 'Adrian Jozefowicz',
    source: 'Pexels',
    sourceUrl: 'https://www.pexels.com/photo/three-people-on-brown-canoe-sailing-on-calm-water-1046231/',
    licence: 'Pexels-Lizenz',
    licenceUrl: 'https://www.pexels.com/de-de/lizenz/',
  },
  {
    subject: 'Blasmusik in Tracht, Abschnitt «Für wen Sponsuno gedacht ist», Symbolbild',
    photographer: 'Bastian Riccardi',
    source: 'Pexels',
    sourceUrl: 'https://www.pexels.com/photo/traditional-bavarian-musicians-playing-trombones-34013753/',
    licence: 'Pexels-Lizenz',
    licenceUrl: 'https://www.pexels.com/de-de/lizenz/',
  },
  {
    subject: 'Schreinerei, Abschnitt «Für wen Sponsuno gedacht ist», Symbolbild',
    photographer: 'cottonbro studio',
    source: 'Pexels',
    sourceUrl: 'https://www.pexels.com/photo/men-looking-at-a-piece-of-wood-7484154/',
    licence: 'Pexels-Lizenz',
    licenceUrl: 'https://www.pexels.com/de-de/lizenz/',
  },
];

export const legal = {
  updated: 'Stand: November 2026',
  skipLink: 'Zum Inhalt springen',
  backHome: 'Zur Startseite',
  homeLabel: 'Sponsuno, zur Startseite',
  tocLabel: 'Auf dieser Seite',
  pending: 'fehlt noch, wird in Kürze ergänzt.',
  project: 'Sponsuno',
  projectNote: 'Projekt in Entwicklung im Youngpreneurs-Programm',
  persons: ['Aurel Eugster', 'Alex Platret', 'Maurice Strässle', 'Dozie Ilunga'],
  /** Unknown until the team decides. Never fill in a guess. */
  contact: {
    postalAddress: ['Klosterstrasse 34', '8406 Winterthur', 'Schweiz'] as string[] | null,
    email: 'hello@sponsuno.ch' as string | null,
  },
  contactLabels: { postalAddress: 'Postadresse', email: 'E-Mail' },
  credits: {
    teamWork: 'Texte, Gestaltung, Logo und Corporate Design: Team Sponsuno.',
    photosLabel: 'Fotos',
    photosNone: 'Derzeit verwendet diese Website keine Fotos von Dritten.',
    photoBy: 'Foto',
    aiLabel: 'KI-generierte Bilder',
    aiImages: ['Porträt der Mountainbikerin in der Demo (Profil und Sponsor-Cockpit): KI-generiert, Symbolbild ohne reale Person.'],
    fonts: 'Schriften: Cormorant Garamond und Manrope, beide unter der SIL Open Font License 1.1, ausgeliefert von dieser Website.',
  },

  impressum: {
    title: 'Impressum',
    intro: 'Angaben zum Projekt Sponsuno und zu dieser Website.',
    sections: [
      {
        id: 'betreiber',
        title: 'Betreiber',
        blocks: [
          { type: 'p', text: 'Diese Website gehört zum Projekt Sponsuno. Sponsuno ist ein Projekt in Entwicklung im Youngpreneurs-Programm und wird von einem Team aus vier Personen getragen.' },
        ],
      },
      {
        id: 'verantwortlich',
        title: 'Verantwortliche Personen',
        blocks: [
          { type: 'p', text: 'Für den Inhalt dieser Website verantwortlich:' },
          { type: 'persons' },
        ],
      },
      {
        id: 'kontakt',
        title: 'Kontakt',
        blocks: [
          { type: 'contact' },
        ],
      },
      {
        id: 'hinweis',
        title: 'Hinweis zum Inhalt',
        blocks: [
          { type: 'p', text: 'Diese Website beschreibt eine geplante Plattform. Sponsuno ist noch nicht in Betrieb: Vermittlung, KI-Sponsoringmanager und Zahlungen gibt es noch nicht. Angaben zu Funktionen, Kosten und Abläufen geben den aktuellen Planungsstand wieder und können sich ändern.' },
          { type: 'p', text: ['Die ', { label: 'Demo', href: 'demo/' }, ' ist ein klickbarer Prototyp mit fiktiven Daten. Personen, Firmen, Vereine und Beträge darin sind erfunden. Ähnlichkeiten mit realen Personen oder Firmen sind nicht beabsichtigt.'] },
        ],
      },
      {
        id: 'haftung',
        title: 'Haftungsausschluss',
        blocks: [
          { type: 'h3', text: 'Inhalte' },
          { type: 'p', text: 'Wir erstellen die Inhalte dieser Website mit Sorgfalt. Für ihre Richtigkeit, Vollständigkeit und Aktualität übernehmen wir jedoch keine Gewähr. Haftungsansprüche wegen Schäden, die aus dem Zugriff auf diese Website, ihrer Nutzung oder aus technischen Störungen entstehen, sind ausgeschlossen, soweit das Gesetz dies zulässt.' },
          { type: 'h3', text: 'Links' },
          { type: 'p', text: 'Diese Website enthält Links zu Websites Dritter. Auf deren Inhalte haben wir keinen Einfluss; dafür ist allein der jeweilige Anbieter verantwortlich. Beim Setzen der Links waren keine rechtswidrigen Inhalte erkennbar. Erfahren wir von einem Rechtsverstoss, entfernen wir den betreffenden Link.' },
        ],
      },
      {
        id: 'urheberrecht',
        title: 'Urheberrecht und Bildnachweise',
        blocks: [
          { type: 'p', text: 'Texte, Gestaltung, Logo und Bilder dieser Website sind urheberrechtlich geschützt. Ohne vorherige schriftliche Zustimmung der Rechteinhaber dürfen sie nicht kopiert, verändert oder weiterverwendet werden, soweit das Gesetz es nicht ausdrücklich erlaubt.' },
          { type: 'credits' },
        ],
      },
    ],
  } satisfies LegalPageContent,

  datenschutz: {
    // Soft hyphen (\u00AD): the long word breaks cleanly in the H1 on phones.
    // Dates use no-break spaces (\u00A0) so "15." never ends a line on its own.
    title: 'Datenschutz\u00ADerklärung',
    intro: 'Hier erfahren Sie, welche Personendaten beim Besuch dieser Website bearbeitet werden, wozu das geschieht und welche Rechte Sie haben. Die Erklärung richtet sich nach dem Schweizer Datenschutzgesetz (DSG). Für Besucherinnen und Besucher aus der EU und dem EWR enthält sie auch die Angaben nach Art. 13 der Datenschutz-Grundverordnung (DSGVO).',
    sections: [
      {
        id: 'kurz',
        title: 'Kurz zusammengefasst',
        blocks: [
          {
            type: 'list',
            items: [
              'Diese Website setzt keine Cookies und verwendet keine Analyse- oder Trackingdienste.',
              'Es sind keine Inhalte Dritter eingebettet. Schriften und Bilder kommen vom selben Server wie die Website.',
              'Beim Aufruf bearbeitet unser Hoster Cloudflare technische Zugriffsdaten, darunter Ihre IP-Adresse.',
              'Die Demo speichert Ihre Änderungen nur in Ihrem Browser. Nichts davon verlässt Ihr Gerät.',
              'Die Warteliste ist noch nicht freigeschaltet. Das Formular übermittelt nichts.',
            ],
          },
        ],
      },
      {
        id: 'verantwortlich',
        title: 'Verantwortlich',
        blocks: [
          { type: 'p', text: 'Verantwortlich für die Bearbeitung von Personendaten auf dieser Website ist das Team des Projekts Sponsuno, ein Projekt in Entwicklung im Youngpreneurs-Programm:' },
          { type: 'persons' },
          { type: 'contact' },
          { type: 'p', text: 'Über diese Kontaktangaben erreichen Sie uns für alle Fragen zum Datenschutz und um Ihre Rechte auszuüben.' },
        ],
      },
      {
        id: 'hosting',
        title: 'Hosting bei Cloudflare',
        blocks: [
          { type: 'p', text: 'Diese Website wird über Cloudflare Workers bereitgestellt, einen Dienst der Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA. Bei jedem Aufruf einer Seite bearbeitet Cloudflare technische Zugriffsdaten, insbesondere:' },
          {
            type: 'list',
            items: [
              'IP-Adresse des aufrufenden Geräts',
              'Datum und Uhrzeit des Zugriffs',
              'aufgerufene Seite oder Datei',
              'Browser und Betriebssystem (User-Agent)',
              'die zuvor besuchte Seite (Referrer), sofern Ihr Browser sie übermittelt',
            ],
          },
          { type: 'p', text: 'Zweck: Ohne diese Daten kann die Website nicht ausgeliefert werden. Sie dienen ausserdem dem sicheren Betrieb und der Abwehr von Angriffen und Missbrauch.' },
          { type: 'p', text: ['Cloudflare bearbeitet diese Daten in unserem Auftrag. Für Daten, die Cloudflare zum Schutz seines Netzwerks verwendet, ist Cloudflare nach eigenen Angaben selbst verantwortlich (', { label: 'Datenschutzerklärung von Cloudflare', href: 'https://www.cloudflare.com/privacypolicy/' }, '). Mit Cloudflare besteht eine Vereinbarung zur Auftragsbearbeitung (', { label: 'Cloudflare Data Processing Addendum', href: 'https://www.cloudflare.com/cloudflare-customer-dpa/' }, ').'] },
          { type: 'p', text: 'Wir haben keine Protokollierung einzelner Zugriffe eingerichtet und werten keine Zugriffsdaten aus. In unserem Cloudflare-Konto sehen wir zusammengefasste Zugriffsstatistiken und, falls eine Sicherheitsfunktion eingreift, eine Stichprobe dieser Ereignisse der letzten 31\u00A0Tage. Wie lange Cloudflare die Daten darüber hinaus aufbewahrt, legt Cloudflare fest; eine konkrete Frist nennt Cloudflare nicht.' },
          { type: 'p', text: 'Rechtsgrundlage für Besucherinnen und Besucher aus der EU und dem EWR: unser berechtigtes Interesse an einer sicheren und funktionsfähigen Website (Art. 6 Abs. 1 lit. f DSGVO).' },
        ],
      },
      {
        id: 'usa',
        title: 'Übermittlung in die USA',
        blocks: [
          { type: 'p', text: ['Cloudflare bearbeitet die Zugriffsdaten auch in den USA. Cloudflare, Inc. ist nach dem Swiss-U.S. Data Privacy Framework, dem EU-U.S. Data Privacy Framework und dessen Erweiterung für das Vereinigte Königreich zertifiziert. Den aktuellen Stand können Sie in der ', { label: 'offiziellen Liste des Data Privacy Framework', href: 'https://www.dataprivacyframework.gov/participant/5666' }, ' prüfen.'] },
          { type: 'p', text: ['Der Bundesrat anerkennt seit dem 15.\u00A0September\u00A02024 für US-Unternehmen mit dieser Zertifizierung ein angemessenes Datenschutzniveau (', { label: 'Medienmitteilung des Bundesrates vom 14.\u00A0August\u00A02024', href: 'https://www.admin.ch/gov/de/start/dokumentation/medienmitteilungen/bundesrat.msg-id-102054.html' }, '). Für Übermittlungen aus der EU und dem EWR gilt der Angemessenheitsbeschluss der EU-Kommission zum EU-U.S. Data Privacy Framework (Art. 45 DSGVO). Sollte die Zertifizierung entfallen, stützt sich Cloudflare nach eigenen Angaben auf die Standardvertragsklauseln der EU-Kommission.'] },
        ],
      },
      {
        id: 'cookies',
        title: 'Keine Cookies, kein Tracking, keine Einbettungen',
        blocks: [
          { type: 'p', text: 'Diese Website setzt keine Cookies und verwendet weder Analyse- noch Tracking- oder Werbedienste. Funktionen von Cloudflare, die Cookies setzen (etwa Bot Fight Mode oder Challenges), haben wir nicht aktiviert. Es sind keine Inhalte Dritter eingebettet, etwa Videos, Karten oder Social-Media-Schaltflächen. Schriften und Bilder werden vom selben Server ausgeliefert wie die Website; beim Laden werden keine Daten an Google oder andere Anbieter übermittelt.' },
        ],
      },
      {
        id: 'demo',
        title: 'Demo',
        blocks: [
          { type: 'p', text: ['Die ', { label: 'Demo', href: 'demo/' }, ' ist ein Prototyp mit fiktiven Daten. Damit Ihre Änderungen (zum Beispiel ein bearbeitetes Profil oder ein Entwurf) beim nächsten Besuch noch da sind, speichert die Demo sie im lokalen Speicher Ihres Browsers (localStorage, Schlüssel «sponsuno-demo-v2»). Diese Daten bleiben auf Ihrem Gerät und werden weder an uns noch an Dritte übermittelt.'] },
          { type: 'p', text: 'Löschen können Sie die Daten jederzeit, indem Sie in Ihrem Browser die Websitedaten dieser Seite löschen. Die Demo zeigt danach wieder den Ausgangszustand.' },
        ],
      },
      {
        id: 'warteliste',
        title: 'Warteliste',
        blocks: [
          { type: 'p', text: 'Die Warteliste ist noch nicht freigeschaltet. Das Formular zeigt nur eine Vorschau der Bestätigung; Ihre E-Mail-Adresse und Ihre Auswahl werden weder gespeichert noch übermittelt.' },
          { type: 'p', text: 'Bevor wir die Warteliste freischalten, ergänzen wir diese Datenschutzerklärung: welche Daten wir dann speichern, bei welchem Anbieter, wie lange und wie Sie sich wieder austragen können.' },
        ],
      },
      {
        id: 'links',
        title: 'Links zu anderen Websites',
        blocks: [
          { type: 'p', text: 'Diese Website enthält Links zu Websites Dritter. Erst wenn Sie einem solchen Link folgen, erhält der jeweilige Anbieter Daten von Ihrem Browser, etwa Ihre IP-Adresse. Für die Datenbearbeitung auf diesen Websites ist der jeweilige Anbieter verantwortlich.' },
        ],
      },
      {
        id: 'rechte',
        title: 'Ihre Rechte',
        blocks: [
          { type: 'p', text: 'Sie haben im Rahmen des anwendbaren Datenschutzrechts insbesondere folgende Rechte:' },
          {
            type: 'list',
            items: [
              'Auskunft darüber, ob und welche Personendaten wir über Sie bearbeiten',
              'Berichtigung unrichtiger Personendaten',
              'Löschung Ihrer Personendaten',
              'Widerspruch gegen die Bearbeitung Ihrer Personendaten',
              'Herausgabe oder Übertragung Ihrer Personendaten in einem gängigen elektronischen Format',
            ],
          },
          { type: 'p', text: 'Besucherinnen und Besucher aus der EU und dem EWR haben zudem das Recht auf Einschränkung der Bearbeitung. Da wir selbst keine Zugriffsdaten erhalten, können wir zu den Zugriffsdaten bei Cloudflare keine Auskunft geben; dafür ist Cloudflare zuständig.' },
          { type: 'h3', text: 'Beschwerde bei einer Aufsichtsbehörde' },
          { type: 'p', text: ['In der Schweiz ist der Eidgenössische Datenschutz- und Öffentlichkeitsbeauftragte (EDÖB), Feldeggweg 1, 3003 Bern, zuständig. Wie Sie eine Anzeige einreichen, erklärt der EDÖB auf der Seite ', { label: '«Eine Anzeige beim EDÖB erstatten»', href: 'https://www.edoeb.admin.ch/de/anzeige-einreichen' }, '; dort finden Sie auch die Anzeigeformulare.'] },
          { type: 'p', text: ['Besucherinnen und Besucher aus der EU und dem EWR können sich bei der Datenschutz-Aufsichtsbehörde ihres Wohnsitzlandes beschweren. Eine ', { label: 'Liste der Aufsichtsbehörden', href: 'https://www.edpb.europa.eu/about-edpb/about-edpb/members_en' }, ' führt der Europäische Datenschutzausschuss.'] },
        ],
      },
      {
        id: 'aenderungen',
        title: 'Änderungen',
        blocks: [
          { type: 'p', text: 'Wir passen diese Datenschutzerklärung an, wenn sich die Website oder die Rechtslage ändert, spätestens bevor die Warteliste freigeschaltet wird. Es gilt die hier veröffentlichte Fassung.' },
        ],
      },
    ],
  } satisfies LegalPageContent,
};

export type LegalPageId = 'impressum' | 'datenschutz';
