// Fictional demo data. No real people, companies or figures. The persona "Lea Keller" comes from the
// team's persona work (fictional by design). Company names are generic and invented.
import type { Criterion, DemoState, MatchResult, Region, SeekerProfile, Sponsor } from './types';

/** The demo runs on a fixed "today" so dates and countdowns stay consistent. */
export const DEMO_TODAY = '2026-11-02';

const NEIGHBOURS: Record<Region, Region[]> = {
  'Zürcher Oberland': ['Zürich', 'Winterthur', 'St. Gallen'],
  Winterthur: ['Zürich', 'Zürcher Oberland', 'St. Gallen'],
  Zürich: ['Winterthur', 'Zürcher Oberland', 'Luzern', 'Basel'],
  Bern: ['Luzern', 'Basel'],
  Luzern: ['Zürich', 'Bern'],
  'St. Gallen': ['Winterthur', 'Zürcher Oberland', 'Graubünden'],
  Basel: ['Zürich', 'Bern'],
  Graubünden: ['St. Gallen'],
};

export const seekers: SeekerProfile[] = [
  {
    id: 'lea',
    kind: 'athlete',
    athleteLabel: 'Sportlerin',
    name: 'Lea Keller',
    discipline: 'Langstrecken-Mountainbike',
    region: 'Zürcher Oberland',
    bio: 'Fährt Langstreckenrennen im Mountainbike, arbeitet Teilzeit und finanziert die Saison grösstenteils selbst.',
    needs: ['Material', 'Geld'],
    preferredIndustries: ['Velo und Outdoor', 'Sportartikel', 'Ernährung'],
    budget: { min: 2000, max: 6000 },
    offers: ['Logo auf dem Trikot', 'Beiträge auf Instagram', 'Besuch am Firmenanlass', 'Testberichte zu Material'],
    reach: [
      { label: 'Rennen pro Saison', value: '12' },
      { label: 'Instagram', value: '2’400 Follower' },
    ],
  },
  {
    id: 'marco',
    kind: 'athlete',
    athleteLabel: 'Sportler',
    name: 'Marco Frei',
    discipline: 'Triathlon',
    region: 'Winterthur',
    bio: 'Triathlet auf Mitteldistanz, trainiert neben dem Studium und sucht Partner für Material und Physiotherapie.',
    needs: ['Material', 'Dienstleistung'],
    preferredIndustries: ['Velo und Outdoor', 'Gesundheit', 'Sportartikel'],
    budget: { min: 1000, max: 4000 },
    offers: ['Logo auf dem Rennanzug', 'Beiträge auf Instagram', 'Vortrag im Betrieb'],
    reach: [
      { label: 'Wettkämpfe pro Saison', value: '8' },
      { label: 'Instagram', value: '1’100 Follower' },
    ],
  },
  {
    id: 'beach',
    kind: 'athlete',
    athleteLabel: 'Zweierteam',
    name: 'Beachvolleyball-Duo Seefeld',
    discipline: 'Beachvolleyball',
    region: 'Zürich',
    bio: 'Zweierteam auf der nationalen Tour. Bisherige Unterstützung kommt vor allem aus dem Bekanntenkreis.',
    needs: ['Geld', 'Material'],
    preferredIndustries: ['Sportartikel', 'Gesundheit', 'Ernährung'],
    budget: { min: 3000, max: 8000 },
    offers: ['Logo auf dem Trikot', 'Beiträge auf Instagram', 'Clinic für Mitarbeitende'],
    reach: [
      { label: 'Turniere pro Saison', value: '10' },
      { label: 'Instagram', value: '3’600 Follower' },
    ],
  },
  {
    id: 'uhc',
    kind: 'sportverein',
    name: 'Unihockeyclub Oberland',
    discipline: 'Unihockey',
    region: 'Zürcher Oberland',
    bio: 'Verein mit Juniorinnen- und Juniorenabteilung, getragen von Ehrenamtlichen.',
    needs: ['Geld', 'Infrastruktur'],
    preferredIndustries: ['Finanzen', 'Ernährung', 'Mobilität'],
    budget: { min: 3000, max: 12000 },
    offers: ['Bandenwerbung in der Halle', 'Logo auf Juniorentrikots', 'Erwähnung im Matchprogramm'],
    reach: [
      { label: 'Mitglieder', value: '180' },
      { label: 'Heimspiele pro Saison', value: '22' },
    ],
  },
  {
    id: 'mg',
    kind: 'kulturverein',
    name: 'Musikgesellschaft Bachtel',
    discipline: 'Blasmusik',
    region: 'Zürcher Oberland',
    bio: 'Blasmusikverein mit Jahreskonzert und Auftritten an Dorffesten. Sucht Unterstützung für Instrumente und Konzerte.',
    needs: ['Geld', 'Material', 'Infrastruktur'],
    preferredIndustries: ['Finanzen', 'Handwerk', 'Ernährung'],
    budget: { min: 2000, max: 7000 },
    offers: ['Erwähnung im Konzertprogramm', 'Logo auf dem Plakat', 'Ständchen am Firmenanlass'],
    reach: [
      { label: 'Mitglieder', value: '45' },
      { label: 'Konzertbesucher pro Jahr', value: 'rund 900' },
    ],
  },
  {
    id: 'theater',
    kind: 'kulturverein',
    name: 'Theaterverein Töss',
    discipline: 'Theater',
    region: 'Winterthur',
    bio: 'Laientheater mit einer Produktion pro Jahr. Braucht vor allem Licht- und Tontechnik.',
    needs: ['Infrastruktur', 'Dienstleistung'],
    preferredIndustries: ['Handwerk', 'Mobilität', 'Finanzen'],
    budget: { min: 1000, max: 5000 },
    offers: ['Logo im Programmheft', 'Freikarten', 'Dank auf der Bühne'],
    reach: [
      { label: 'Vorstellungen pro Jahr', value: '9' },
      { label: 'Plätze pro Vorstellung', value: '140' },
    ],
  },
];

