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
export const match = {
  label: 'Beispiel mit fiktiven Angaben',
  athlete: { role: 'Sucht Unterstützung', name: 'Langstrecken-Mountainbikerin', meta: 'Zürcher Oberland', need: 'Material und Reisekosten' },
  sponsor: { role: 'Möchte sponsern', mark: 'V', name: 'Velogeschäft', meta: 'Zürcher Oberland', need: 'Material und Saisonbeitrag' },
  criteria: ['Region', 'Unterstützung', 'Branche', 'Budget'],
  result: 'Passt in 4 von 4 Kriterien',
  imageNote: 'KI-generiertes Symbolbild',
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
};

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
        { href: '#warteliste', label: 'Warteliste' },
        { href: '#top', label: 'Nach oben' },
      ],
    },
  ],
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
