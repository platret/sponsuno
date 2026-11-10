import './sponsor.css';
import photo from '../../assets/symbolbild-mtb-192.jpg';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEMO_TODAY } from '../data';
import { daysUntil, formatChf, formatDate, formatDateShort, formatRange, kindLabel, relativeDays } from '../format';
import { href, navigate, useRoute } from '../router';
import { useDemo } from '../store';
import { Avatar, Badge, Button, Card, CriteriaList, EmptyState, Icon, PageHeader, Progress, ScoreBadge, StatusBadge, Tabs, useToast } from '../ui';
import type { MatchResult, Partnership, ProfileKind, SeekerProfile } from '../types';

// Sponsor cockpit: the company's side of the demo. Tabs live in the route param (#/sponsor/vorschlaege),
// so links and the back button work. All figures are fictional demo data.

type Tab = 'uebersicht' | 'vorschlaege' | 'profil';
type Filter = 'alle' | ProfileKind | 'gemerkt';

const TAB_LABEL: Record<Tab, string> = {
  uebersicht: 'Übersicht',
  vorschlaege: 'Vorschläge',
  profil: 'Unternehmensprofil',
};

const KIND_PLURAL: Record<ProfileKind, string> = {
  athlete: 'Sportlerinnen und Sportler',
  sportverein: 'Sportvereine',
  kulturverein: 'Kulturvereine',
};

const KINDS: ProfileKind[] = ['athlete', 'sportverein', 'kulturverein'];

const parseTab = (param?: string): Tab => (param === 'vorschlaege' || param === 'profil' ? param : 'uebersicht');

/** "a", "a und b", "a, b und c" */
const joinDe = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;

/** Due text for an open deliverable, from the demo's fixed today. */
function dueText(iso: string): string {
  const d = daysUntil(iso);
  if (d === -1) return 'seit gestern fällig';
  if (d < 0) return `seit ${-d} Tagen fällig`;
  return `fällig ${relativeDays(iso)}`;
}

/**
 * The persona's AI-generated photo, under the same condition as her profile preview ("So sehen Sponsoren Ihr Profil"),
 * so sponsors see what that preview promises. Wherever it shows, AiNote labels it.
 */
const photoOf = (s?: SeekerProfile) => (s?.id === 'lea' && s.kind === 'athlete' ? photo : undefined);

function AiNote({ seeker }: { seeker?: SeekerProfile }) {
  return photoOf(seeker) ? <p className="sp-ai-note">KI-generiertes Symbolbild</p> : null;
}

/** Whether a partnership runs at some point in the given calendar year. */
const runsInYear = (p: Partnership, year: string) => p.start.slice(0, 4) <= year && p.end.slice(0, 4) >= year;

