// All visible copy lives here. Rules for writing it are in AGENTS.md (Swiss spelling, formal "Sie",
// nothing presented as decided or working that the team has not decided or built).

export type SectionId = 'ablauf' | 'fuer-wen' | 'ki-manager' | 'kosten' | 'fragen';

export const nav: { id: SectionId; label: string }[] = [
  { id: 'ablauf', label: 'So funktioniert es' },
  { id: 'fuer-wen', label: 'Für wen' },
  { id: 'ki-manager', label: 'KI-Manager' },
  { id: 'kosten', label: 'Kosten' },
  { id: 'fragen', label: 'Fragen' },
];

export const cta = {
  waitlist: 'Auf die Warteliste',
  waitlistShort: 'Warteliste',
};

export const hero = {
  kicker: 'Im Aufbau. Start in der Deutschschweiz.',
  // The soft hyphen (\u00AD) lets "zusammenpasst" break cleanly on narrow screens
  title: 'Sponsoring, das zusammen\u00ADpasst.',
  lead: 'Sponsuno bringt Sportlerinnen und Sportler, Sport- und Kulturvereine mit Firmen aus ihrer Region zusammen. Ein persönlicher KI-Manager hilft danach bei Anfragen, Terminen und Gegenleistungen.',
  secondary: 'So funktioniert es',
  note: 'Geplant ist eine Provision für erfolgreiche Vermittlungen, kein Abo.',
};

// Fictional example for the hero animation. Keep the caption whenever this changes.
export const match = {
  athlete: {
    role: 'Sucht Unterstützung',
    name: 'Langstrecken-Mountainbikerin',
    region: 'Zürcher Oberland',
    need: 'Braucht Material und Beiträge an Reisekosten',
  },
  sponsor: {
    role: 'Möchte sponsern',
    mark: 'V',
    name: 'Velogeschäft',
    region: 'Zürcher Oberland',
    need: 'Bietet Material und einen Saisonbeitrag',
  },
  criteria: [
    { key: 'Region', value: 'Zürcher Oberland' },
    { key: 'Unterstützungsart', value: 'Material und Geld' },
    { key: 'Branche', value: 'Velo und Outdoor' },
    { key: 'Budget', value: 'Im vorgesehenen Rahmen' },
  ],
  result: 'Passt in 4 von 4 Punkten',
  caption: 'Beispiel mit fiktiven Angaben und KI-generiertem Symbolbild.',
  replay: 'Nochmals abspielen',
};

export const ribbon = {
  label: 'Für Sport und Kultur, zum Beispiel',
  items: ['Mountainbike', 'Musikgesellschaft', 'Beachvolleyball', 'Theaterverein', 'Triathlon', 'Jodlerklub', 'Unihockey', 'Chor', 'Snowboard', 'Turnverein', 'Tennis', 'Laufclub'],
  pause: 'Laufband anhalten',
  resume: 'Laufband fortsetzen',
};

export const problem = {
  title: 'Heute kostet Sponsoring vor allem Zeit und Kontakte.',
  intro: 'Das haben uns vier Sportlerinnen und Sportler und ein Tennistrainer im Herbst 2026 erzählt. Drei Punkte kamen mehrfach zur Sprache.',
  items: [
    {
      title: 'Ohne Kontakte kein Zugang',
      text: 'Wer niemanden kennt, weiss nicht, welche Firma überhaupt Interesse hat und wer dort zuständig ist. Bei mehreren Befragten kamen die Sponsoren vor allem aus dem Bekanntenkreis.',
    },
    {
      title: 'Der Aufwand läuft neben Training und Ehrenamt',
      text: 'Dossiers schreiben, Anfragen verschicken, Absagen einstecken und bestehende Partner betreuen. All das passiert in der freien Zeit.',
    },
    {
      title: 'Was beide Seiten erwarten, bleibt offen',
      text: 'Gegenleistungen sind oft nicht klar vereinbart. Später bleibt unklar, ob sich die Partnerschaft für beide gelohnt hat.',
    },
  ],
};

export const steps = {
  title: 'So ist Sponsuno gedacht',
  intro: 'Vom ersten Profil bis zur Bilanz nach der Saison: Sponsuno soll die ganze Partnerschaft begleiten, nicht nur das erste Kennenlernen.',
  items: [
    { title: 'Profil anlegen', text: 'Region, Sportart oder Sparte, was Sie brauchen und was Sie bieten. Vorlagen helfen beim Ausfüllen.' },
    { title: 'Passende Partner sehen', text: 'Sponsuno schlägt Partner nach Region, Budget, Branche und Art der Unterstützung vor.' },
    { title: 'Vorab klar vereinbaren', text: 'Ziele und Gegenleistungen werden festgehalten, bevor die Zusammenarbeit beginnt.' },
    { title: 'Gemeinsam prüfen', text: 'Nach einer vereinbarten Zeit schauen beide Seiten, ob die Partnerschaft hält, was sie versprochen hat.' },
  ],
};