export const sponsors: Sponsor[] = [
  {
    id: 'velo',
    name: 'Velogeschäft Oberland',
    industry: 'Velo und Outdoor',
    region: 'Zürcher Oberland',
    about: 'Kleines Velogeschäft mit Werkstatt. Möchte in der Region bekannter werden und Material ehrlich testen lassen.',
    offers: ['Material', 'Geld'],
    budget: { min: 1500, max: 5000 },
    goals: ['Bekanntheit in der Region', 'Glaubwürdige Produkttests', 'Kontakt zu Vereinen'],
    interests: ['Mountainbike', 'Triathlon', 'Laufsport'],
    contact: 'Inhaberin',
  },
  {
    id: 'baeckerei',
    name: 'Bäckerei am Bach',
    industry: 'Ernährung',
    region: 'Zürcher Oberland',
    about: 'Familienbetrieb mit drei Filialen. Unterstützt gern lokale Anlässe mit Verpflegung.',
    offers: ['Material', 'Geld'],
    budget: { min: 500, max: 2000 },
    goals: ['Verankerung im Dorf', 'Sichtbarkeit an Anlässen'],
    interests: ['Unihockey', 'Blasmusik', 'Mountainbike'],
    contact: 'Geschäftsführer',
  },
  {
    id: 'garage',
    name: 'Garage Sonnenberg',
    industry: 'Mobilität',
    region: 'Winterthur',
    about: 'Garage mit Mietbussen. Kann Transporte zu Wettkämpfen und Auftritten übernehmen.',
    offers: ['Geld', 'Dienstleistung'],
    budget: { min: 2000, max: 8000 },
    goals: ['Neue Kundschaft in der Region', 'Sichtbarkeit bei Familien'],
    interests: ['Triathlon', 'Unihockey', 'Theater'],
    contact: 'Leiterin Verkauf',
  },
  {
    id: 'sport',
    name: 'Sportgeschäft Zentrum',
    industry: 'Sportartikel',
    region: 'Zürich',
    about: 'Sportgeschäft in der Stadt. Sucht Botschafterinnen und Botschafter für Ausdauersport und Beachvolleyball.',
    offers: ['Material', 'Geld'],
    budget: { min: 1000, max: 6000 },
    goals: ['Junge Zielgruppe erreichen', 'Produkte im Einsatz zeigen'],
    interests: ['Beachvolleyball', 'Mountainbike', 'Laufsport'],
    contact: 'Marketingverantwortliche',
  },
  {
    id: 'bank',
    name: 'Regionalbank Oberland',
    industry: 'Finanzen',
    region: 'Zürcher Oberland',
    about: 'Regionale Bank mit Fokus auf Vereine und Kultur in der Region.',
    offers: ['Geld'],
    budget: { min: 5000, max: 20000 },
    goals: ['Engagement für die Region zeigen', 'Langfristige Partnerschaften'],
    interests: ['Blasmusik', 'Unihockey', 'Theater'],
    contact: 'Leiter Sponsoring',
  },
  {
    id: 'elektro',
    name: 'Elektro Weber',
    industry: 'Handwerk',
    region: 'Winterthur',
    about: 'Elektroinstallateur. Kann Licht- und Tontechnik für Anlässe leihen und aufbauen.',
    offers: ['Dienstleistung', 'Infrastruktur'],
    budget: { min: 1000, max: 4000 },
    goals: ['Fachkräfte in der Region erreichen', 'Sichtbarkeit an Anlässen'],
    interests: ['Theater', 'Blasmusik'],
    contact: 'Inhaber',
  },
  {
    id: 'physio',
    name: 'Physiotherapie Seeblick',
    industry: 'Gesundheit',
    region: 'Zürich',
    about: 'Praxis für Sportphysiotherapie. Bietet Behandlungen statt Geld.',
    offers: ['Dienstleistung'],
    budget: { min: 500, max: 3000 },
    goals: ['Sportlerinnen und Sportler als Kundschaft', 'Fachkompetenz zeigen'],
    interests: ['Triathlon', 'Beachvolleyball', 'Mountainbike'],
    contact: 'Praxisleiterin',
  },
  {
    id: 'mosterei',
    name: 'Mosterei Hügelland',
    industry: 'Ernährung',
    region: 'Zürcher Oberland',
    about: 'Mosterei mit Hofladen. Möchte Apfelschorle und Riegel an Ausdauersportlerinnen und -sportler aus der Region abgeben.',
    offers: ['Material', 'Geld'],
    budget: { min: 1000, max: 4000 },
    goals: ['Produkte bei Sportanlässen zeigen', 'Bekanntheit in der Region'],
    interests: ['Mountainbike', 'Laufsport', 'Blasmusik'],
    contact: 'Betriebsleiterin',
  },
  {
    id: 'alpin',
    name: 'Outdoor-Ausrüster Alpin',
    industry: 'Velo und Outdoor',
    region: 'Graubünden',
    about: 'Ausrüster für Berg- und Ausdauersport. Unterstützt vor allem mit Material.',
    offers: ['Material'],
    budget: { min: 2000, max: 7000 },
    goals: ['Produkte unter harten Bedingungen zeigen'],
    interests: ['Mountainbike', 'Snowboard', 'Laufsport'],
    contact: 'Teamleiter Marketing',
  },
];