export default function SponsorCockpit() {
  const { state, dispatch, sponsor, sponsorMatches } = useDemo();
  const route = useRoute();
  const tab = parseTab(route.param);
  const tabsRef = useRef<HTMLDivElement>(null);
  const keepTabFocus = useRef(false);

  const own = useMemo(() => state.partnerships.filter((p) => p.sponsorId === sponsor.id), [state.partnerships, sponsor.id]);
  const requests = own.filter((p) => p.status === 'anfrage');

  const changeTab = (next: Tab) => {
    // The shell moves focus to <main> on every route change; keep it on the tab when the user is in the tab list.
    keepTabFocus.current = !!tabsRef.current?.contains(document.activeElement);
    navigate('sponsor', next === 'uebersicht' ? undefined : next);
  };

  // A direct link to the cockpit (#/sponsor) switches the demo to the sponsor role, so the navigation matches.
  // Only on mount: a later role switch in the shell navigates away and must not be undone here.
  const roleOnMount = useRef(state.role);
  useEffect(() => {
    if (roleOnMount.current !== 'sponsor') dispatch({ type: 'setRole', role: 'sponsor' });
  }, [dispatch]);

  useEffect(() => {
    if (!keepTabFocus.current) return;
    keepTabFocus.current = false;
    // Runs after the shell's own effect (parents run after children), so the tab keeps focus.
    const id = window.setTimeout(() => {
      tabsRef.current?.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(id);
  }, [tab]);

  return (
    <div className="sp">
      <PageHeader
        title="Cockpit"
        lead={<>Guten Tag. Heute, {formatDate(DEMO_TODAY)}. Hier sehen Sie, was bei {sponsor.name} ansteht: Anfragen, laufende Partnerschaften und passende Profile aus Ihrer Region und Umgebung.</>}
      />

      <div className="sp-tabs" ref={tabsRef}>
        <Tabs<Tab>
          label="Bereiche des Cockpits"
          value={tab}
          onChange={changeTab}
          items={[
            { value: 'uebersicht', label: TAB_LABEL.uebersicht },
            { value: 'vorschlaege', label: TAB_LABEL.vorschlaege, count: sponsorMatches.length },
            { value: 'profil', label: TAB_LABEL.profil },
          ]}
        />
      </div>

      <div role="tabpanel" aria-label={TAB_LABEL[tab]} className="sp-panel">
        {tab === 'uebersicht' && <OverviewTab own={own} requests={requests} />}
        {tab === 'vorschlaege' && <SuggestionsTab own={own} />}
        {tab === 'profil' && <ProfileTab />}
      </div>
    </div>
  );
}

/* ---------- Übersicht ---------- */

function OverviewTab({ own, requests }: { own: Partnership[]; requests: Partnership[] }) {
  const { state, seekerById, sponsorMatches } = useDemo();
  const talks = own.filter((p) => p.status === 'gespraech');
  const running = own.filter((p) => p.status === 'aktiv' || p.status === 'vereinbart');
  const scoreOf = (seekerId: string) => sponsorMatches.find((m) => m.seekerId === seekerId)?.score;
  const shortlisted = state.sponsorShortlist.map((id) => seekerById(id)).filter((s): s is SeekerProfile => !!s);

  return (
    <div className="sp-overview">
      <div className="sp-col">
        <Card title="Neue Anfragen" action={requests.length > 0 ? <Badge tone="gold">{requests.length} offen</Badge> : undefined}>
          {requests.length === 0 ? (
            <EmptyState title="Keine neuen Anfragen" text="Wenn Sportlerinnen, Sportler oder Vereine Sie anfragen, erscheint das hier." />
          ) : (
            <ul className="sp-list">
              {requests.map((p) => <RequestItem key={p.id} p={p} seeker={seekerById(p.seekerId)} score={scoreOf(p.seekerId)} />)}
            </ul>
          )}
          {talks.length > 0 && (
            <div className="sp-subgroup">
              <h3>Im Gespräch</h3>
              <ul className="sp-list">
                {talks.map((p) => <RequestItem key={p.id} p={p} seeker={seekerById(p.seekerId)} score={scoreOf(p.seekerId)} mode="talk" />)}
              </ul>
            </div>
          )}
        </Card>

        <Card title="Laufende Partnerschaften">
          {running.length === 0 ? (
            <EmptyState
              title="Noch keine laufende Partnerschaft"
              text="Sobald eine Partnerschaft vereinbart ist, sehen Sie hier, welche Gegenleistungen Sie bereits erhalten haben."
              action={<Button variant="ghost" size="sm" href={href('sponsor', 'vorschlaege')} icon="match">Vorschläge ansehen</Button>}
            />
          ) : (
            <ul className="sp-list">
              {running.map((p) => <RunningItem key={p.id} p={p} seeker={seekerById(p.seekerId)} />)}
            </ul>
          )}
        </Card>
      </div>

      <div className="sp-col sp-aside">
        <BudgetCard own={own} />

        <Card title="Gemerkte Profile" action={<a className="sp-link" href={href('sponsor', 'vorschlaege')}>Alle Vorschläge</a>}>
          {shortlisted.length === 0 ? (
            <p className="sp-quiet">Noch nichts gemerkt. In den Vorschlägen können Sie Profile mit «Merken» vormerken.</p>
          ) : (
            <ul className="sp-mini-list">
              {shortlisted.map((s) => (
                <li key={s.id}>
                  <Avatar name={s.name} src={photoOf(s)} size={36} />
                  <div>
                    <p className="sp-mini-name">{s.name}</p>
                    <p className="sp-quiet">{kindLabel[s.kind]} · {s.discipline}</p>
                    <AiNote seeker={s} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <section className="sp-note" aria-labelledby="sp-note-title">
          <h2 id="sp-note-title">Was Sponsuno für Sponsoren leistet</h2>
          <ul className="sp-dots">
            <li><strong>Passende Partner aus der Region.</strong> Vorschläge sind nach Region, Unterstützungsart, Branche und Budget geordnet.</li>
            <li><strong>Gegenleistungen vorab festgehalten.</strong> Was Sie erhalten, ist vor dem Start der Partnerschaft schriftlich vereinbart.</li>
            <li><strong>Überblick an einem Ort.</strong> Anfragen, laufende Partnerschaften und Budget sind gemeinsam sichtbar.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Counterpart({ seeker, fallback, children }: { seeker?: SeekerProfile; fallback: string; children?: ReactNode }) {
  const name = seeker?.name ?? fallback;
  return (
    <div className="sp-who">
      <Avatar name={name} src={photoOf(seeker)} size={44} />
      <div className="sp-who-text">
        {children}
        {seeker && <p className="sp-quiet">{kindLabel[seeker.kind]} · {seeker.discipline} · {seeker.region}</p>}
        <AiNote seeker={seeker} />
      </div>
    </div>
  );
}

/**
 * ScoreBadge with a spoken sentence. The kit's badge carries its text only as aria-label on a plain span,
 * which several screen readers skip; here the visual badge is hidden from them and a real sentence is read instead.
 */
function Score({ score }: { score: number }) {
  return (
    <span className="sp-score">
      <span aria-hidden="true"><ScoreBadge score={score} /></span>
      <span className="visually-hidden">Passt in {score} von 4 Kriterien</span>
    </span>
  );
}

function RequestItem({ p, seeker, score, mode = 'request' }: { p: Partnership; seeker?: SeekerProfile; score?: number; mode?: 'request' | 'talk' }) {
  const name = seeker?.name ?? 'Unbekanntes Profil';
  // Talks sit under the h3 "Im Gespräch", so their titles are one level lower.
  const Title = mode === 'talk' ? 'h4' : 'h3';
  return (
    <li className="sp-item">
      <div className="sp-item-top">
        <Counterpart seeker={seeker} fallback={name}>
          <Title className="sp-item-title"><a href={href('partnerschaften', p.id)}>{name}</a></Title>
        </Counterpart>
        <div className="sp-item-meta">
          {p.status !== 'anfrage' && <StatusBadge status={p.status} />}
          {score !== undefined && <Score score={score} />}
        </div>
      </div>
      <p className="sp-support">
        <span className="sp-support-kind">{p.support.kind}</span>
        {p.support.description}
        {p.support.valueChf > 0 && <span className="sp-support-value"> · Wert {formatChf(p.support.valueChf)}</span>}
      </p>
      <div className="sp-item-foot">
        <span className="sp-quiet">Vorgesehen {formatDate(p.start)} bis {formatDate(p.end)}</span>
        <Button variant="ghost" size="sm" href={href('partnerschaften', p.id)} icon="arrowRight">
          {mode === 'talk' ? 'Gespräch ansehen' : 'Anfrage ansehen'}
          <span className="visually-hidden">: {name}</span>
        </Button>
      </div>
    </li>
  );
}

function RunningItem({ p, seeker }: { p: Partnership; seeker?: SeekerProfile }) {
  const name = seeker?.name ?? 'Unbekanntes Profil';
  const done = p.deliverables.filter((d) => d.done).length;
  const total = p.deliverables.length;
  const next = p.deliverables.filter((d) => !d.done).sort((a, b) => a.due.localeCompare(b.due))[0];
  const overdue = next ? daysUntil(next.due) < 0 : false;

  return (
    <li className="sp-item">
      <div className="sp-item-top">
        <Counterpart seeker={seeker} fallback={name}>
          <h3 className="sp-item-title"><a href={href('partnerschaften', p.id)}>{name}</a></h3>
        </Counterpart>
        <div className="sp-item-meta"><StatusBadge status={p.status} /></div>
      </div>

      <p className="sp-support">
        <span className="sp-support-kind">{p.support.kind}</span>
        {p.support.description}
        {p.support.valueChf > 0 && <span className="sp-support-value"> · Wert {formatChf(p.support.valueChf)}</span>}
      </p>

      <div className="sp-progress">
        <div className="sp-progress-row">
          <span>Erhaltene Gegenleistungen</span>
          <span className="sp-progress-count">{done} von {total}</span>
        </div>
        <Progress value={total > 0 ? done / total : 0} label={`Erhaltene Gegenleistungen von ${name}: ${done} von ${total}`} />
      </div>

      <div className="sp-next">
        <Icon name="calendar" size={18} />
        {next ? (
          <p>
            <span className="sp-next-label">Als Nächstes:</span> {next.text}, {formatDateShort(next.due)}{' '}
            <span className={overdue ? 'sp-due sp-due-late' : 'sp-due'}>({dueText(next.due)})</span>
          </p>
        ) : (
          <p>Alle vereinbarten Gegenleistungen sind erbracht. Gemeinsame Bilanz am {formatDate(p.reviewDate)}.</p>
        )}
      </div>

      <div className="sp-item-foot">
        <span className="sp-quiet">Läuft bis {formatDate(p.end)}</span>
        <Button variant="ghost" size="sm" href={href('partnerschaften', p.id)} icon="arrowRight">
          Details<span className="visually-hidden"> zur Partnerschaft mit {name}</span>
        </Button>
      </div>
    </li>
  );
}

function BudgetCard({ own }: { own: Partnership[] }) {
  const { sponsor, seekerById } = useDemo();
  const year = DEMO_TODAY.slice(0, 4);
  const nextYear = String(Number(year) + 1);
  const committed = own.filter((p) => p.status === 'aktiv' || p.status === 'vereinbart');
  const thisYear = committed.filter((p) => runsInYear(p, year));
  const planned = thisYear.reduce((sum, p) => sum + p.support.valueChf, 0);
  const later = committed.filter((p) => !runsInYear(p, year) && runsInYear(p, nextYear)).reduce((sum, p) => sum + p.support.valueChf, 0);
  const limit = sponsor.budget.max;
  const rest = limit - planned;

  return (
    <Card title={`Budget ${year}`} tone="dark" className="sp-budget">
      <p className="sp-budget-figure">
        <span className="sp-budget-amount">{formatChf(planned)}</span>
        <span className="sp-budget-of">eingeplant, Richtwert {formatChf(limit)}</span>
      </p>
      <Progress value={limit > 0 ? planned / limit : 0} label={`Budget ${year}: ${formatChf(planned)} eingeplant, Richtwert ${formatChf(limit)}`} />
      <p className="sp-budget-rest">
        {rest >= 0 ? `Noch ${formatChf(rest)} bis zum Richtwert.` : `${formatChf(-rest)} über dem Richtwert.`}
      </p>

      {thisYear.length > 0 && (
        <ul className="sp-budget-list">
          {thisYear.map((p) => (
            <li key={p.id}>
              <span>{seekerById(p.seekerId)?.name ?? 'Unbekanntes Profil'}</span>
              <span>{formatChf(p.support.valueChf)}</span>
            </li>
          ))}
        </ul>
      )}
      {later > 0 && <p className="sp-budget-rest">Für {nextYear} bereits vereinbart: {formatChf(later)}.</p>}

      <p className="sp-budget-note">
        Beispielzahlen. Gezählt werden aktive und vereinbarte Partnerschaften. Als Richtwert dient der obere
        Budgetrahmen aus Ihrem Profil (dort pro Partnerschaft angegeben).
      </p>
    </Card>
  );
}

/* ---------- Vorschläge ---------- */

/** Most relevant partnership with a seeker: an open one before a closed one, then the newest. */
function relevantPartnership(own: Partnership[], seekerId: string): Partnership | undefined {
  const all = own.filter((p) => p.seekerId === seekerId);
  const open = all.filter((p) => p.status !== 'abgeschlossen' && p.status !== 'abgesagt');
  return [...(open.length > 0 ? open : all)].sort((a, b) => b.start.localeCompare(a.start))[0];
}

const PARTNERSHIP_LINK: Record<Partnership['status'], string> = {
  anfrage: 'Anfrage ansehen',
  gespraech: 'Gespräch ansehen',
  vereinbart: 'Partnerschaft ansehen',
  aktiv: 'Partnerschaft ansehen',
  abgeschlossen: 'Partnerschaft ansehen',
  abgesagt: 'Anfrage ansehen',
};

function SuggestionsTab({ own }: { own: Partnership[] }) {
  const { state, seekerById, sponsorMatches } = useDemo();
  const [filter, setFilter] = useState<Filter>('alle');
  // Under "Gemerkt", the list is fixed when the filter is chosen. A card whose star is released stays in place
  // (and can be starred again) until the filter changes, so keyboard focus never lands on a removed card.
  const [savedSnapshot, setSavedSnapshot] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  const chooseFilter = (next: Filter) => {
    if (next === 'gemerkt') setSavedSnapshot(state.sponsorShortlist);
    setFilter(next);
  };

  const rows = sponsorMatches
    .map((m) => ({ match: m, seeker: seekerById(m.seekerId) }))
    .filter((r): r is { match: MatchResult; seeker: SeekerProfile } => !!r.seeker);

  const countOf = (f: Filter) =>
    f === 'alle' ? rows.length : f === 'gemerkt' ? rows.filter((r) => state.sponsorShortlist.includes(r.seeker.id)).length : rows.filter((r) => r.seeker.kind === f).length;

  const visible = rows.filter((r) =>
    filter === 'alle' ? true : filter === 'gemerkt' ? savedSnapshot.includes(r.seeker.id) : r.seeker.kind === filter,
  );

  const filters: { value: Filter; label: string }[] = [
    { value: 'alle', label: 'Alle' },
    ...KINDS.map((k) => ({ value: k as Filter, label: KIND_PLURAL[k] })),
    { value: 'gemerkt', label: 'Gemerkt' },
  ];

  const showAll = () => {
    chooseFilter('alle');
    // The empty state (and its button) disappears; put focus on the now pressed "Alle" chip.
    window.setTimeout(() => filterRef.current?.querySelector<HTMLButtonElement>('button')?.focus(), 0);
  };

  return (
    <section aria-labelledby="sp-sugg-title">
      <div className="sp-section-head">
        <h2 id="sp-sugg-title">Übereinstimmung mit Ihrem Profil</h2>
        <p>
          Die Kriterien zeigen, wie gut Ihr Unternehmen zu den Wünschen der Sportlerinnen, Sportler und Vereine passt: Region,
          Unterstützungsart, Branche und Budget. Berechnet wird aus deren Sicht, also danach, was sie suchen.
        </p>
      </div>

      <div className="sp-filter" role="group" aria-label="Vorschläge filtern" ref={filterRef}>
        {filters.map((f) => {
          const n = countOf(f.value);
          return (
            <button
              key={f.value}
              type="button"
              className="ui-chip sp-filter-chip"
              aria-pressed={filter === f.value}
              onClick={() => chooseFilter(f.value)}
            >
              {filter === f.value && <Icon name="check" size={14} />}
              {f.label}
              <span className="sp-filter-count">
                <span className="visually-hidden">, </span>
                {n}
                <span className="visually-hidden">{n === 1 ? ' Profil' : ' Profile'}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {visible.length === 1 ? '1 Vorschlag angezeigt' : `${visible.length} Vorschläge angezeigt`}
      </p>

      {visible.length === 0 ? (
        <Card className="sp-empty-card">
          <EmptyState
            title={filter === 'gemerkt' ? 'Noch keine Profile gemerkt' : 'Keine Vorschläge in dieser Auswahl'}
            text={filter === 'gemerkt' ? 'Mit «Merken» legen Sie interessante Profile hier ab.' : 'Wählen Sie einen anderen Filter.'}
            action={<Button variant="ghost" size="sm" onClick={showAll}>Alle anzeigen</Button>}
          />
        </Card>
      ) : (
        <ul className="sp-grid">
          {visible.map(({ match, seeker }) => (
            <li key={seeker.id}>
              <SuggestionCard match={match} seeker={seeker} partnership={relevantPartnership(own, seeker.id)} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SuggestionCard({ match, seeker, partnership }: { match: MatchResult; seeker: SeekerProfile; partnership?: Partnership }) {
  const { state, dispatch } = useDemo();
  const toast = useToast();
  const saved = state.sponsorShortlist.includes(seeker.id);

  return (
    <article className="sp-card" aria-labelledby={`sp-card-${seeker.id}`}>
      <header className="sp-card-head">
        <Avatar name={seeker.name} src={photoOf(seeker)} size={52} />
        <div className="sp-card-id">
          <h3 id={`sp-card-${seeker.id}`}>{seeker.name}</h3>
          <p className="sp-quiet">{kindLabel[seeker.kind]} · {seeker.discipline}</p>
          <p className="sp-quiet">{seeker.region}</p>
          <AiNote seeker={seeker} />
        </div>
        <Score score={match.score} />
      </header>

      <p className="sp-bio">{seeker.bio}</p>

      <dl className="sp-facts">
        {seeker.reach.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>

      <p className="sp-needs">
        <span className="sp-offers-label">Sucht</span>
        {joinDe(seeker.needs)}, {formatRange(seeker.budget)} pro Jahr
      </p>

      <div className="sp-offers">
        <p className="sp-offers-label">Bietet als Gegenleistung</p>
        <ul className="sp-badges">
          {seeker.offers.map((o) => <li key={o}><Badge>{o}</Badge></li>)}
        </ul>
      </div>

      <CriteriaList criteria={match.criteria} compact />

      <div className="sp-card-actions">
        <Button
          variant="ghost"
          size="md"
          icon="star"
          className="sp-save"
          aria-pressed={saved}
          onClick={() => dispatch({ type: 'toggleSponsorShortlist', seekerId: seeker.id })}
        >
          {saved ? 'Gemerkt' : 'Merken'}<span className="visually-hidden">: {seeker.name}</span>
        </Button>
        {partnership ? (
          <div className="sp-existing">
            <StatusBadge status={partnership.status} />
            <a className="sp-link" href={href('partnerschaften', partnership.id)}>
              {PARTNERSHIP_LINK[partnership.status]}<span className="visually-hidden">: {seeker.name}</span>
            </a>
          </div>
        ) : (
          <Button
            variant="gold"
            size="md"
            icon="mail"
            onClick={() => toast('In der Vorschau wird keine Nachricht gesendet.')}
          >
            Kontakt aufnehmen (simuliert)<span className="visually-hidden"> mit {seeker.name}</span>
          </Button>
        )}
      </div>
    </article>
  );
}

/* ---------- Unternehmensprofil ---------- */

function ProfileTab() {
  const { sponsor } = useDemo();

  return (
    <div className="sp-profile">
      <Card className="sp-profile-main">
        <div className="sp-profile-head">
          <Avatar name={sponsor.name} tone="gold" size={64} />
          <div>
            <h2>{sponsor.name}</h2>
            <p className="sp-quiet">{sponsor.industry} · {sponsor.region}</p>
          </div>
        </div>

        <p className="sp-about">{sponsor.about}</p>

        <dl className="sp-profile-dl">
          <div>
            <dt>Branche</dt>
            <dd>{sponsor.industry}</dd>
          </div>
          <div>
            <dt>Region</dt>
            <dd>{sponsor.region}</dd>
          </div>
          <div>
            <dt>Unterstützung, die Sie anbieten</dt>
            <dd><ul className="sp-badges">{sponsor.offers.map((o) => <li key={o}><Badge tone="gold">{o}</Badge></li>)}</ul></dd>
          </div>
          <div>
            <dt>Budget pro Partnerschaft und Jahr</dt>
            <dd>{formatRange(sponsor.budget)}</dd>
          </div>
          <div className="sp-profile-wide">
            <dt>Ziele</dt>
            <dd><ul className="sp-dots sp-dots-tight">{sponsor.goals.map((g) => <li key={g}>{g}</li>)}</ul></dd>
          </div>
          <div>
            <dt>Interessen</dt>
            <dd><ul className="sp-badges">{sponsor.interests.map((i) => <li key={i}><Badge>{i}</Badge></li>)}</ul></dd>
          </div>
          <div>
            <dt>Ansprechperson</dt>
            <dd>{sponsor.contact}</dd>
          </div>
        </dl>

        <p className="sp-profile-note">
          <Icon name="edit" size={18} />
          In der Vorschau ist das Unternehmensprofil nur zur Ansicht.
        </p>
      </Card>

      <section className="sp-note" aria-labelledby="sp-how-title">
        <h2 id="sp-how-title">So fliesst Ihr Profil in die Vorschläge ein</h2>
        <dl className="sp-how">
          <div>
            <dt>Region</dt>
            <dd>{sponsor.region} und Nachbarregionen</dd>
          </div>
          <div>
            <dt>Unterstützungsart</dt>
            <dd>{joinDe(sponsor.offers)}</dd>
          </div>
          <div>
            <dt>Branche</dt>
            <dd>{sponsor.industry}, Interesse an {joinDe(sponsor.interests)}</dd>
          </div>
          <div>
            <dt>Budget</dt>
            <dd>{formatRange(sponsor.budget)}</dd>
          </div>
        </dl>
        <p className="sp-quiet">In der Vorschau werden die Vorschläge nach diesen vier Kriterien geordnet.</p>
        <Button variant="navy" size="md" href={href('sponsor', 'vorschlaege')} icon="arrowRight">Vorschläge ansehen</Button>
      </section>
    </div>
  );
}