export const audiences = {
  title: 'Für beide Seiten einer Partnerschaft',
  athletes: {
    title: 'Für Sportlerinnen, Sportler und Vereine',
    points: [
      'Kontakt zu Firmen, die selbst angeben, dass sie sponsern möchten',
      'Vorlagen, die den Aufwand für Anfragen und Dossiers verringern',
      'Geld und Sachleistungen, auch für kleinere Projekte',
      'Eine Übersicht über Zusagen, Gegenleistungen und Vertragsenden',
    ],
    cta: 'Auf die Warteliste',
  },
  sponsors: {
    title: 'Für Sponsoren',
    points: [
      'Sportlerinnen, Sportler und Vereine aus Ihrer Region, die zu Ihrer Firma passen',
      'Gegenleistungen, die vor Beginn schriftlich festgehalten werden',
      'Sachleistungen wie Material oder Ausrüstung sind ebenso möglich',
      'Laufende Partnerschaften und Vertragsenden an einem Ort',
    ],
    cta: 'Als Firma eintragen',
  },
};

export const aiManager = {
  title: 'Ein KI-Manager für alles, was neben Training und Vereinsarbeit liegen bleibt.',
  intro: 'Nach der Vermittlung fängt die Arbeit erst an. Der geplante KI-Sponsoringmanager soll Ihnen Schreibarbeit abnehmen und den Überblick behalten.',
  features: [
    { title: 'Entwürfe schreiben', text: 'Anfragen, Dossiers und Updates für Sponsoren, passend zu Ihrem Profil.' },
    { title: 'An Termine erinnern', text: 'Abgabetermine, Anlässe und Vertragsenden, bevor es knapp wird.' },
    { title: 'Gegenleistungen im Blick', text: 'Was vereinbart ist, was erledigt ist und was noch fehlt.' },
  ],
  note: 'Entwürfe gehen erst raus, wenn Sie sie geprüft haben.',
  panel: {
    name: 'Ihr KI-Sponsoringmanager',
    reminder: {
      label: 'Erinnerung',
      text: 'Der Vertrag mit dem Velogeschäft endet in sechs Wochen. Soll ich ein Gespräch zur Verlängerung vorschlagen?',
      primary: 'Entwurf ansehen',
      secondary: 'Später',
    },
    deliverables: {
      label: 'Gegenleistungen Saison 2027',
      items: [
        { text: 'Logo auf dem Trikot', status: 'Erledigt', state: 'done' as const },
        { text: 'Drei Beiträge auf Instagram', status: '2 von 3', state: 'progress' as const, progress: 2 / 3 },
        { text: 'Besuch am Firmenanlass', status: 'Offen', state: 'open' as const },
      ],
    },
    draft: {
      label: 'Entwurf: Anfrage an ein Sportgeschäft',
      text: 'Guten Tag. Ich fahre Langstreckenrennen im Mountainbike und trainiere im Zürcher Oberland. Für die Saison 2027 suche ich einen Materialpartner aus der Region …',
      status: 'Wartet auf Ihre Prüfung',
    },
  },
  caption: 'Beispielansicht. Der KI-Manager ist in Entwicklung.',
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
  intro: 'Geplant ist eine Provision für die Vermittlung, kein Abo.',
  rows: [
    {
      title: 'Vermittlung',
      text: 'Die Provision soll erst anfallen, wenn eine Partnerschaft zustande kommt. Wie hoch sie ist, wann genau sie fällig wird und welche Seite sie trägt, ist noch offen. Wir legen es vor dem Start fest.',
    },
    {
      title: 'Fotos, Videos und Inhalte',
      text: 'Hilfe bei Inhalten für Ihre Sponsoren soll separat buchbar sein. Sie entscheiden, ob Sie sie brauchen.',
    },
  ],
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

export type Role = 'athlete' | 'sportverein' | 'kulturverein' | 'sponsor';

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
  lead: 'Sponsoring, das zusammenpasst.',
  sub: 'Für Sport und Kultur in der Deutschschweiz. Sponsuno ist im Aufbau.',
  columns: [
    {
      title: 'Plattform',
      links: [
        { href: '#ablauf', label: 'So funktioniert es' },
        { href: '#fuer-wen', label: 'Für wen' },
        { href: '#ki-manager', label: 'KI-Manager' },
        { href: '#kosten', label: 'Kosten' },
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
  toTop: 'Zum Seitenanfang',
  copyright: '© 2026 Team Sponsuno',
  program: 'Ein Projekt im Youngpreneurs-Programm',
};

export const menu = {
  open: 'Menü öffnen',
  close: 'Menü schliessen',
  label: 'Menü',
  note: 'Sponsoring für Sport und Kultur. Start in der Deutschschweiz.',
};