/* ---------- Matching ---------- */

const rangesOverlap = (a: { min: number; max: number }, b: { min: number; max: number }) => a.min <= b.max && b.min <= a.max;

/** Scores a sponsor for a seeker on the four criteria shown everywhere in Sponsuno. */
export function matchFor(seeker: SeekerProfile, sponsor: Sponsor): MatchResult {
  const sameRegion = seeker.region === sponsor.region;
  const nearRegion = NEIGHBOURS[seeker.region].includes(sponsor.region);
  const covered = seeker.needs.filter((n) => sponsor.offers.includes(n));
  const industryFit = seeker.preferredIndustries.includes(sponsor.industry);
  const disciplineFit = sponsor.interests.some((i) => seeker.discipline.includes(i));
  const budgetFit = rangesOverlap(seeker.budget, sponsor.budget);
  const budgetNear = sponsor.budget.max >= seeker.budget.min * 0.5;

  const criteria: Criterion[] = [
    {
      key: 'region', label: 'Region',
      state: sameRegion ? 'match' : nearRegion ? 'partial' : 'miss',
      detail: sameRegion ? `Beide in der Region ${sponsor.region}` : nearRegion ? `${sponsor.region}, in der Nähe` : `${sponsor.region}, weiter entfernt`,
    },
    {
      key: 'support', label: 'Unterstützungsart',
      // Without any wished support there is nothing to cover: never a match
      state: seeker.needs.length === 0 ? 'miss' : covered.length === seeker.needs.length ? 'match' : covered.length > 0 ? 'partial' : 'miss',
      detail: seeker.needs.length === 0
        ? 'Keine Unterstützungsart im Profil gewählt'
        : covered.length > 0 ? `Bietet ${covered.join(' und ')}` : `Bietet ${sponsor.offers.join(' und ')}`,
    },
    {
      key: 'industry', label: 'Branche',
      state: industryFit && disciplineFit ? 'match' : industryFit || disciplineFit ? 'partial' : 'miss',
      detail: industryFit && disciplineFit
        ? `${sponsor.industry}, interessiert an ${seeker.discipline}`
        : disciplineFit ? `Interessiert an ${seeker.discipline}` : industryFit ? `${sponsor.industry} passt zu Ihren Wunschbranchen` : `${sponsor.industry}`,
    },
    {
      key: 'budget', label: 'Budget',
      state: budgetFit ? 'match' : budgetNear ? 'partial' : 'miss',
      detail: budgetFit ? 'Im vorgesehenen Rahmen' : budgetNear ? 'Etwas unter Ihrem Rahmen' : 'Deutlich unter Ihrem Rahmen',
    },
  ];
  const score = criteria.filter((c) => c.state === 'match').length;
  const sortValue = criteria.reduce((sum, c) => sum + (c.state === 'match' ? 1 : c.state === 'partial' ? 0.5 : 0), 0);
  return { sponsorId: sponsor.id, seekerId: seeker.id, criteria, score, sortValue };
}

