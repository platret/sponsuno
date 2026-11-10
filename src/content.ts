// All visible copy of the landing page lives here. Rules for writing it are in AGENTS.md (Swiss spelling,
// formal "Sie", nothing presented as decided or working that the team has not decided or built).

import { pageMeta } from './pages';

// Main navigation: one list for the landing page header (Header, MobileMenu) and the static pages (PageHeader).
// Page paths relative to the site root (resolved with the base path by pageHref() in lib/links.ts). "Ratgeber" opens
// the first guide; on the other guides it is marked as the current section. "Fragen" sits in the footer.
export const nav: { href: string; label: string }[] = [
  { href: pageMeta('fuer-firmen').path, label: 'Für Firmen' },
  { href: pageMeta('ki-manager').path, label: 'KI-Manager' },
  { href: pageMeta('kosten').path, label: 'Kosten' },
  { href: pageMeta('sponsoren-finden').path, label: 'Ratgeber' },
  { href: pageMeta('ueber-uns').path, label: 'Über uns' },
  { href: 'demo/', label: 'Vorschau' },
];

export const cta = {
  waitlist: 'Auf die Warteliste',
  waitlistShort: 'Warteliste',
};

// Clickable product preview with example data (second Vite entry, /demo/). The preview itself says "Beispieldaten" in
// its banner, so links to it carry no extra note (owner's direction 2026-11-10: no meta-text next to every link).
export const demo = {
  href: 'demo/',
  link: 'Produktvorschau ansehen',
};

// The sponsor's side of the demo and the page for companies, linked from several places (audience tile, Firmen track
// in #ablauf, /fuer-firmen/, the waitlist's next step). One definition, so the labels stay the same everywhere.
export const cockpitLink: FooterLink = { href: 'demo/#/sponsor', label: 'Sponsor-Cockpit ansehen' };
export const firmsLink: FooterLink = { href: pageMeta('fuer-firmen').path, label: 'Sponsuno für Firmen' };

export type Role = 'athlete' | 'sportverein' | 'kulturverein' | 'sponsor';

export const hero = {
  // The landing page's one launch signal (AGENTS.md, copy rules): confident, no date.
  badge: 'Bald verfügbar in der Deutschschweiz',
  titleStart: 'Sponsoring, das',
  // The soft hyphen (\u00AD) lets "zusammenpasst" break cleanly on narrow screens.
  titleAccent: 'zusammen\u00ADpasst.',
  lead: 'Sponsuno bringt Sportlerinnen, Sportler und Vereine aus Sport und Kultur mit Firmen aus ihrer Region zusammen.',
  ctaSeeker: { label: 'Ich suche Sponsoren', role: 'athlete' as Role },
  ctaSponsor: { label: 'Ich möchte sponsern', role: 'sponsor' as Role },
};

// Fictional example for the match card on the story stage ("Ein Match" step). Keep the label whenever this changes:
// it is the card's one "Beispieldaten" label. The photo is a stock photo (Pexels, see photoCredits), not the person
// described; the label covers it, the credit is in the Impressum.
export const match = {
  label: 'Beispieldaten',
  athlete: {
    role: 'Sucht Unterstützung',
    name: 'Langstrecken-Mountainbikerin',
    meta: 'Zürcher Oberland',
    need: 'Material und Reisekosten',
  },
  sponsor: { role: 'Möchte sponsern', mark: 'V', name: 'Velogeschäft', meta: 'Zürcher Oberland', need: 'Material und Saisonbeitrag' },
  criteria: ['Region', 'Unterstützung', 'Branche', 'Budget'],
  result: 'Passt in 4 von 4 Kriterien',
};

export const proof = {
  items: [
    'Für Sport und Kultur in der Deutschschweiz',
    'Entstanden aus Gesprächen mit Sportlerinnen, Sportlern und einem Trainer',
    'Kein Abo, keine Grundgebühr',
  ],
  disciplinesLabel: 'Zum Beispiel für',
  disciplines: ['Mountainbike', 'Unihockey', 'Musikgesellschaft', 'Beachvolleyball', 'Theaterverein', 'Triathlon', 'Chor', 'Turnverein'],
};

// Audience section under the proof line. The photos are stock photos (Symbolbilder, see photoCredits): the people
// shown have nothing to do with Sponsuno. They illustrate the target groups only (no names, never shown as users);
// the note saying so sits in the landing page footer (footer.photoNote) and in the Impressum.
// Each tile links to where its side goes next ("two doors"): seekers to a guide, companies to /fuer-firmen/.
export type AudienceImage = 'athlete' | 'sportverein' | 'kulturverein' | 'firma';

export const audience = {
  title: 'Für wen Sponsuno gemacht ist',
  intro: 'Für alle, die in ihrer Region Sponsoren finden oder selbst sponsern möchten, im Sport wie in der Kultur.',
  items: [
    {
      image: 'athlete',
      label: 'Sportlerinnen und Sportler',
      text: 'Sie trainieren neben Ausbildung oder Beruf und suchen Unterstützung für Material, Startgelder oder Reisen.',
      alt: 'Eine Person läuft auf einem schmalen Bergweg durch grüne Hänge mit blühenden Alpenrosen.',
      link: { href: pageMeta('sponsoren-finden').path, label: 'Ratgeber: Sponsoren finden' },
    },
    {
      image: 'sportverein',
      label: 'Sportvereine',
      text: 'Ehrenamtliche Vorstände, die Partner für Trikots, Trainingslager oder Turniere suchen.',
      alt: 'Ein Ruderboot mit drei Personen von oben auf einem Fluss in der Abendsonne.',
      link: { href: pageMeta('sponsoren-finden').path, label: 'Ratgeber: Sponsoren finden' },
    },
    {
      image: 'kulturverein',
      label: 'Kulturvereine',
      text: 'Musikgesellschaften, Chöre und Theatervereine, die Instrumente, Kostüme oder Aufführungen finanzieren müssen.',
      alt: 'Musikanten in Tracht und Filzhut spielen Posaune, vorne ein Notenhalter.',
      link: { href: pageMeta('kultursponsoring').path, label: 'Ratgeber: Kultursponsoring' },
    },
    {
      image: 'firma',
      label: 'Firmen aus der Region',
      text: 'Gewerbe und KMU, die sich vor Ort engagieren möchten: mit Geld, Material oder Dienstleistungen.',
      alt: 'Zwei Handwerker in Arbeitsschürzen besprechen sich an der Werkbank einer Schreinerei.',
      link: firmsLink,
    },
  ] satisfies { image: AudienceImage; label: string; text: string; alt: string; link: FooterLink }[],
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

// Scroll story right under the hero (Story.tsx). It replaces the old Problem section: problem.title is the
// story's H2, problem.intro and the three points are its first steps, word for word. The solution steps reuse
// single sentences from howItWorks and aiManager, never the full step lists (those stay in #ablauf and /ki-manager/).
// Everything on the stage is a fictional example: generic names, real regions, no companies, no amounts.
export type StoryState = 'heute' | 'kontakte' | 'aufwand' | 'erwartungen' | 'linie' | 'sortiert' | 'match' | 'danach';

export const story = {
  // Labels before the step headings (short gold rule in front)
  labels: { heute: 'Heute', solution: 'Mit Sponsuno', planned: 'Mit Sponsuno' },
  // Which finding (problem.items, in order) belongs to which stage state
  findingStates: ['kontakte', 'aufwand', 'erwartungen'] as StoryState[],
  steps: [
    {
      state: 'linie' as StoryState,
      title: 'Beide Seiten an einem Ort',
      text: 'Sportlerinnen, Sportler und Vereine zeigen, was sie brauchen und was sie als Gegenleistung bieten. Firmen zeigen, wie sie unterstützen möchten: mit Geld, Material oder Dienstleistungen.',
    },
    {
      state: 'sortiert' as StoryState,
      title: 'Vorschläge statt kalter Anfragen',
      text: 'Sponsuno schlägt Firmen vor, die nach Region, Budget, Branche und Art der Unterstützung zu Ihnen passen. Firmen sehen umgekehrt Sportlerinnen, Sportler und Vereine aus ihrer Region.',
    },
    {
      state: 'match' as StoryState,
      title: 'Ein Match, bei dem beide wissen, warum',
      text: 'Bevor jemand schreibt, sehen beide Seiten, worin sie zusammenpassen. Gegenleistungen werden vor Beginn festgehalten.',
    },
  ],
  after: {
    state: 'danach' as StoryState,
    title: 'Und danach: der KI-Manager',
    text: 'Der KI-Manager bereitet Anfragen vor und erinnert an vereinbarte Gegenleistungen. Sie prüfen jeden Entwurf selbst.',
    link: 'Mehr zum KI-Manager',
    href: pageMeta('ki-manager').path,
  },
  // Text alternative for the decorative graphic (given once, in the hero)
  artAlt: 'Grafik: Anfragen, Dossiers und Absagen laufen auf eine goldene Linie zu. Rechts davon stehen geordnete Paare aus einer Sportlerin, einem Verein oder einem Kulturverein und einer Firma aus derselben Region, jeweils mit den vier Kriterien.',
  // One discreet label per picture (the hero start frame uses `solution`); the match card has its own (match.label)
  captions: {
    heute: 'Beispieldaten',
    solution: 'Beispieldaten',
    planned: 'Beispieldaten',
  },
  columns: { seeker: 'Sucht Unterstützung', sponsor: 'Möchte sponsern' },
  // The raw papers left of the line. Short labels only; they illustrate the three findings. The hero start
  // frame uses its own set (anfrage, liste, nachfassen, praesentation, fragen, rueckruf), the story stage the
  // rest, so the two pictures never show the same papers at once.
  papers: {
    anfrage: 'Anfrage: Trikot\u00ADsponsoring',
    dossier: 'Sponsoring\u00ADdossier.pdf',
    absage: 'Danke für Ihre Anfrage. Leider …',
    antwort: 'Noch keine Antwort',
    zustaendig: 'Wer ist dort zuständig?',
    liste: 'Firmenliste Region',
    training: 'Nach dem Training schreiben',
    gegenleistung: 'Gegenleistung: ?',
    gelohnt: 'Hat es sich gelohnt?',
    nachfassen: 'Re: Sponsoringanfrage',
    praesentation: 'Vereins\u00ADmappe.pdf',
    fragen: 'Wen könnten wir fragen?',
    rueckruf: 'Rückruf: offen',
    pdfTag: 'PDF',
  },
  // Fictional pairs (seeker + company from the same region). The first is the match card's example.
  pairs: [
    { seeker: { mark: 'L', name: 'Mountainbikerin' }, firm: { mark: 'V', name: 'Velogeschäft' }, region: 'Zürcher Oberland', score: 4 },
    { seeker: { mark: 'M', name: 'Musikgesellschaft' }, firm: { mark: 'S', name: 'Schreinerei' }, region: 'Emmental', score: 4 },
    { seeker: { mark: 'U', name: 'Unihockeyverein' }, firm: { mark: 'G', name: 'Garage' }, region: 'Seeland', score: 3 },
    { seeker: { mark: 'T', name: 'Theaterverein' }, firm: { mark: 'D', name: 'Druckerei' }, region: 'Zürcher Weinland', score: 4 },
    { seeker: { mark: 'C', name: 'Chor' }, firm: { mark: 'B', name: 'Bäckerei' }, region: 'Toggenburg', score: 4 },
  ],
  // Short score on the pair cards; the lead card uses match.result ("Passt in 4 von 4 Kriterien").
  // A 3 marks the last criterion (Budget) as partly matching, as in the demo.
  scoreShort: (n: number) => `${n} von 4`,
};

export type Track = 'seeker' | 'sponsor';

// Site link hrefs (footer, FAQ): '#id' = section of the landing page, 'path/' = page relative to the site root
// (resolved with the base path by siteHref() in lib/links.ts, so they work from every page).
export type FooterLink = { href: string; label: string };

/** The four guide pages (/sponsoren-finden/ …), linked from the FAQ intro and the footer column "Ratgeber". */
// Paths come from src/pages.ts, so a changed path updates canonicals, the sitemap and every internal link together.
export const guideLinks: FooterLink[] = [
  { href: pageMeta('sponsoren-finden').path, label: 'Sponsoren finden' },
  { href: pageMeta('sponsoring-anfrage').path, label: 'Sponsoring-Anfrage' },
  { href: pageMeta('sponsoring-dossier').path, label: 'Sponsoring-Dossier' },
  { href: pageMeta('kultursponsoring').path, label: 'Kultursponsoring' },
];

export const howItWorks = {
  title: 'So funktioniert Sponsuno',
  intro: 'Ein Ablauf für beide Seiten: vom ersten Profil bis zur Bilanz nach der Saison.',
  switchLabel: 'Ablauf anzeigen für',
  stepLabel: 'Schritt',
  tracks: {
    seeker: {
      label: 'Sportlerinnen, Sportler und Vereine',
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
  // Quiet links under the Firmen track, above its button: the demo cockpit and the page for companies
  sponsorLinks: [cockpitLink, firmsLink],
};

export const aiManager = {
  title: 'Ein KI-Manager für alles, was neben Training und Vereinsarbeit liegen bleibt.',
  intro: 'Nach dem Match fängt die Arbeit erst an. Der KI-Sponsoringmanager nimmt Ihnen Schreibarbeit ab und behält den Überblick. Entwürfe gehen erst raus, wenn Sie sie geprüft haben.',
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
  caption: 'Beispieldaten',
  demoLink: 'In der Produktvorschau ausprobieren',
};

export const support = {
  title: 'Nicht jede Unterstützung ist Geld.',
  intro: 'Material oder Ausrüstung helfen oft genauso viel. Sponsuno vermittelt Geld- und Sachleistungen, für Partnerschaften, die länger als eine Saison halten.',
  kinds: [
    { icon: 'money', title: 'Geld', text: 'Beiträge an Saison, Reisen, Startgelder oder Vereinsprojekte.' },
    { icon: 'gear', title: 'Material und Ausrüstung', text: 'Velos, Bälle, Trikots oder Instrumente. Denkbar ist auch gebrauchtes, gut erhaltenes Material.' },
    { icon: 'shared', title: 'Geteilte Technik', text: 'Eine Idee, die wir prüfen: Vereine nutzen zum Beispiel Veranstaltungstechnik gemeinsam.' },
  ] as const,
};

export const pricing = {
  title: 'Provision statt Abo',
  // Copy rule 4: only "commission instead of subscription" and "marketing services billed separately" are decided.
  // Everything else is announced before the launch, never guessed.
  intro: 'Kein Abo, keine Grundgebühr. Eine Provision fällt nur an, wenn eine Partnerschaft zustande kommt. Die genauen Konditionen geben wir vor dem Start bekannt.',
  rows: [
    { label: 'Abo oder Grundgebühr', value: 'Keine', state: 'decided' as const },
    { label: 'Vermittlung', value: 'Provision, wenn eine Partnerschaft zustande kommt', state: 'decided' as const },
    { label: 'Höhe der Provision und zahlende Seite', value: 'Geben wir vor dem Start bekannt', state: 'open' as const },
    { label: 'Fotos, Videos und Inhalte für Sponsoren', value: 'Separat buchbar', state: 'decided' as const },
  ],
  note: 'Kleine Sponsoringbeträge berücksichtigen wir dabei ausdrücklich.',
  // Small tag after an open row's value; empty = none (the ring marker already sets the row apart)
  openLabel: '',
};

/** One FAQ row. `link` (page path or '#id') is shown after the answer. FAQ answers also feed the FAQPage JSON-LD. */
export type FaqItem = { q: string; a: string; link?: FooterLink };

export const faq = {
  title: 'Häufige Fragen',
  introBefore: 'Ihre Frage fehlt? Tragen Sie sich auf der ',
  introLink: 'Warteliste',
  introAfter: ' ein, wir melden uns.',
  // Replaces the intro above while the waitlist stores nothing (no VITE_WAITLIST_ENDPOINT, the same switch as
  // waitlist.previewIntro): the address legal.contact.email is the link. Without a contact address no intro is shown.
  previewIntroBefore: 'Ihre Frage fehlt? Schreiben Sie uns an ',
  previewIntroAfter: '.',
  // Links from the landing page into the guides (shown under the intro)
  guidesLabel: 'Ratgeber:',
  guides: guideLinks,
  items: [
    {
      q: 'Bleibt nach der Provision genug übrig?',
      a: 'Ein Abo oder eine Grundgebühr gibt es nicht. Höhe der Provision und welche Seite sie trägt, geben wir vor dem Start bekannt. Kleine Sponsoringbeträge berücksichtigen wir dabei ausdrücklich.',
    },
    {
      q: 'Sind die Firmen wirklich interessiert?',
      a: 'Sponsoren melden sich selbst an und geben an, was sie suchen und was sie bieten. Die Vorschläge beruhen auf diesen Angaben, nicht auf gekauften Adresslisten.',
    },
    {
      q: 'Muss ich trotzdem alles selbst machen?',
      a: 'Das Gespräch mit dem Sponsor führen Sie selbst. Vorlagen und der KI-Manager übernehmen Schreibarbeit und Erinnerungen und behalten den Überblick.',
    },
    {
      q: 'Lohnt sich der Aufwand für die Gegenleistungen?',
      a: 'Gegenleistungen werden vor Beginn vereinbart. So sehen Sie früh, ob Aufwand und Unterstützung zusammenpassen, und können ablehnen, bevor Sie etwas zusagen.',
    },
    {
      q: 'Für wen ist Sponsuno?',
      a: 'Für Sportlerinnen und Sportler sowie Sport- und Kulturvereine, die Sponsoren finden möchten, und für Firmen, die in ihrer Region sponsern möchten. Sponsuno startet in der Deutschschweiz.',
    },
    {
      q: 'Wie finde ich heute schon Sponsoren?',
      a: 'Bis Sponsuno startet: über Ihr Umfeld, Firmen aus der Region und eine gut vorbereitete Anfrage. In unseren Gesprächen mit Sportlerinnen, Sportlern und einem Trainer haben mehrere Befragte ihre Sponsoren vor allem über den Bekanntenkreis gefunden. Wie Sie vorgehen können, beschreiben wir in einem Ratgeber.',
      link: { href: pageMeta('sponsoren-finden').path, label: 'Zum Ratgeber «Sponsoren finden»' },
    },
    {
      q: 'Wann geht es los?',
      a: 'Sponsuno startet bald in der Deutschschweiz. Den genauen Termin nennen wir, sobald er feststeht. Wer auf der Warteliste steht, erfährt ihn zuerst.',
    },
  ] satisfies FaqItem[],
};

// Founders section (id="team"), on /ueber-uns/. Team decision (2026-11-03): full names allowed here.
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
  intro: 'Wir sind ein Team aus vier Personen und bauen Sponsuno aus Gesprächen mit Sportlerinnen, Sportlern und einem Trainer auf. Die Aufgaben im Team sind vorläufig verteilt.',
  members: teamMembers,
};

// "Stand des Projekts" block at the end of the team section. Sources and rules: AGENTS.md -> Project status.
// Every step must stay true and dated: move a step to done only once it has happened, and update this list
// when the waitlist goes live. Never "gefördert durch" or "Partner": the programme is a course, not an endorsement.
export type StatusStep = {
  /** Date or position in the sequence, e.g. "Herbst 2026" or "Als Nächstes" */
  when: string;
  text: string;
  done: boolean;
};

export const projectStatus = {
  title: 'Stand des Projekts',
  intro: [
    'Sponsuno ist ein Projekt im Programm ',
    { href: 'https://youngpreneurs.org/zuerich/', label: 'Youngpreneurs Zürich' },
    ' 2026/27.',
  ] satisfies LegalText,
  doneLabel: 'Erledigt',
  plannedLabel: 'Geplant',
  steps: [
    { when: 'Herbst 2026', text: 'Gespräche mit vier Sportlerinnen und Sportlern und einem Tennistrainer.', done: true },
    { when: 'November 2026', text: 'Website und klickbare Produktvorschau mit Beispieldaten sind online.', done: true },
    { when: 'Als Nächstes', text: 'Gespräche mit Firmen und Kulturvereinen in der Region Winterthur.', done: false },
    { when: 'Später', text: 'Anmeldungen zur Warteliste direkt speichern, dann der Start der Plattform. Den Termin nennen wir, sobald er feststeht.', done: false },
  ] satisfies StatusStep[],
};

export const waitlist = {
  title: 'Von Anfang an dabei sein.',
  intro: 'Tragen Sie sich ein. Wir melden uns, sobald Sponsuno startet.',
  // Replaces intro while the form stores nothing (no VITE_WAITLIST_ENDPOINT); without a contact address no intro is shown
  previewIntro: 'Schreiben Sie uns eine kurze E-Mail. Wir melden uns, sobald Sponsuno startet.',
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
  success: 'Danke. Sie stehen auf der Warteliste. Wir melden uns, sobald Sponsuno startet.',
  // Shown while no VITE_WAITLIST_ENDPOINT is configured: nothing is stored, so visitors are offered an
  // e-mail to legal.contact.email instead (subject and body prefilled with the chosen role).
  previewNote: 'Die Anmeldung läuft vorerst per E-Mail, das Formular speichert nichts.',
  previewMailLead: 'Schreiben Sie uns an',
  previewSuccess: 'Fast geschafft: Die Anmeldung läuft vorerst per E-Mail. Ihre Adresse haben wir nicht gespeichert.',
  previewMailIntro: 'Senden Sie uns die vorbereitete E-Mail, dann melden wir uns zum Start.',
  previewMailButton: 'E-Mail schreiben',
  mailSubject: (roleLabel: string) => `Warteliste: ${roleLabel}`,
  // Optional lines the sender fills in or deletes in their own e-mail (at most three; no form fields, nothing is
  // sent by the site). The Datenschutzerklärung ("Warteliste") describes them; keep both in step.
  mailBody: (role: Role, roleLabel: string) => [
    'Guten Tag',
    '',
    'Bitte informieren Sie mich, sobald Sponsuno startet.',
    `Ich bin: ${roleLabel}`,
    '',
    'Freiwillige Angaben:',
    ...(role === 'sponsor'
      ? ['Firma und Branche:', 'Region:']
      : ['Region oder Gemeinde:', 'Sportart oder Sparte:']),
    'Für ein kurzes Gespräch offen: ja / nein',
    '',
    'Freundliche Grüsse',
  ].join('\r\n'),
  // After a (preview or real) sign-up: one fitting next step per role (waitlistNext, after the guides)
  nextLabel: 'Bis zum Start:',
};

export const footer = {
  sub: 'Sponsoren finden für Sport und Kultur in der Deutschschweiz.',
  columns: [
    {
      title: 'Plattform',
      links: [
        { href: '#ablauf', label: 'So funktioniert es' },
        { href: pageMeta('fuer-firmen').path, label: 'Für Firmen' },
        { href: pageMeta('ki-manager').path, label: 'KI-Manager' },
        { href: pageMeta('kosten').path, label: 'Kosten' },
        { href: 'demo/', label: 'Produktvorschau' },
      ],
    },
    {
      title: 'Mehr',
      links: [
        { href: pageMeta('fragen').path, label: 'Fragen' },
        { href: pageMeta('ueber-uns').path, label: 'Über uns' },
        { href: '#warteliste', label: 'Warteliste' },
        { href: '#top', label: 'Nach oben' },
      ],
    },
    {
      title: 'Ratgeber',
      links: guideLinks,
    },
    {
      title: 'Rechtliches',
      links: [
        { href: 'impressum/', label: 'Impressum' },
        { href: 'datenschutz/', label: 'Datenschutz' },
      ],
    },
  ] satisfies { title: string; links: FooterLink[] }[],
  // Last column, built in Footer.tsx from legal.contact (defined further down): the e-mail address as a visible
  // mailto link and the town of the postal address. Not shown while both are missing.
  contactTitle: 'Kontakt',
  copyright: '© 2026 Team Sponsuno',
  // Landing page only (the audience photos): the stock photos are named as such once, outside the content flow.
  photoNote: { before: 'Fotos: Symbolbilder, ', link: 'Bildnachweise', href: 'impressum/#urheberrecht' },
};

export const stickyCta = {
  text: 'Von Anfang an dabei sein.',
  button: 'Auf die Warteliste',
};

export const menu = {
  open: 'Menü öffnen',
  close: 'Menü schliessen',
  label: 'Menü',
};

// ---------- Topic pages reached from the header: /fuer-firmen/, /ki-manager/, /kosten/, /fragen/, /ueber-uns/ ----------
// Rendered by src/components/InfoPage.tsx, prerendered, shipped without JavaScript. Title and description in src/pages.ts.
// KI-Manager, Kosten (with "Nicht nur Geld"), Fragen and Über uns show the former landing page sections
// (aiManager, pricing, support, faq, team, projectStatus); Für Firmen is built from the sponsor copy below.
export type InfoPageId = 'fuer-firmen' | 'ki-manager' | 'kosten' | 'fragen' | 'ueber-uns';

/** Closing block of every topic page: back to the waitlist on the landing page */
export const infoPage = {
  endTitle: waitlist.title,
  // The topic pages' launch signal (AGENTS.md, copy rules: one per page)
  endText: 'Sponsuno startet bald in der Deutschschweiz. Tragen Sie sich ein, dann melden wir uns zum Start.',
  // Replaces endText while the waitlist stores nothing (no VITE_WAITLIST_ENDPOINT, the same switch as
  // waitlist.previewIntro and the FAQ intro); without a contact address the line is left out.
  previewEndText: 'Sponsuno startet bald in der Deutschschweiz. Schreiben Sie uns, dann melden wir uns zum Start.',
  endButton: cta.waitlist,
  demoLabel: demo.link,
  demoHref: demo.href,
  /** Extra line in the closing block, per page */
  more: {
    kosten: [
      'Was andere zu Provision und Kosten fragen, finden Sie unter ',
      { href: pageMeta('fragen').path, label: 'Fragen und Antworten' },
      '.',
    ],
  } as Partial<Record<InfoPageId, LegalText>>,
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
    subject: 'Traillauf auf einem Bergweg, Abschnitt «Für wen Sponsuno gemacht ist», Symbolbild',
    photographer: 'Alin Serban',
    source: 'Pexels',
    sourceUrl: 'https://www.pexels.com/photo/trail-runner-in-green-mountain-landscape-30932860/',
    licence: 'Pexels-Lizenz',
    licenceUrl: 'https://www.pexels.com/de-de/lizenz/',
  },
  {
    subject: 'Ruderteam auf dem Fluss, Abschnitt «Für wen Sponsuno gemacht ist», Symbolbild',
    photographer: 'Adrian Jozefowicz',
    source: 'Pexels',
    sourceUrl: 'https://www.pexels.com/photo/three-people-on-brown-canoe-sailing-on-calm-water-1046231/',
    licence: 'Pexels-Lizenz',
    licenceUrl: 'https://www.pexels.com/de-de/lizenz/',
  },
  {
    subject: 'Blasmusik in Tracht, Abschnitt «Für wen Sponsuno gemacht ist», Symbolbild',
    photographer: 'Bastian Riccardi',
    source: 'Pexels',
    sourceUrl: 'https://www.pexels.com/photo/traditional-bavarian-musicians-playing-trombones-34013753/',
    licence: 'Pexels-Lizenz',
    licenceUrl: 'https://www.pexels.com/de-de/lizenz/',
  },
  {
    subject: 'Schreinerei, Abschnitt «Für wen Sponsuno gemacht ist», Symbolbild',
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
  homeLabel: 'Sponsuno, zur Startseite',
  tocLabel: 'Auf dieser Seite',
  pending: 'fehlt noch, wird in Kürze ergänzt.',
  project: 'Sponsuno',
  projectNote: 'Projekt in Entwicklung',
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
    aiImages: ['Porträt der Mountainbikerin in der Produktvorschau (Profil und Sponsor-Cockpit): KI-generiert, Symbolbild ohne reale Person.'],
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
          { type: 'p', text: 'Diese Website gehört zum Projekt Sponsuno. Sponsuno ist ein Projekt in Entwicklung und wird von einem Team aus vier Personen getragen.' },
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
          // Legally relevant (no misleading claims): the site describes the product before its launch. Keep this
          // section factual even though the rest of the site uses product voice (AGENTS.md, copy rules).
          { type: 'p', text: 'Sponsuno ist noch nicht gestartet. Vermittlung, KI-Sponsoringmanager und Zahlungen sind bis zum Start nicht verfügbar. Angaben zu Funktionen, Kosten und Abläufen geben den aktuellen Planungsstand wieder und können sich ändern.' },
          { type: 'p', text: ['Die ', { label: 'Produktvorschau', href: 'demo/' }, ' ist ein klickbarer Prototyp mit Beispieldaten. Personen, Firmen, Vereine und Beträge darin sind erfunden. Ähnlichkeiten mit realen Personen oder Firmen sind nicht beabsichtigt.'] },
          { type: 'p', text: 'Die Fotos von Personen auf der Startseite sind Symbolbilder. Die abgebildeten Personen haben keinen Bezug zu Sponsuno.' },
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
              'Die Produktvorschau speichert Ihre Änderungen nur in Ihrem Browser. Nichts davon verlässt Ihr Gerät.',
              'Die Warteliste ist noch nicht freigeschaltet. Das Formular übermittelt nichts.',
              'Wenn Sie uns eine E-Mail schreiben, liegt sie bei unserem E-Mail-Anbieter Infomaniak in der Schweiz.',
            ],
          },
        ],
      },
      {
        id: 'verantwortlich',
        title: 'Verantwortlich',
        blocks: [
          { type: 'p', text: 'Verantwortlich für die Bearbeitung von Personendaten auf dieser Website ist das Team des Projekts Sponsuno:' },
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
        title: 'Produktvorschau',
        blocks: [
          { type: 'p', text: ['Die ', { label: 'Produktvorschau', href: 'demo/' }, ' ist ein Prototyp mit Beispieldaten. Damit Ihre Änderungen (zum Beispiel ein bearbeitetes Profil oder ein Entwurf) beim nächsten Besuch noch da sind, speichert die Vorschau sie im lokalen Speicher Ihres Browsers (localStorage, Schlüssel «sponsuno-demo-v2»). Diese Daten bleiben auf Ihrem Gerät und werden weder an uns noch an Dritte übermittelt.'] },
          { type: 'p', text: 'Löschen können Sie die Daten jederzeit, indem Sie in Ihrem Browser die Websitedaten dieser Seite löschen. Die Vorschau zeigt danach wieder den Ausgangszustand.' },
        ],
      },
      {
        id: 'warteliste',
        title: 'Warteliste',
        blocks: [
          { type: 'p', text: 'Die Warteliste ist noch nicht freigeschaltet. Das Formular speichert und übermittelt nichts: Ihre E-Mail-Adresse und Ihre Auswahl verlassen Ihren Browser nicht.' },
          { type: 'p', text: 'Stattdessen bietet das Formular einen Link an, mit dem Sie uns eine E-Mail schreiben können. Der Link öffnet Ihr E-Mail-Programm mit vorausgefülltem Betreff und Text: darin Ihre Auswahl (zum Beispiel «Sportverein») und höchstens drei freiwillige Zeilen, etwa zu Region und Sportart oder zu Ihrer Firma und ob Sie für ein kurzes Gespräch offen sind. Diese Zeilen sind nur Text in Ihrer eigenen E-Mail: Sie können sie ausfüllen, ändern oder löschen. Gesendet wird erst, wenn Sie die E-Mail selbst abschicken; dafür gilt der Abschnitt «Kontakt per E-Mail».' },
          { type: 'p', text: 'Bevor wir die Warteliste freischalten, ergänzen wir diese Datenschutzerklärung: welche Daten wir dann speichern, bei welchem Anbieter, wie lange und wie Sie sich wieder austragen können.' },
        ],
      },
      {
        id: 'e-mail',
        title: 'Kontakt per E-Mail',
        blocks: [
          { type: 'p', text: 'Wenn Sie uns eine E-Mail schreiben, bearbeiten wir Ihre E-Mail-Adresse, Ihren Namen, falls Sie ihn angeben, und den Inhalt Ihrer Nachricht. Wir verwenden diese Angaben nur, um Ihre Nachricht zu beantworten, und, wenn Sie uns darum bitten, um Sie über den Start von Sponsuno zu informieren.' },
          { type: 'p', text: 'Unser E-Mail-Postfach wird von Infomaniak Network SA, Genf, Schweiz, betrieben. Infomaniak bearbeitet die Nachrichten dabei in unserem Auftrag.' },
          { type: 'p', text: 'Wir bewahren Ihre Nachricht so lange auf, wie wir sie für Ihr Anliegen brauchen. Möchten Sie keine Nachricht mehr von uns erhalten, genügt eine kurze E-Mail; dann löschen wir Ihre Adresse.' },
          { type: 'p', text: 'Rechtsgrundlage für Besucherinnen und Besucher aus der EU und dem EWR: unser berechtigtes Interesse, Ihre Nachricht zu beantworten (Art. 6 Abs. 1 lit. f DSGVO), und, wenn Sie über den Start informiert werden möchten, Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit widerrufen können.' },
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

// ---------- Guide pages (Ratgeber): /sponsoren-finden/, /sponsoring-anfrage/, /sponsoring-dossier/, /kultursponsoring/ ----------
// Rendered by src/components/GuidePage.tsx, prerendered at build time, shipped without JavaScript.
// Title and meta description of each page live in src/pages.ts. Rules on top of AGENTS.md (copy rules 1–9):
// - General, practical advice written by the team. No numbers, amounts, success rates, CHF figures, named
//   companies, their sponsoring programmes or deadlines, quotes, or claims about competitors.
// - Interview findings only as "mehrere Befragte", and only the three points already on the landing page
//   (sponsors came mostly from people they knew; the work runs alongside training and volunteering; what each
//   side expects is often not agreed). The interviews were with athletes and a trainer: never attribute
//   findings to culture clubs or companies.
// - Tax: one neutral sentence and a link to the ESTV, no advice.
// - Every guide ends with "So hilft Ihnen Sponsuno": the guide's one launch signal ("Sponsuno startet bald"), then product
//   voice, and a `cta` block (AGENTS.md, copy rules).

export type GuideId = 'sponsoren-finden' | 'sponsoring-anfrage' | 'sponsoring-dossier' | 'kultursponsoring';

export type GuideBlock =
  | { type: 'p'; text: LegalText }
  | { type: 'list'; items: LegalText[] }
  /** Numbered list for steps that build on each other */
  | { type: 'steps'; items: LegalText[] }
  | { type: 'h3'; text: string }
  /**
   * A letter or outline to copy and adapt: shown as a bordered, selectable block (no copy button), with a link to
   * the same text as a Word file (built at build time by src/lib/templates.ts, served from /vorlagen/<file>).
   * Placeholders in [eckigen Klammern].
   */
  | { type: 'template'; label: string; text: string; file: `${string}-vorlage.docx` }
  /** Links to the waitlist and the demo (end of every guide) */
  | { type: 'cta' };

export type GuideSection = { id: string; title: string; blocks: GuideBlock[] };

export type GuideContent = {
  /** H1 (the <title> is in src/pages.ts) */
  title: string;
  intro: LegalText;
  sections: GuideSection[];
  /** Guides shown under "Weiterlesen" */
  related: GuideId[];
  /** Role preselected by the waitlist link of the cta block (default: the form's default role) */
  waitlistRole?: Role;
};

/** Labels shared by all guide pages */
export const guidePage = {
  byline: 'Team Sponsuno',
  updated: 'Stand: November 2026',
  relatedTitle: 'Weiterlesen',
  ctaWaitlist: 'Auf die Warteliste',
  ctaDemo: demo.link,
  ctaDemoHref: demo.href,
  /** Download link under each template block */
  templateDownload: 'Als Word-Datei herunterladen',
  templateFileInfo: (kb: number) => `DOCX, ${kb} KB`,
  /** Footer line of the Word files */
  templateFooter: (guideTitle: string) => `Vorlage aus dem Ratgeber «${guideTitle}» auf sponsuno.ch. Vor dem Versand löschen.`,
};

const estvLink: LegalLink = { label: 'Eidgenössischen Steuerverwaltung ESTV', href: 'https://www.estv.admin.ch/' };
const taxNote: LegalText = [
  'Sponsoring und Spenden können steuerlich unterschiedlich behandelt werden, etwa bei der Mehrwertsteuer; allgemeine Informationen finden Sie bei der ',
  estvLink,
  '.',
];
const ablaufLink: LegalLink = { label: 'So funktioniert es', href: '#ablauf' };
const link = (id: GuideId, label: string): LegalLink => ({ label, href: pageMeta(id).path });

export const guides: Record<GuideId, GuideContent> = {
  'sponsoren-finden': {
    title: 'Sponsoren finden in der Region',
    intro: 'Ob Einzelsportlerin, Turnverein oder Musikgesellschaft: Passende Sponsoren findet man oft eher im eigenen Umfeld und in der Region als über Serienmails. Dieser Ratgeber zeigt Schritt für Schritt, wie Sie Firmen finden, ansprechen und als Partner behalten.',
    sections: [
      {
        id: 'angebot',
        title: 'Was Sie einem Sponsor bieten können',
        blocks: [
          { type: 'p', text: 'Sponsoring ist ein Austausch: Eine Firma unterstützt Sie, und Sie bieten ihr dafür etwas, das für sie einen Wert hat. Bevor Sie die erste Firma ansprechen, lohnt sich deshalb eine ehrliche Liste Ihrer möglichen Gegenleistungen.' },
          {
            type: 'list',
            items: [
              'Sichtbarkeit vor Ort: Logo auf Trikot, Startnummer, Velo oder Vereinsbus, Banden und Banner, eine Anzeige im Match- oder Konzertprogramm',
              'Präsenz an Anlässen: Erwähnung bei Heimspielen, Turnieren, Konzerten oder Aufführungen, ein Stand oder Prospekte vor Ort',
              'Online: Logo und Link auf Ihrer Website, Beiträge auf Social Media oder im Newsletter',
              'Persönliche Einsätze: ein Auftritt, ein Referat oder ein Training an einem Firmenanlass, gemeinsame Aktionen mit den Mitarbeitenden',
              'Zugang: Tickets oder reservierte Plätze für Kundinnen, Kunden und Mitarbeitende',
            ],
          },
          { type: 'p', text: 'Versprechen Sie nur, was Sie zuverlässig liefern können. Eine kleine Gegenleistung, die eingehalten wird, wirkt besser als ein grosses Paket, das im Saisonstress untergeht.' },
        ],
      },
      {
        id: 'wo-suchen',
        title: 'Wo Sie suchen',
        blocks: [
          { type: 'p', text: 'Die naheliegendsten Sponsoren sind oft Firmen, zu denen Sie oder Ihre Mitglieder schon eine Verbindung haben. Auch in unseren Gesprächen mit Sportlerinnen, Sportlern und einem Trainer haben mehrere Befragte ihre Sponsoren vor allem über den Bekanntenkreis gefunden. Beginnen Sie deshalb im eigenen Umfeld und gehen Sie dann Schritt für Schritt weiter:' },
          {
            type: 'list',
            items: [
              'Ihr Umfeld: Familie, Freundeskreis, Arbeitgeber oder Ausbildungsbetrieb',
              'Mitglieder, Eltern und Ehemalige: Wo arbeiten sie, wer führt einen eigenen Betrieb?',
              'Gewerbe und KMU vor Ort: Garage, Bäckerei, Schreinerei, Elektrofirma, Treuhandbüro oder Restaurant',
              'Regionale Banken und Versicherungsagenturen: Schauen Sie auf deren Website nach, ob es Kriterien oder ein Formular für Sponsoringanfragen gibt.',
              'Ihre eigenen Lieferanten: das Sportgeschäft, der Musikalienhandel oder die Druckerei, bei denen Sie ohnehin einkaufen',
              'Gönnerinnen und Gönner: Privatpersonen und Firmen, die mit einem Beitrag unterstützen, ohne eine grosse Gegenleistung zu erwarten',
            ],
          },
          { type: 'p', text: 'Führen Sie von Anfang an eine einfache Liste mit Firma, Ansprechperson, Kontaktweg, Datum der Anfrage und Antwort. So behalten Sie den Überblick, fragen niemanden doppelt an und wissen im nächsten Jahr, wo Sie schon angeklopft haben.' },
        ],
      },
      {
        id: 'auswahl',
        title: 'Die passende Firma auswählen',
        blocks: [
          { type: 'p', text: 'Nicht jede Firma passt zu jedem Verein oder jeder Sportlerin. Prüfen Sie vor der Anfrage vier Punkte:' },
          {
            type: 'list',
            items: [
              'Region: Firmen engagieren sich gern dort, wo ihre Kundschaft und ihre Mitarbeitenden leben. Je näher, desto einfacher lässt sich der Bezug erklären.',
              'Branche: Gibt es einen natürlichen Zusammenhang? Ein Velogeschäft und ein Bikerennen, ein Musikhaus und eine Brassband, eine Bäckerei und das Dorffest.',
              'Grösse: Ein kleiner Betrieb gibt eher Material oder einen kleineren Beitrag. Eine grössere Firma hat vielleicht ein festes Budget und einen eigenen Ablauf für Anfragen.',
              'Art der Unterstützung: Geld ist nicht alles. Material, Ausrüstung, Druckkosten, Transporte oder Dienstleistungen helfen oft genauso viel.',
            ],
          },
          { type: 'p', text: 'Fragen Sie lieber wenige, gut ausgewählte Firmen persönlich an als viele mit derselben Mail. Wer sieht, dass Sie sich mit seiner Firma beschäftigt haben, liest weiter.' },
        ],
      },
      {
        id: 'anfrage-dossier',
        title: 'Anfrage und Dossier',
        blocks: [
          { type: 'p', text: ['Die erste Anfrage ist kurz: wer Sie sind, warum gerade diese Firma, was Sie brauchen, was Sie bieten und wie es weitergeht. Wie das konkret aussieht, zeigt der Ratgeber ', link('sponsoring-anfrage', 'Sponsoring-Anfrage schreiben'), ' mit einem Musterbrief zum Anpassen.'] },
          { type: 'p', text: ['Möchte die Firma mehr wissen oder verlangt ein Formular Unterlagen, brauchen Sie ein Dossier. Was hineingehört und wie Sie Pakete schnüren, steht im Ratgeber ', link('sponsoring-dossier', 'Sponsoring-Dossier erstellen'), '.'] },
          { type: 'p', text: ['Chöre, Musikgesellschaften und Theatervereine haben zusätzliche Wege, etwa Stiftungen und die öffentliche Kulturförderung. Mehr dazu im Ratgeber ', link('kultursponsoring', 'Kultursponsoring'), '.'] },
          { type: 'p', text: 'Am meisten bewirkt ein persönlicher Kontakt: ein Anruf, ein Besuch im Laden oder eine Einführung durch jemanden, der die Firma kennt. Die schriftliche Anfrage folgt dann als Zusammenfassung.' },
        ],
      },
      {
        id: 'nachfassen',
        title: 'Nachfassen und mit Absagen umgehen',
        blocks: [
          { type: 'p', text: 'Keine Antwort heisst nicht automatisch Nein. Anfragen gehen unter, Zuständige sind in den Ferien oder warten auf einen Entscheid. Melden Sie sich nach ein bis zwei Wochen einmal freundlich, am besten telefonisch.' },
          {
            type: 'list',
            items: [
              'Bedanken Sie sich auch für eine Absage. Wer freundlich bleibt, kann im nächsten Jahr wieder anfragen.',
              'Fragen Sie nach dem Grund: Budget schon vergeben, falscher Zeitpunkt, passt nicht zur Firma? Das hilft bei der nächsten Anfrage.',
              'Fragen Sie, wann die Firma ihr Budget für das nächste Jahr plant, und melden Sie sich rechtzeitig davor.',
            ],
          },
          { type: 'p', text: 'Nehmen Sie Absagen nicht persönlich. Oft haben sie mit dem Budget oder dem Zeitpunkt zu tun, nicht mit Ihnen oder Ihrem Verein.' },
        ],
      },
      {
        id: 'pflegen',
        title: 'Die Partnerschaft pflegen',
        blocks: [
          { type: 'p', text: 'Einen Sponsor zu halten ist oft einfacher, als einen neuen zu finden. Mehrere Befragte haben uns erzählt, dass oft nicht klar vereinbart ist, was beide Seiten erwarten. Das lässt sich vermeiden:' },
          {
            type: 'list',
            items: [
              'Halten Sie schriftlich fest, was Sie vereinbart haben: Unterstützung, Gegenleistungen, Dauer und Ansprechpersonen. Eine einfache Vereinbarung genügt.',
              'Liefern Sie die Gegenleistungen und zeigen Sie es: ein Foto vom neuen Trikot, ein Link zum Beitrag, ein Programmheft mit dem Logo.',
              'Laden Sie Ihre Sponsoren ein, an ein Spiel, ein Konzert oder den Saisonabschluss.',
              'Ziehen Sie nach der Saison gemeinsam Bilanz: Was hat funktioniert, was ändern Sie? Danach ist ein guter Moment, über eine Verlängerung zu sprechen.',
            ],
          },
        ],
      },
      {
        id: 'sponsoring-oder-spende',
        title: 'Sponsoring oder Spende?',
        blocks: [
          { type: 'p', text: 'Bei einer Spende erwartet die Firma keine Gegenleistung. Beim Sponsoring erhält sie eine, zum Beispiel Werbung oder einen Auftritt an ihrem Anlass.' },
          { type: 'p', text: taxNote },
        ],
      },
      {
        id: 'sponsuno',
        title: 'So hilft Ihnen Sponsuno',
        blocks: [
          { type: 'p', text: 'Sponsuno startet bald in der Deutschschweiz. Die Plattform zeigt Sportlerinnen, Sportlern sowie Sport- und Kulturvereinen Firmen aus ihrer Region, die nach Region, Branche, Budget und Art der Unterstützung zu ihnen passen. Der KI-Sponsoringmanager hilft beim Schreiben von Anfragen und beim Betreuen der Partnerschaft.' },
          { type: 'p', text: ['Wie das abläuft, lesen Sie unter ', ablaufLink, '. Wer auf der Warteliste steht, erfährt zuerst vom Start.'] },
          { type: 'cta' },
        ],
      },
    ],
    related: ['sponsoring-anfrage', 'sponsoring-dossier', 'kultursponsoring'],
  },

  'sponsoring-anfrage': {
    title: 'Sponsoring-Anfrage schreiben',
    intro: 'Eine gute Sponsoring-Anfrage ist kurz, persönlich und zeigt der Firma, was sie davon hat. Hier finden Sie den Aufbau, einen Musterbrief zum Anpassen und die häufigsten Fehler, für Sportlerinnen, Sportler, Sport- und Kulturvereine.',
    sections: [
      {
        id: 'vorbereitung',
        title: 'Vor dem Schreiben',
        blocks: [
          { type: 'p', text: 'Klären Sie vor dem ersten Satz drei Dinge:' },
          {
            type: 'list',
            items: [
              'Wer ist zuständig? In kleinen Betrieben entscheidet meist die Inhaberin oder der Inhaber, in grösseren Firmen oft die Marketing- oder Kommunikationsabteilung. Ein kurzer Anruf beim Empfang klärt das.',
              'Gibt es einen festen Ablauf? Grössere Firmen nehmen Anfragen oft nur über ein Onlineformular an, teils mit Eingabefristen. Suchen Sie auf der Website der Firma nach einer Seite zu Sponsoring oder Engagement.',
              'Was genau brauchen Sie? Geld, Material oder eine Dienstleistung, wofür und ab wann. Je konkreter Ihr Anliegen, desto leichter fällt der Firma die Entscheidung.',
            ],
          },
          { type: 'p', text: 'Gibt es ein Formular, nutzen Sie es. Eine Mail am Formular vorbei landet leicht im falschen Postfach.' },
        ],
      },
      {
        id: 'aufbau',
        title: 'So ist eine gute Anfrage aufgebaut',
        blocks: [
          {
            type: 'steps',
            items: [
              'Betreff: kurz und konkret, zum Beispiel «Sponsoringanfrage: neue Trikots für die Juniorinnen des FC [Ort]».',
              'Wer Sie sind: wenige Sätze zu Ihnen oder Ihrem Verein, mit Sportart oder Sparte und Ort.',
              'Warum diese Firma: der Bezug zur Region, zur Branche oder eine persönliche Verbindung. Dieser Teil zeigt, dass es keine Serienmail ist.',
              'Was Sie brauchen: das konkrete Vorhaben, etwa neue Trikots, Startgelder für die Saison oder Instrumente für die Jugendmusik.',
              'Was Sie bieten: die Gegenleistungen, die zu dieser Firma passen.',
              'Nächster Schritt: ein Vorschlag für ein kurzes Gespräch, und wann Sie sich wieder melden.',
            ],
          },
          { type: 'p', text: 'Die Anfrage selbst passt auf eine Bildschirmseite. Details gehören in ein Dossier im Anhang oder ins Gespräch.' },
        ],
      },
      {
        id: 'musterbrief',
        title: 'Musterbrief',
        blocks: [
          { type: 'p', text: 'Passen Sie den Brief an Ihre Situation an und ersetzen Sie alles in [eckigen Klammern] durch Ihre Angaben. Schreiben Sie ihn nicht einfach ab: Der Absatz, warum Sie gerade diese Firma anfragen, entsteht für jede Firma neu.' },
          {
            type: 'template',
            label: 'Musterbrief für Sportlerinnen, Sportler und Vereine',
            file: 'sponsoring-anfrage-vorlage.docx',
            text: [
              'Betreff: Sponsoringanfrage: [Vorhaben] von [Name oder Verein]',
              '',
              'Sehr geehrte Frau [Name] / Sehr geehrter Herr [Name]',
              '',
              'Mein Name ist [Vorname Name]. Ich [bin Sportlerin oder Sportler in … / bin im Vorstand des Vereins …] in [Ort]. [Ein, zwei Sätze zu Ihnen oder Ihrem Verein: was Sie machen und was Sie vorhaben.]',
              '',
              'Ich schreibe Ihnen, weil [Bezug zur Firma: Sie sind in unserer Gemeinde verwurzelt / wir kaufen seit Jahren bei Ihnen ein / Ihre Produkte passen zu unserem Sport].',
              '',
              'Für [Saison oder Projekt] [suche ich / suchen wir] [Unterstützung: einen Beitrag an … / Material wie … / eine Dienstleistung wie …].',
              '',
              'Als Gegenleistung [biete ich / bieten wir] Ihnen zum Beispiel:',
              '– [Gegenleistung, etwa Ihr Logo auf …]',
              '– [Gegenleistung, etwa eine Erwähnung an …]',
              '– [Gegenleistung, etwa ein Auftritt an Ihrem Firmenanlass]',
              '',
              'Gerne stelle ich Ihnen das Vorhaben in einem kurzen Gespräch vor. Falls ich bis dahin nichts von Ihnen höre, melde ich mich in der Woche vom [Datum] telefonisch bei Ihnen.',
              '',
              'Freundliche Grüsse',
              '[Vorname Name]',
              '[Funktion, Verein]',
              '[Telefon] · [E-Mail]',
            ].join('\n'),
          },
          { type: 'p', text: ['Für Kulturvereine: Ersetzen Sie Sportart und Saison durch Ensemble und Projekt, etwa ein Jahreskonzert, eine Theaterproduktion oder neue Instrumente. Passende Gegenleistungen sind dann zum Beispiel eine Anzeige im Programmheft, ein Dank von der Bühne oder ein Ständchen am Firmenanlass. Mehr dazu im Ratgeber ', link('kultursponsoring', 'Kultursponsoring'), '.'] },
        ],
      },
      {
        id: 'fehler',
        title: 'Häufige Fehler',
        blocks: [
          {
            type: 'list',
            items: [
              'Serienmail an viele Firmen gleichzeitig, womöglich mit allen Adressen sichtbar',
              'Nur bitten, nichts anbieten: Die Firma sieht nicht, was sie davon hat.',
              'Zu lang: Lebenslauf, Vereinsgeschichte und Saisonplan gehören in den Anhang, nicht in die Mail.',
              'Keine Ansprechperson: Eine Anfrage an «Sehr geehrte Damen und Herren» wirkt wie eine Serienmail.',
              'Unklares Vorhaben: Die Firma muss raten, wofür ihre Unterstützung gedacht ist.',
              'Kein nächster Schritt: Niemand weiss, wer sich wann meldet.',
              'Tippfehler oder ein falsch geschriebener Firmenname: Lassen Sie die Anfrage vor dem Senden gegenlesen.',
            ],
          },
        ],
      },
      {
        id: 'nachfassen',
        title: 'Nachfassen',
        blocks: [
          { type: 'p', text: 'Melden Sie sich, wie im Brief angekündigt. Ein kurzer Anruf ist persönlicher als eine zweite Mail und klärt meist schneller, ob die Anfrage angekommen ist und wer entscheidet.' },
          {
            type: 'list',
            items: [
              'Fragen Sie, ob die Anfrage angekommen ist und ob Unterlagen fehlen.',
              'Bieten Sie ein Treffen an, oder laden Sie an ein Training, eine Probe oder einen Anlass ein.',
              'Bei einer Absage: bedanken, nach dem Grund fragen und im Kontakt bleiben.',
            ],
          },
          { type: 'p', text: ['Wie Sie eine Partnerschaft danach pflegen, beschreibt der Ratgeber ', link('sponsoren-finden', 'Sponsoren finden'), '. Wenn die Firma Unterlagen möchte, hilft der Ratgeber ', link('sponsoring-dossier', 'Sponsoring-Dossier erstellen'), '.'] },
        ],
      },
      {
        id: 'sponsuno',
        title: 'So hilft Ihnen Sponsuno',
        blocks: [
          { type: 'p', text: 'Sponsuno startet bald in der Deutschschweiz. Zur Plattform gehört ein KI-Sponsoringmanager: Er schreibt aus Ihrem Profil einen Entwurf für die Anfrage, der auf die jeweilige Firma eingeht. Sie prüfen den Entwurf, ändern ihn und entscheiden selbst, was gesendet wird. Wie das aussieht, zeigt die Produktvorschau.' },
          { type: 'p', text: ['Den ganzen Ablauf finden Sie unter ', ablaufLink, '. Wer auf der Warteliste steht, erfährt zuerst vom Start.'] },
          { type: 'cta' },
        ],
      },
    ],
    related: ['sponsoren-finden', 'sponsoring-dossier', 'kultursponsoring'],
  },

  'sponsoring-dossier': {
    title: 'Sponsoring-Dossier erstellen',
    intro: 'Ein Sponsoring-Dossier stellt Sie oder Ihren Verein einer Firma vor und zeigt, was eine Partnerschaft bringt. Hier lesen Sie, wann Sie eines brauchen, was hineingehört und wie Sie Sponsoringpakete zusammenstellen, für Sportlerinnen, Sportler, Sport- und Kulturvereine.',
    sections: [
      {
        id: 'wozu',
        title: 'Wozu ein Dossier, und wann eine kurze Mail reicht',
        blocks: [
          { type: 'p', text: 'Ein Dossier, auch Sponsoringmappe oder Sponsoringkonzept genannt, sammelt alles, was eine Firma für ihren Entscheid braucht. Nützlich ist es, wenn:' },
          {
            type: 'list',
            items: [
              'eine Firma nach dem ersten Kontakt mehr wissen möchte',
              'ein Onlineformular Unterlagen verlangt',
              'Ihre Anfrage intern weitergereicht wird, etwa an die Geschäftsleitung',
              'Sie mehrere Pakete mit unterschiedlichen Gegenleistungen anbieten',
            ],
          },
          { type: 'p', text: ['Für einen kleinen Beitrag oder Material vom Geschäft um die Ecke reicht oft eine kurze, persönliche Anfrage, wie im Ratgeber ', link('sponsoring-anfrage', 'Sponsoring-Anfrage schreiben'), ' beschrieben. Das Dossier kann dann später folgen.'] },
        ],
      },
      {
        id: 'aufbau',
        title: 'Aufbau Seite für Seite',
        blocks: [
          { type: 'p', text: 'Eine klare Reihenfolge hilft. Jede Seite beantwortet eine Frage, die sich die Firma stellt:' },
          {
            type: 'steps',
            items: [
              'Titelseite: Name, Sportart oder Sparte, ein gutes Foto, die Saison oder das Projekt.',
              'Über uns: wer Sie sind, seit wann Sie Ihren Sport betreiben oder es den Verein gibt, wo Sie trainieren, proben oder auftreten, was Sie ausmacht.',
              'Ziele: was Sie in der Saison oder im Jahr vorhaben, und wofür Sie die Unterstützung einsetzen.',
              'Publikum und Reichweite: wer Sie sieht und hört, etwa Zuschauerinnen und Zuschauer, Mitglieder, Follower oder Medienberichte. Nennen Sie nur eigene, echte Zahlen und schreiben Sie dazu, woher sie stammen.',
              'Gegenleistungen: was die Firma von Ihnen bekommt, so konkret wie möglich.',
              'Pakete: wenige Stufen, aus denen die Firma wählen kann (siehe unten).',
              'Kontakt: Ansprechperson mit Telefon und E-Mail, und der nächste Schritt.',
            ],
          },
          { type: 'p', text: 'Halten Sie jede Seite knapp. Eine Firma soll schon beim Durchblättern verstehen, wer Sie sind, was Sie brauchen und was sie dafür bekommt. Ein Foto vom Training, von einer Probe oder einem Auftritt sagt dabei oft mehr als ein langer Text.' },
          { type: 'p', text: 'Die folgende Gliederung fasst diese Seiten zusammen. Ersetzen Sie alles in [eckigen Klammern] durch Ihre Angaben und streichen Sie, was für Sie nicht passt. Wie Sie die Pakete aufbauen, steht im nächsten Abschnitt.' },
          {
            type: 'template',
            label: 'Gliederung für Ihr Dossier',
            file: 'sponsoring-dossier-vorlage.docx',
            text: [
              'Sponsoring-Dossier [Name oder Verein] · [Saison oder Projekt]',
              '',
              '1. Titelseite',
              '[Name] · [Sportart oder Sparte] · [Saison oder Projekt]',
              '[Ein gutes Foto, zum Beispiel vom Training, von einer Probe oder einem Auftritt]',
              '',
              '2. Über uns',
              '[Wer Sie sind, seit wann Sie Ihren Sport betreiben oder es den Verein gibt, wo Sie trainieren, proben oder auftreten, was Sie ausmacht]',
              '',
              '3. Ziele',
              '[Was Sie in der Saison oder im Jahr vorhaben]',
              '[Wofür Sie die Unterstützung einsetzen]',
              '',
              '4. Publikum und Reichweite',
              '[Wer Sie sieht und hört, etwa Zuschauerinnen und Zuschauer, Mitglieder, Follower oder Medienberichte]',
              '[Nur eigene, echte Zahlen, jeweils mit Quelle]',
              '',
              '5. Gegenleistungen',
              '– [Gegenleistung, so konkret wie möglich]',
              '– [Gegenleistung]',
              '– [Gegenleistung]',
              '',
              '6. Pakete',
              'Hauptpartner: [Beitrag oder Sachleistung] – [Gegenleistungen]',
              'Partner: [Beitrag oder Sachleistung] – [Gegenleistungen]',
              'Gönner: [Beitrag oder Sachleistung] – [Gegenleistungen]',
              '',
              '7. Kontakt',
              '[Vorname Name], [Funktion, Verein]',
              '[Telefon] · [E-Mail]',
              'Nächster Schritt: [zum Beispiel ein kurzes Gespräch, und wann Sie sich melden]',
            ].join('\n'),
          },
        ],
      },
      {
        id: 'pakete',
        title: 'Sponsoringpakete schnüren',
        blocks: [
          { type: 'p', text: 'Pakete machen es der Firma leicht, sich zu entscheiden. Eine mögliche Struktur:' },
          {
            type: 'list',
            items: [
              'Hauptpartner: die sichtbarste Präsenz, etwa das Logo auf der Trikotbrust oder im Titel des Jahreskonzerts, dazu Einladungen und ein gemeinsamer Anlass.',
              'Partner: gute Sichtbarkeit, etwa das Logo auf dem Ärmel, eine Bande oder eine Anzeige im Programm, dazu eine Erwähnung online.',
              'Gönner: ein kleinerer Beitrag mit Nennung auf der Website oder einer Gönnertafel, ohne weitere Pflichten.',
            ],
          },
          { type: 'p', text: 'Die Beträge legen Sie selbst fest. Überlegen Sie, was Sie brauchen und was Ihre Gegenleistungen für die Firma wert sind. Fragen Sie im Zweifel bei befreundeten Vereinen nach, wie sie es handhaben. Sachleistungen wie Material oder Transporte lassen sich in jedes Paket einbauen.' },
          { type: 'p', text: 'Lassen Sie Raum für das Gespräch: Ein Paket ist ein Vorschlag, kein Vertrag. Manche Firmen möchten lieber etwas Eigenes zusammenstellen.' },
        ],
      },
      {
        id: 'gestaltung',
        title: 'Gestaltung',
        blocks: [
          {
            type: 'list',
            items: [
              'Kurz halten: lieber wenige, gut gefüllte Seiten als ein langes Heft.',
              'Fotos nur verwenden, wenn Sie die Rechte daran haben und die abgebildeten Personen einverstanden sind, bei Kindern und Jugendlichen auch die Eltern.',
              'Lesbare Schrift, genug Weissraum, Ihr Logo und Ihre Farben.',
              'Als PDF senden, mit einem Dateinamen, der sagt, was drin ist, etwa «Sponsoring-Dossier [Verein] [Saison].pdf».',
              'Auf die Dateigrösse achten: Ein Anhang, der im Postfach hängen bleibt, wird nicht gelesen.',
            ],
          },
        ],
      },
      {
        id: 'checkliste',
        title: 'Checkliste vor dem Versand',
        blocks: [
          {
            type: 'list',
            items: [
              'Ist der Name der Firma richtig geschrieben, und stimmt die Ansprechperson?',
              'Steht auf der ersten Seite, wer Sie sind und worum es geht?',
              'Sind alle Zahlen eigene, überprüfbare Angaben?',
              'Sind die Gegenleistungen konkret, und können Sie sie zuverlässig liefern?',
              'Sind Kontakt und nächster Schritt klar?',
              'Hat jemand das Dossier gegengelesen?',
              'Ist die Begleitmail kurz und persönlich?',
            ],
          },
        ],
      },
      {
        id: 'sponsuno',
        title: 'So hilft Ihnen Sponsuno',
        blocks: [
          { type: 'p', text: 'Sponsuno startet bald in der Deutschschweiz. Ihr Profil auf Sponsuno enthält die wichtigsten Angaben eines Dossiers: wer Sie sind, was Sie brauchen und welche Gegenleistungen Sie bieten. Firmen sehen diese Angaben, wenn Sponsuno Sie ihnen als passend vorschlägt, und Vorlagen helfen beim Ausfüllen.' },
          { type: 'p', text: ['Wie das abläuft, lesen Sie unter ', ablaufLink, '. Wer auf der Warteliste steht, erfährt zuerst vom Start.'] },
          { type: 'cta' },
        ],
      },
    ],
    related: ['sponsoren-finden', 'sponsoring-anfrage', 'kultursponsoring'],
  },

  kultursponsoring: {
    title: 'Sponsoren für Kulturvereine finden',
    intro: 'Musikgesellschaften, Chöre, Theatervereine und Bands suchen genauso Unterstützung wie Sportvereine: für Instrumente, Kostüme, Proberäume oder Aufführungen. Dieser Ratgeber zeigt, was Kulturvereine Firmen bieten können, wo sie neben Sponsoren Unterstützung finden und wie sie anfragen.',
    sections: [
      {
        id: 'angebot',
        title: 'Was Kulturvereine Firmen bieten können',
        blocks: [
          { type: 'p', text: 'An einem Konzert oder einer Aufführung sitzt das Publikum einen ganzen Abend im Saal und hält das Programm in der Hand. Das bietet Firmen andere Möglichkeiten als der Rand eines Spielfelds:' },
          {
            type: 'list',
            items: [
              'Programmheft und Plakate: Logo, Anzeige oder ein Dank im Programm',
              'Erwähnung bei der Aufführung: ein Dank von der Bühne, ein Banner im Saal',
              'Ein Auftritt für die Firma: ein Ständchen am Firmenjubiläum, Musik am Kundenanlass, eine kurze Szene an der Weihnachtsfeier',
              'Ein Konzert mit Namen: «Jahreskonzert, präsentiert von …» für den Hauptpartner',
              'Tickets und reservierte Plätze für Kundinnen, Kunden und Mitarbeitende',
              'Online: Website, Newsletter und Social Media des Vereins',
            ],
          },
        ],
      },
      {
        id: 'firmen',
        title: 'Welche Firmen passen',
        blocks: [
          {
            type: 'list',
            items: [
              'Lokales Gewerbe mit Verbindung zum Verein: Mitglieder mit eigenem Betrieb, Lieferanten, Nachbarn des Probelokals',
              'Firmen mit Bezug zur Sparte: Musikalienhandel, Instrumentenbau, Ton- und Lichttechnik, Druckerei, Stoff- und Kostümgeschäft',
              'Gastronomie und Hotellerie: das Restaurant, in dem man sich nach der Aufführung trifft, oder das Hotel, das auswärtige Gäste beherbergt',
              'Regionale Banken und Versicherungsagenturen: Schauen Sie auf deren Website nach, ob sie Kultur unterstützen und wie man anfragt.',
            ],
          },
          { type: 'p', text: 'Auch in der Kultur zählt der persönliche Kontakt. Fragen Sie im Verein, wer wen kennt, bevor Sie fremde Firmen anschreiben.' },
        ],
      },
      {
        id: 'foerderung',
        title: 'Sponsoring, Gönner, Stiftungen und öffentliche Förderung',
        blocks: [
          { type: 'p', text: 'Kulturvereine haben mehr Möglichkeiten als Sponsoring allein. Es lohnt sich, die Unterschiede zu kennen:' },
          {
            type: 'list',
            items: [
              'Sponsoring: Eine Firma unterstützt Sie und erhält eine Gegenleistung, etwa Werbung im Programmheft.',
              'Gönnerinnen und Gönner: Privatpersonen oder Firmen geben einen Beitrag, meist ohne Gegenleistung ausser einer Nennung. Ein Gönnerverein oder eine Gönnerliste kann sie längerfristig an Sie binden.',
              'Stiftungen: Viele Stiftungen fördern Kulturprojekte, mit eigenen Kriterien und Eingabefristen. Sie erwarten keine Werbung, aber ein sorgfältiges Gesuch und oft einen Bericht nach dem Projekt sowie eine Nennung als Förderin.',
              'Öffentliche Kulturförderung: Kantone und viele Gemeinden unterstützen Kulturprojekte, teils auch über regionale Stellen oder kantonale Lotteriefonds. Schauen Sie auf der Website Ihres Kantons und Ihrer Gemeinde nach, welche Projekte unterstützt werden und bis wann Gesuche eingereicht werden müssen.',
            ],
          },
          { type: 'p', text: 'Oft lassen sich die Wege kombinieren, etwa wenn ein Projekt teils von der Gemeinde, teils von Sponsoren und Gönnern getragen wird. Prüfen Sie dabei die Bedingungen: Manche Förderstellen haben Vorgaben zu Werbung oder zu Eigenleistungen.' },
          { type: 'p', text: taxNote },
        ],
      },
      {
        id: 'sachleistungen',
        title: 'Instrumente, Kostüme und Technik als Sachleistung',
        blocks: [
          { type: 'p', text: 'Nicht jede Unterstützung muss Geld sein. Für Kulturvereine sind Sachleistungen oft besonders wertvoll:' },
          {
            type: 'list',
            items: [
              'Instrumente, Noten oder Reparaturen vom Musikalienhandel',
              'Stoffe, Kostüme oder Requisiten',
              'Licht-, Ton- und Bühnentechnik, geliehen statt gekauft',
              'Druck von Plakaten, Flyern und Programmheften',
              'Räume für Proben oder Aufführungen, Transporte, Verpflegung',
            ],
          },
          { type: 'p', text: 'Halten Sie auch bei Sachleistungen fest, was vereinbart ist und welche Gegenleistung dazugehört. Für geliehenes Material braucht es zudem eine klare Abmachung zu Versicherung und Rückgabe.' },
        ],
      },
      {
        id: 'anfragen',
        title: 'So fragen Sie an',
        blocks: [
          { type: 'p', text: ['Der Aufbau ist derselbe wie im Sport: wer Sie sind, warum diese Firma, was Sie brauchen, was Sie bieten und wie es weitergeht. Einen Musterbrief mit einem Hinweis für Kulturvereine finden Sie im Ratgeber ', link('sponsoring-anfrage', 'Sponsoring-Anfrage schreiben'), '. Was in die Unterlagen gehört, steht im Ratgeber ', link('sponsoring-dossier', 'Sponsoring-Dossier erstellen'), '.'] },
          {
            type: 'list',
            items: [
              'Laden Sie die Firma an eine Probe oder ein Konzert ein, bevor Sie nach Unterstützung fragen. Wer Ihren Verein erlebt hat, versteht leichter, wofür er sich engagiert.',
              'Planen Sie früh: Programmhefte und Plakate gehen lange vor der Aufführung in Druck. Wer darin erscheinen soll, muss rechtzeitig zusagen.',
              'Nutzen Sie besondere Anlässe: Ein Vereinsjubiläum, eine neue Uniform oder eine grosse Produktion geben einer Anfrage einen klaren Grund.',
            ],
          },
          { type: 'p', text: ['Wo Sie Firmen finden und wie Sie eine Partnerschaft pflegen, beschreibt der Ratgeber ', link('sponsoren-finden', 'Sponsoren finden'), '.'] },
        ],
      },
      {
        id: 'sponsuno',
        title: 'So hilft Ihnen Sponsuno',
        blocks: [
          { type: 'p', text: 'Sponsuno ist nicht nur für den Sport gemacht und startet bald in der Deutschschweiz. Die Plattform hilft auch Musikgesellschaften, Chören, Theatervereinen und anderen Kulturvereinen, Firmen aus ihrer Region zu finden, die zu ihnen passen, und vermittelt neben Geld auch Material und Dienstleistungen.' },
          { type: 'p', text: ['Wie das abläuft, lesen Sie unter ', ablaufLink, '. Wer auf der Warteliste steht, erfährt zuerst vom Start.'] },
          { type: 'cta' },
        ],
      },
    ],
    related: ['sponsoren-finden', 'sponsoring-anfrage', 'sponsoring-dossier'],
    waitlistRole: 'kulturverein',
  },
};

// Next step shown after a waitlist sign-up (Waitlist.tsx), one per role. Guide labels follow the guide titles.
const guideStep = (id: GuideId): FooterLink => ({ href: pageMeta(id).path, label: `Ratgeber «${guides[id].title}»` });
export const waitlistNext: Record<Role, FooterLink> = {
  athlete: guideStep('sponsoring-dossier'),
  sportverein: guideStep('sponsoren-finden'),
  kulturverein: guideStep('kultursponsoring'),
  sponsor: cockpitLink,
};

// ---------- /fuer-firmen/: the page for companies (InfoPage.tsx → FirmsPage, reading column of the guides) ----------
// Built from copy that already exists on the site: the audience tile "Firmen aus der Region", howItWorks.tracks.sponsor,
// support, pricing, the offer lists of the guides "Sponsoren finden" and "Kultursponsoring" and the next step in
// projectStatus (talks with companies, region Winterthur). Product voice with one launch signal (the note); open points
// stay open and are announced before the launch (AGENTS.md, copy rule 4). Placed after `legal` because the talk invitation uses legal.contact.email.
const firmsTalkMail = legal.contact.email;

export const forFirms = {
  title: 'Sponsoring in Ihrer Region: für Firmen und Gewerbe',
  intro: 'Für Gewerbe und KMU, die sich vor Ort engagieren möchten, mit Geld, Material oder Dienstleistungen: Sponsuno zeigt Ihnen Sportlerinnen, Sportler, Sport- und Kulturvereine aus Ihrer Region, die zu Ihrer Firma passen.',
  note: 'Bald verfügbar in der Deutschschweiz.',
  // Prominent box under the note: the sponsor's side of the demo
  cockpit: {
    link: cockpitLink,
    text: 'Vorschläge aus der Region, Anfragen und laufende Partnerschaften auf einen Blick, mit Beispieldaten eines Velogeschäfts.',
  },
  steps: {
    id: 'ablauf',
    title: 'Was Sponsuno für Ihre Firma tut',
    intro: 'Vom Firmenprofil bis zur Bilanz nach der Saison:',
    items: howItWorks.tracks.sponsor.steps,
  },
  support: {
    id: 'unterstuetzung',
    title: 'Wie Sie unterstützen können',
    intro: support.intro,
    items: support.kinds.map((kind) => ({ title: kind.title, text: kind.text })),
  },
  // Gegenleistungen, from the company's side: the lists in the guides "Sponsoren finden" and "Kultursponsoring"
  offer: {
    id: 'gegenleistungen',
    title: 'Was Vereine, Sportlerinnen und Sportler bieten können',
    intro: 'Sponsoring ist ein Austausch: Sie unterstützen, und der Verein, die Sportlerin oder der Sportler bietet Ihnen dafür etwas, das für Ihre Firma einen Wert hat. Zum Beispiel:',
    items: [
      'Sichtbarkeit vor Ort: Ihr Logo auf Trikot, Startnummer, Velo oder Vereinsbus, auf Banden und Bannern',
      'Programmheft und Plakate: eine Anzeige oder ein Dank im Match- oder Konzertprogramm',
      'Präsenz an Anlässen: eine Erwähnung bei Heimspielen, Turnieren, Konzerten oder Aufführungen, ein Stand oder Prospekte vor Ort',
      'Ein Auftritt für Ihre Firma: ein Referat oder ein Training am Firmenanlass, ein Ständchen am Firmenjubiläum, Musik am Kundenanlass',
      'Online: Ihr Logo und ein Link auf der Website, Beiträge auf Social Media oder im Newsletter',
      'Zugang: Tickets oder reservierte Plätze für Ihre Kundinnen, Kunden und Mitarbeitenden',
    ],
    after: 'Auf Sponsuno zeigen Vereine, Sportlerinnen und Sportler in ihrem Profil, welche Gegenleistungen sie bieten. So sehen Sie schon vor dem ersten Gespräch, was möglich ist. Was Sie am Ende erhalten, vereinbaren Sie gemeinsam und halten es vor Beginn fest.',
    more: [
      'Die Beispiele stammen aus unseren Ratgebern ',
      { href: pageMeta('sponsoren-finden').path, label: 'Sponsoren finden' },
      ' und ',
      { href: pageMeta('kultursponsoring').path, label: 'Kultursponsoring' },
      '. Dort empfehlen wir auch, nur zu versprechen, was sich zuverlässig liefern lässt.',
    ] satisfies LegalText,
  },
  // Copy rule 4: only "commission instead of subscription" and "marketing services billed separately" are fixed
  open: {
    id: 'offen',
    title: 'Konditionen',
    decided: 'Kein Abo und keine Grundgebühr: Sponsuno arbeitet mit einer Provision für die Vermittlung. Fotos, Videos und Inhalte für Sponsoren sind separat buchbar.',
    intro: 'Vor dem Start geben wir bekannt:',
    items: [
      `Die Höhe der Provision. ${pricing.note}`,
      'Wann genau die Provision fällig wird und welche Seite sie trägt.',
      'Was für Partnerschaften gilt, die Sie heute schon haben, und für Verlängerungen.',
      'Wie Sachleistungen wie Material oder Dienstleistungen bei der Provision zählen.',
      'Wie Fotos, Videos und Inhalte abgerechnet werden.',
    ],
    more: [
      'Mehr dazu unter ',
      { href: pageMeta('kosten').path, label: 'Kosten' },
      '. Antworten auf häufige Fragen finden Sie unter ',
      { href: pageMeta('fragen').path, label: 'Fragen und Antworten' },
      '.',
    ] satisfies LegalText,
  },
  end: {
    id: 'warteliste',
    title: waitlist.title,
    text: 'Tragen Sie sich als Firma auf der Warteliste ein, dann melden wir uns zum Start.',
    // Replaces text while the waitlist stores nothing (same switch as infoPage.previewEndText)
    previewText: 'Schreiben Sie uns als Firma eine E-Mail, dann melden wir uns zum Start.',
    button: cta.waitlist,
    demoLabel: cockpitLink.label,
    demoHref: cockpitLink.href,
    // Invitation to the next round of talks (projectStatus: "Gespräche mit Firmen … in der Region Winterthur").
    // Only shown while a contact address exists.
    talk: firmsTalkMail
      ? ([
          'Als Nächstes sprechen wir mit Firmen in der Region Winterthur. Möchten Sie uns erzählen, ob und wie Ihre Firma heute sponsert und was Ihnen dabei fehlt? Schreiben Sie uns an ',
          { href: `mailto:${firmsTalkMail}?subject=${encodeURIComponent('Gespräch: Sponsuno für Firmen')}`, label: firmsTalkMail },
          '. Wir melden uns für ein kurzes Gespräch.',
        ] satisfies LegalText)
      : null,
  },
};

// ---------- 404 page (dist/404.html, NotFoundPage.tsx): served by Cloudflare for every unknown URL ----------
// Static, noindex, not in the sitemap. Links are page paths relative to the site root, or '#warteliste' (the landing
// page waitlist); they resolve to absolute URLs, because the page is shown under any address.
const notFoundMail = legal.contact.email;

export const notFound = {
  title: 'Diese Seite gibt es nicht (mehr)',
  intro: 'Vielleicht hat sich die Adresse geändert, oder sie enthält einen Tippfehler. Von hier aus geht es weiter:',
  linksTitle: 'Weiter zu',
  links: [
    { href: '', label: 'Startseite', text: 'Worum es bei Sponsuno geht und wie es funktioniert.' },
    {
      href: pageMeta('sponsoren-finden').path,
      label: 'Ratgeber',
      text: 'Praktische Tipps für Sportlerinnen, Sportler, Sport- und Kulturvereine: Sponsoren finden, anfragen und behalten.',
    },
    { href: firmsLink.href, label: 'Für Firmen', text: 'Wie Firmen aus der Region mit Sponsuno unterstützen.' },
    { href: demo.href, label: 'Produktvorschau', text: 'Sponsuno mit Beispieldaten ausprobieren.' },
    { href: '#warteliste', label: 'Warteliste', text: 'Sponsuno startet bald. Melden Sie hier Ihr Interesse an.' },
  ] satisfies (FooterLink & { text: string })[],
  /** Only shown while a contact address exists */
  contact: notFoundMail
    ? ([
        'Sie sind über einen Link auf sponsuno.ch hier gelandet? Schreiben Sie uns an ',
        { href: `mailto:${notFoundMail}`, label: notFoundMail },
        ', dann korrigieren wir ihn.',
      ] satisfies LegalText)
    : null,
};