/* ---------- Initial state ---------- */

export function initialState(): DemoState {
  return {
    role: 'seeker',
    seekerId: 'lea',
    sponsorId: 'velo',
    seekers,
    sponsors,
    shortlist: ['sport'],
    hidden: [],
    sponsorShortlist: ['marco'],
    partnerships: [
      {
        id: 'p1',
        sponsorId: 'velo',
        seekerId: 'lea',
        status: 'aktiv',
        start: '2026-03-01',
        end: '2026-12-14',
        support: { kind: 'Material', description: 'Ersatzteile und Reifen für die Saison, dazu ein Beitrag an die Reisekosten', valueChf: 3500 },
        deliverables: [
          { id: 'p1-d1', text: 'Logo auf dem Trikot', due: '2026-03-15', done: true },
          { id: 'p1-d2', text: 'Erster Beitrag auf Instagram', due: '2026-05-01', done: true },
          { id: 'p1-d3', text: 'Testbericht zu den Reifen', due: '2026-07-15', done: true },
          { id: 'p1-d4', text: 'Zweiter Beitrag auf Instagram', due: '2026-08-30', done: true },
          { id: 'p1-d5', text: 'Dritter Beitrag auf Instagram', due: '2026-11-20', done: false },
          { id: 'p1-d6', text: 'Besuch am Firmenanlass', due: '2026-11-28', done: false },
        ],
        reviewDate: '2026-12-10',
        goals: ['Bekanntheit in der Region', 'Glaubwürdige Produkttests'],
        notes: 'Inhaberin wünscht sich mehr Bilder aus Rennen. Verlängerung für 2027 ansprechen.',
      },
      {
        id: 'p2',
        sponsorId: 'physio',
        seekerId: 'lea',
        status: 'gespraech',
        start: '2027-01-01',
        end: '2027-12-31',
        support: { kind: 'Dienstleistung', description: 'Zehn Behandlungen pro Saison', valueChf: 1200 },
        deliverables: [
          { id: 'p2-d1', text: 'Erwähnung der Praxis in zwei Beiträgen', due: '2027-04-30', done: false },
          { id: 'p2-d2', text: 'Kurzer Vortrag in der Praxis', due: '2027-06-30', done: false },
        ],
        reviewDate: '2027-11-15',
        goals: ['Sportlerinnen und Sportler als Kundschaft'],
        notes: 'Erstes Gespräch am 6. November. Wunsch: Fokus auf Prävention statt Werbung.',
      },
      {
        id: 'p3',
        sponsorId: 'baeckerei',
        seekerId: 'lea',
        status: 'abgeschlossen',
        start: '2025-04-01',
        end: '2025-10-31',
        support: { kind: 'Material', description: 'Verpflegung an drei Rennen', valueChf: 600 },
        deliverables: [
          { id: 'p3-d1', text: 'Logo auf dem Zelt im Rennzentrum', due: '2025-05-10', done: true },
          { id: 'p3-d2', text: 'Dankesbeitrag auf Instagram', due: '2025-10-31', done: true },
        ],
        reviewDate: '2025-11-15',
        goals: ['Sichtbarkeit an Anlässen'],
        notes: 'Bilanz: beide zufrieden, Bäckerei möchte 2027 eventuell wieder dabei sein.',
      },
      {
        id: 'p4',
        sponsorId: 'velo',
        seekerId: 'marco',
        status: 'anfrage',
        start: '2027-03-01',
        end: '2027-10-31',
        support: { kind: 'Material', description: 'Zeitfahrrad-Service und Ersatzteile', valueChf: 2000 },
        deliverables: [
          { id: 'p4-d1', text: 'Logo auf dem Rennanzug', due: '2027-03-15', done: false },
          { id: 'p4-d2', text: 'Vortrag im Betrieb', due: '2027-05-30', done: false },
        ],
        reviewDate: '2027-11-15',
        goals: ['Glaubwürdige Produkttests'],
        notes: 'Neue Anfrage über Sponsuno.',
      },
    ],
    drafts: [
      {
        id: 'd1',
        type: 'verlaengerung',
        sponsorId: 'velo',
        subject: 'Verlängerung unserer Partnerschaft für 2027',
        body: 'Guten Tag\n\nUnsere Partnerschaft endet am 14. Dezember. Die Saison 2026 war für mich ein Erfolg: Die Reifen haben bei allen zwölf Rennen gehalten, und die beiden bisherigen Beiträge auf Instagram haben gute Rückmeldungen bekommen. Der dritte folgt im November.\n\nGerne würde ich die Zusammenarbeit für 2027 verlängern und dabei mehr Bilder aus den Rennen liefern, wie Sie es sich gewünscht haben. Hätten Sie in den nächsten zwei Wochen Zeit für ein kurzes Gespräch?\n\nFreundliche Grüsse\nLea Keller',
        status: 'entwurf',
        updatedAt: '2026-11-02T08:30:00',
      },
      {
        id: 'd2',
        type: 'anfrage',
        sponsorId: 'sport',
        subject: 'Anfrage für eine Materialpartnerschaft',
        body: 'Guten Tag\n\nIch fahre Langstreckenrennen im Mountainbike und trainiere im Zürcher Oberland. Für die Saison 2027 suche ich einen Materialpartner aus der Region.\n\nIch biete Ihnen ein Logo auf dem Trikot, Beiträge auf Instagram und ehrliche Testberichte zu Ihrem Material.\n\nFreundliche Grüsse\nLea Keller',
        status: 'entwurf',
        updatedAt: '2026-11-01T17:10:00',
      },
      {
        id: 'd3',
        type: 'update',
        sponsorId: 'velo',
        subject: 'Saisonrückblick Oktober',
        body: 'Guten Tag\n\nHier ein kurzer Rückblick auf den Oktober: zwei Rennen, beide ohne Defekt. Fotos folgen in den nächsten Tagen.\n\nFreundliche Grüsse\nLea Keller',
        status: 'versendet',
        updatedAt: '2026-10-28T19:45:00',
      },
    ],
    reminders: [
      // Linked to the partnership data (see syncReminders in store.tsx), so ticking one side updates the other
      { id: 'r1', date: '2026-11-06', text: 'Gespräch mit der Physiotherapie Seeblick vorbereiten', href: '#/partnerschaften/p2', done: false, partnershipId: 'p2', openWhile: ['anfrage', 'gespraech'] },
      { id: 'r2', date: '2026-11-20', text: 'Dritter Beitrag auf Instagram für das Velogeschäft', href: '#/partnerschaften/p1', done: false, partnershipId: 'p1', deliverableId: 'p1-d5' },
      { id: 'r3', date: '2026-11-28', text: 'Firmenanlass beim Velogeschäft Oberland', href: '#/partnerschaften/p1', done: false, partnershipId: 'p1', deliverableId: 'p1-d6' },
      { id: 'r4', date: '2026-12-10', text: 'Gemeinsame Bilanz mit dem Velogeschäft', href: '#/partnerschaften/p1', done: false, partnershipId: 'p1', openWhile: ['vereinbart', 'aktiv'] },
    ],
  };
}
