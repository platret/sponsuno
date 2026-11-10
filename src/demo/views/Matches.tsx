import './matches.css';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { formatDate, formatRange } from '../format';
import { href, navigate, useRoute } from '../router';
import { newId, useDemo } from '../store';
import { Avatar, Badge, Button, Card, ChipGroup, CriteriaList, EmptyState, Icon, PageHeader, ScoreBadge, StatusBadge, Tabs, useToast } from '../ui';
import type { MatchResult, Partnership, Sponsor, SupportKind } from '../types';

// "Passende Partner": the seeker's sponsor suggestions (#/partner) and one sponsor in detail (#/partner/<id>).

const SUPPORT_KINDS: readonly SupportKind[] = ['Geld', 'Material', 'Dienstleistung', 'Infrastruktur'];

type TabKey = 'vorschlaege' | 'gemerkt' | 'ausgeblendet';

interface Filters {
  kinds: SupportKind[];
  ownRegion: boolean;
  minScore: number;
}

const NO_FILTERS: Filters = { kinds: [], ownRegion: false, minScore: 0 };

const SCORE_OPTIONS = [
  { value: 0, label: 'Alle' },
  { value: 2, label: 'Ab 2 von 4' },
  { value: 3, label: 'Ab 3 von 4' },
  { value: 4, label: '4 von 4' },
];

const TAB_LABEL: Record<TabKey, string> = { vorschlaege: 'Vorschläge', gemerkt: 'Gemerkt', ausgeblendet: 'Ausgeblendet' };

/** The seeker's partnership with a sponsor, preferring a running one over a closed one. */
function partnershipWith(partnerships: Partnership[], seekerId: string, sponsorId: string): Partnership | undefined {
  const own = partnerships.filter((p) => p.seekerId === seekerId && p.sponsorId === sponsorId);
  return own.find((p) => p.status !== 'abgeschlossen' && p.status !== 'abgesagt') ?? own[own.length - 1];
}

/**
 * The store has no separate "declined" status: a declined request ends up as "abgeschlossen".
 * Same rule as in Partnerships.tsx: closed before it started and nothing delivered.
 */
const isDeclined = (p: Partnership) => p.status === 'abgesagt';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** Phones start with the filters folded so the first suggestion is visible without scrolling. */
const FILTERS_FOLDED_QUERY = '(max-width: 600px)';

export default function Matches() {
  const route = useRoute();
  // Filter and tab state live here so they survive a trip to a detail page and back.
  const [tab, setTab] = useState<TabKey>('vorschlaege');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(() => !window.matchMedia?.(FILTERS_FOLDED_QUERY).matches);

  if (route.param) return <SponsorDetail sponsorId={route.param} />;
  return (
    <MatchList
      tab={tab} onTab={setTab}
      filters={filters} onFilters={setFilters}
      filtersOpen={filtersOpen} onFiltersOpen={setFiltersOpen}
    />
  );
}

/* ---------- List ---------- */

function MatchList({ tab, onTab, filters, onFilters, filtersOpen, onFiltersOpen }: {
  tab: TabKey; onTab: (t: TabKey) => void; filters: Filters; onFilters: (f: Filters) => void;
  filtersOpen: boolean; onFiltersOpen: (open: boolean) => void;
}) {
  const { state, dispatch, seeker, matches, sponsorById } = useDemo();
  const toast = useToast();
  const statusRef = useRef<HTMLParagraphElement>(null);

  const rows = useMemo(
    () => matches.flatMap((m) => {
      const sponsor = sponsorById(m.sponsorId);
      return sponsor ? [{ match: m, sponsor }] : [];
    }),
    [matches, sponsorById],
  );

  const inTab = (t: TabKey, id: string) =>
    t === 'gemerkt' ? state.shortlist.includes(id) : t === 'ausgeblendet' ? state.hidden.includes(id) : !state.hidden.includes(id);

  const counts: Record<TabKey, number> = {
    vorschlaege: rows.filter((r) => inTab('vorschlaege', r.sponsor.id)).length,
    gemerkt: rows.filter((r) => inTab('gemerkt', r.sponsor.id)).length,
    ausgeblendet: rows.filter((r) => inTab('ausgeblendet', r.sponsor.id)).length,
  };

  const tabRows = rows.filter((r) => inTab(tab, r.sponsor.id));
  const visible = tabRows.filter(({ match, sponsor }) =>
    (filters.kinds.length === 0 || sponsor.offers.some((o) => filters.kinds.includes(o)))
    && (!filters.ownRegion || sponsor.region === seeker.region)
    && match.score >= filters.minScore,
  );

  const activeCount = filters.kinds.length + (filters.ownRegion ? 1 : 0) + (filters.minScore > 0 ? 1 : 0);
  const filtersActive = activeCount > 0;
  // Buttons that reset filters or switch tabs unmount themselves; move focus to the result count.
  const resetFilters = () => {
    onFilters(NO_FILTERS);
    statusRef.current?.focus();
  };
  const goToTab = (t: TabKey) => {
    onTab(t);
    statusRef.current?.focus();
  };

  // A card can leave the current tab after an action; keep keyboard focus in a predictable place.
  const keepFocus = (leavesTab: boolean) => {
    if (leavesTab) statusRef.current?.focus();
  };

  const toggleShortlist = (sponsor: Sponsor) => {
    const on = state.shortlist.includes(sponsor.id);
    dispatch({ type: 'toggleShortlist', sponsorId: sponsor.id });
    toast(on ? `${sponsor.name} nicht mehr gemerkt` : `${sponsor.name} gemerkt`);
    keepFocus((on && tab === 'gemerkt') || (!on && tab === 'ausgeblendet'));
  };

  const toggleHidden = (sponsor: Sponsor) => {
    const on = state.hidden.includes(sponsor.id);
    dispatch({ type: 'toggleHidden', sponsorId: sponsor.id });
    toast(on ? `${sponsor.name} wieder eingeblendet` : `${sponsor.name} ausgeblendet`);
    keepFocus(tab !== 'ausgeblendet' || on);
  };

  const countText = filtersActive
    ? `${visible.length} von ${plural(tabRows.length, 'Sponsor', 'Sponsoren')}`
    : plural(visible.length, 'Sponsor', 'Sponsoren');

  return (
    <div className="mt-view">
      <PageHeader
        title="Passende Partner"
        lead={<>Vorschläge für {seeker.name}, geordnet nach den vier Kriterien Region, Unterstützungsart, Branche und Budget. Merken Sie, was Sie interessiert, und blenden Sie aus, was nicht passt.</>}
      />

      <div className="mt-bar">
        <Tabs
          label="Sponsoren nach Liste"
          value={tab}
          onChange={onTab}
          items={(Object.keys(TAB_LABEL) as TabKey[]).map((t) => ({ value: t, label: TAB_LABEL[t], count: counts[t] }))}
        />
      </div>

      <section className="mt-filters" aria-labelledby="mt-filters-title">
        <div className="mt-filters-head">
          <h2 id="mt-filters-title" className="mt-filters-title">
            <button
              type="button"
              className="mt-filters-toggle"
              aria-expanded={filtersOpen}
              aria-controls="mt-filters-grid"
              onClick={() => onFiltersOpen(!filtersOpen)}
            >
              <Icon name="filter" size={18} />
              Filter
              {filtersActive && <span className="mt-filters-count">{activeCount}<span className="visually-hidden"> aktiv</span></span>}
              <Icon name="arrowRight" size={16} className="mt-filters-caret" />
            </button>
          </h2>
          {filtersActive && (
            <button type="button" className="mt-text-btn" onClick={resetFilters}>Filter zurücksetzen</button>
          )}
        </div>
        <div className="mt-filters-grid" id="mt-filters-grid" hidden={!filtersOpen}>
          <div className="mt-filter mt-filter-kinds">
            <p className="mt-filter-label">Unterstützungsart</p>
            <ChipGroup
              label="Unterstützungsart: Sponsoren zeigen, die mindestens eine gewählte Art anbieten"
              options={SUPPORT_KINDS}
              value={filters.kinds}
              onChange={(kinds) => onFilters({ ...filters, kinds })}
            />
          </div>
          <div className="mt-filter">
            <p className="mt-filter-label">Region</p>
            <button
              type="button"
              className="mt-toggle"
              aria-pressed={filters.ownRegion}
              onClick={() => onFilters({ ...filters, ownRegion: !filters.ownRegion })}
            >
              <span className="mt-toggle-track" aria-hidden="true"><span /></span>
              <span>Nur meine Region <span className="mt-toggle-sub">({seeker.region})</span></span>
            </button>
          </div>
          <div className="mt-filter mt-filter-score">
            <label className="mt-filter-label" htmlFor="mt-min-score">Übereinstimmung</label>
            <div className="mt-select">
              <select
                id="mt-min-score"
                value={filters.minScore}
                onChange={(e) => onFilters({ ...filters, minScore: Number(e.target.value) })}
              >
                {SCORE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <Icon name="arrowRight" size={16} className="mt-select-caret" />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-results" role="tabpanel" aria-labelledby="mt-results-title">
        <h2 id="mt-results-title" className="visually-hidden">{TAB_LABEL[tab]}</h2>
        <p className="mt-count" role="status" ref={statusRef} tabIndex={-1}>
          <span className="mt-count-num">{countText}</span>
          <span className="mt-count-tab"> in «{TAB_LABEL[tab]}»</span>
        </p>

        {visible.length > 0 ? (
          <ol className="mt-grid">
            {visible.map(({ match, sponsor }, i) => (
              <li key={sponsor.id}>
                <MatchCard
                  rank={tab === 'vorschlaege' && !filtersActive ? i + 1 : undefined}
                  match={match}
                  sponsor={sponsor}
                  partnership={partnershipWith(state.partnerships, seeker.id, sponsor.id)}
                  saved={state.shortlist.includes(sponsor.id)}
                  hidden={state.hidden.includes(sponsor.id)}
                  onToggleSave={() => toggleShortlist(sponsor)}
                  onToggleHidden={() => toggleHidden(sponsor)}
                />
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-empty">
            {tabRows.length > 0 && filtersActive ? (
              <EmptyState
                title="Kein Sponsor passt zu diesen Filtern"
                text="Lockern Sie einen Filter oder setzen Sie alle zurück."
                action={<Button variant="ghost" icon="reset" onClick={resetFilters}>Filter zurücksetzen</Button>}
              />
            ) : tab === 'gemerkt' ? (
              <EmptyState
                title="Noch nichts gemerkt"
                text="Mit «Merken» legen Sie interessante Sponsoren hier ab, um später darauf zurückzukommen."
                action={<Button variant="ghost" onClick={() => goToTab('vorschlaege')}>Zu den Vorschlägen</Button>}
              />
            ) : tab === 'ausgeblendet' ? (
              <EmptyState
                title="Nichts ausgeblendet"
                text="Ausgeblendete Sponsoren erscheinen hier und lassen sich jederzeit wieder einblenden."
              />
            ) : (
              <EmptyState
                title="Alle Vorschläge ausgeblendet"
                text="Unter «Ausgeblendet» können Sie Sponsoren wieder einblenden."
                action={<Button variant="ghost" onClick={() => goToTab('ausgeblendet')}>Ausgeblendete ansehen</Button>}
              />
            )}
          </div>
        )}
      </div>

      <aside className="mt-note" aria-labelledby="mt-note-title">
        <Icon name="match" size={22} className="mt-note-icon" />
        <div>
          <h2 id="mt-note-title">So entstehen die Vorschläge</h2>
          <p>
            Sponsuno vergleicht Ihr Profil mit jedem Sponsor nach Region, Unterstützungsart, Branche und Budget.
            Ein Kriterium, das nur teilweise passt, zählt für die Reihenfolge halb.
          </p>
        </div>
      </aside>
    </div>
  );
}

function MatchCard({ rank, match, sponsor, partnership, saved, hidden, onToggleSave, onToggleHidden }: {
  rank?: number;
  match: MatchResult;
  sponsor: Sponsor;
  partnership?: Partnership;
  saved: boolean;
  hidden: boolean;
  onToggleSave: () => void;
  onToggleHidden: () => void;
}) {
  const titleId = `mt-card-${sponsor.id}`;
  const declined = partnership ? isDeclined(partnership) : false;
  return (
    <article className={`mt-card${hidden ? ' is-hidden' : ''}`} aria-labelledby={titleId}>
      <header className="mt-card-head">
        <Avatar name={sponsor.name} tone="gold" size={52} />
        <div className="mt-card-id">
          <h3 id={titleId}>{sponsor.name}</h3>
          <p className="mt-card-meta">{sponsor.industry} · {sponsor.region}</p>
        </div>
        {rank !== undefined && <span className="mt-rank" aria-hidden="true">{rank}</span>}
      </header>

      <div className="mt-card-score">
        <ScoreBadge score={match.score} />
        {partnership && (
          <span className="mt-card-status">
            <span className="mt-card-status-label">{declined ? 'Anfrage' : 'Partnerschaft'}</span>
            {declined ? <Badge tone="muted">Abgesagt</Badge> : <StatusBadge status={partnership.status} />}
          </span>
        )}
      </div>

      <CriteriaList criteria={match.criteria} compact />

      <dl className="mt-facts">
        <div>
          <dt>Bietet</dt>
          <dd className="mt-offers">{sponsor.offers.map((o) => <Badge key={o}>{o}</Badge>)}</dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>{formatRange(sponsor.budget)}</dd>
        </div>
      </dl>

      <div className="mt-card-actions">
        <button type="button" className="mt-action mt-save" aria-pressed={saved} onClick={onToggleSave}>
          <Icon name="star" size={18} />
          {saved ? 'Gemerkt' : 'Merken'}
          <span className="visually-hidden">: {sponsor.name}</span>
        </button>
        <button type="button" className="mt-action" onClick={onToggleHidden}>
          <Icon name={hidden ? 'reset' : 'eyeOff'} size={18} />
          {hidden ? 'Wieder einblenden' : 'Ausblenden'}
          <span className="visually-hidden">: {sponsor.name}</span>
        </button>
        <a className="mt-details" href={href('partner', sponsor.id)}>
          Details<span className="visually-hidden"> zu {sponsor.name}</span>
          <Icon name="arrowRight" size={18} />
        </a>
      </div>
    </article>
  );
}

/* ---------- Detail ---------- */

function SponsorDetail({ sponsorId }: { sponsorId: string }) {
  const { state, dispatch, seeker, matches, sponsorById } = useDemo();
  const toast = useToast();
  const requesting = useRef(false);
  const sponsor = sponsorById(sponsorId);
  const match = matches.find((m) => m.sponsorId === sponsorId);

  if (!sponsor || !match) {
    return (
      <div className="mt-view">
        <PageHeader title="Sponsor nicht gefunden" back={{ href: href('partner'), label: 'Alle Vorschläge' }} />
        <Card>
          <EmptyState
            title="Diesen Sponsor gibt es nicht"
            text="Der Link ist vielleicht veraltet. In der Liste finden Sie alle Vorschläge."
            action={<Button variant="navy" href={href('partner')}>Zu den Vorschlägen</Button>}
          />
        </Card>
      </div>
    );
  }

  const partnership = partnershipWith(state.partnerships, seeker.id, sponsor.id);
  const saved = state.shortlist.includes(sponsor.id);
  const hidden = state.hidden.includes(sponsor.id);
  const partial = match.criteria.filter((c) => c.state === 'partial').length;
  const neededOffers = sponsor.offers.filter((o) => seeker.needs.includes(o));
  const declined = partnership ? isDeclined(partnership) : false;
  // An unsent request draft already exists: open it instead of creating a second one
  const openDraft = state.drafts.find((d) => d.sponsorId === sponsor.id && d.type === 'anfrage' && d.status !== 'versendet');
  const isRequest = partnership?.status === 'anfrage' || partnership?.status === 'gespraech' || declined;

  const prepareRequest = () => {
    // navigate() only takes effect on the next hashchange; ignore a second click until then.
    if (requesting.current) return;
    requesting.current = true;
    // A hidden sponsor the seeker now asks is no longer "ausgeblendet"; requestPartnership puts it on the shortlist.
    if (hidden) dispatch({ type: 'toggleHidden', sponsorId: sponsor.id });
    const draftId = newId('d');
    dispatch({ type: 'requestPartnership', sponsorId: sponsor.id, draftId, partnershipId: newId('p') });
    toast('Entwurf im KI-Manager erstellt');
    navigate('ki-manager', draftId);
  };

  const summary = [
    match.score === 0 ? 'Keines der vier Kriterien passt ganz' : `${match.score} von 4 Kriterien ${match.score === 1 ? 'passt' : 'passen'}`,
    partial > 0 ? `${partial} ${partial === 1 ? 'passt' : 'passen'} teilweise` : null,
  ].filter(Boolean).join(', ');

  return (
    <div className="mt-view">
      <header className="ui-page-header">
        <a className="ui-back" href={href('partner')}><Icon name="arrowLeft" size={16} />Alle Vorschläge</a>
        <div className="mt-detail-id">
          <Avatar name={sponsor.name} tone="gold" size={76} />
          <div className="mt-detail-text">
            <h1>{sponsor.name}</h1>
            <p className="mt-detail-meta">{sponsor.industry} · {sponsor.region}</p>
            <div className="mt-detail-badges">
              <ScoreBadge score={match.score} />
              {hidden && <Badge tone="muted"><Icon name="eyeOff" size={12} />Ausgeblendet</Badge>}
              {saved && <Badge tone="gold"><Icon name="star" size={12} />Gemerkt</Badge>}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-detail">
        <div className="mt-detail-side">
          <Card className="mt-next" title={!partnership ? 'Nächster Schritt' : isRequest ? 'Ihre Anfrage' : 'Ihre Partnerschaft'}>
            {partnership ? (
              <>
                <div className="mt-next-status">
                  {declined ? <Badge tone="muted">Abgesagt</Badge> : <StatusBadge status={partnership.status} />}
                  <span className="mt-next-period">
                    {declined && 'Vorgeschlagen: '}{formatDate(partnership.start)} bis {formatDate(partnership.end)}
                  </span>
                </div>
                <p className="mt-next-text">
                  {declined
                    ? `Die Anfrage wurde abgesagt: ${sponsor.name} möchte diese Partnerschaft nicht eingehen. Unter «Zur Partnerschaft» sehen Sie, was vorgeschlagen war.`
                    : partnership.status === 'abgeschlossen'
                      ? `Die Partnerschaft mit ${sponsor.name} ist abgeschlossen. Unter «Zur Partnerschaft» finden Sie Gegenleistungen und Notizen.`
                      : partnership.status === 'anfrage'
                        ? `An ${sponsor.name} ist bereits eine Anfrage vorbereitet. Unter «Zur Partnerschaft» sehen Sie den Stand, geplante Gegenleistungen und Notizen.`
                        : partnership.status === 'gespraech'
                          ? `Mit ${sponsor.name} laufen bereits Gespräche. Unter «Zur Partnerschaft» sehen Sie den Stand, geplante Gegenleistungen und Notizen.`
                          : `Mit ${sponsor.name} besteht bereits eine Partnerschaft. Unter «Zur Partnerschaft» sehen Sie Gegenleistungen, Termine und Notizen.`}
                </p>
                <div className="mt-next-buttons">
                  <Button variant="navy" href={href('partnerschaften', partnership.id)} icon="handshake">Zur Partnerschaft</Button>
                  {(partnership.status === 'abgeschlossen' || declined) && !openDraft && (
                    <Button variant="ghost" icon="sparkles" onClick={prepareRequest}>Neue Anfrage vorbereiten</Button>
                  )}
                </div>
              </>
            ) : openDraft ? (
              <>
                <p className="mt-next-text">
                  Für {sponsor.name} liegt bereits ein Entwurf im KI-Manager. Prüfen und senden Sie ihn dort; erst dann entsteht die Anfrage.
                </p>
                <Button variant="gold" icon="edit" href={href('ki-manager', openDraft.id)}>Entwurf öffnen</Button>
              </>
            ) : (
              <>
                <p className="mt-next-text">
                  Im KI-Manager entsteht aus Ihrem Profil ein Entwurf für eine Anfrage, den Sie prüfen und anpassen.
                </p>
                <Button variant="gold" icon="sparkles" onClick={prepareRequest}>Anfrage vorbereiten</Button>
              </>
            )}
            <div className="mt-next-secondary">
              <button
                type="button"
                className="mt-action mt-save"
                aria-pressed={saved}
                onClick={() => {
                  dispatch({ type: 'toggleShortlist', sponsorId: sponsor.id });
                  toast(saved ? 'Nicht mehr gemerkt' : 'Gemerkt');
                }}
              >
                <Icon name="star" size={18} />
                {saved ? 'Gemerkt' : 'Merken'}
              </button>
              <button
                type="button"
                className="mt-action"
                onClick={() => {
                  dispatch({ type: 'toggleHidden', sponsorId: sponsor.id });
                  toast(hidden ? 'Wieder eingeblendet' : 'Ausgeblendet');
                }}
              >
                <Icon name={hidden ? 'reset' : 'eyeOff'} size={18} />
                {hidden ? 'Wieder einblenden' : 'Ausblenden'}
              </button>
            </div>
          </Card>

          <Card title="Eckdaten" className="mt-keyfacts">
            <dl className="mt-kv">
              <div>
                <dt>Unterstützung</dt>
                <dd className="mt-offers">
                  {sponsor.offers.map((o) => (
                    <Badge key={o} tone={neededOffers.includes(o) ? 'gold' : 'neutral'}>
                      {neededOffers.includes(o) && <Icon name="check" size={12} />}
                      {o}
                      {neededOffers.includes(o) && <span className="visually-hidden"> (von Ihnen gesucht)</span>}
                    </Badge>
                  ))}
                </dd>
                {neededOffers.length > 0 && <dd className="mt-kv-hint">Mit Haken: von Ihnen gesucht</dd>}
              </div>
              <div>
                <dt>Budget pro Partnerschaft</dt>
                <dd>{formatRange(sponsor.budget)} pro Jahr</dd>
                <dd className="mt-kv-hint">Ihr Rahmen: {formatRange(seeker.budget)}</dd>
              </div>
              <div>
                <dt>Ansprechperson</dt>
                <dd>{sponsor.contact}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <div className="mt-detail-main">
          <Card title="Warum das passen könnte" className="mt-why">
            <p className="mt-why-summary">{summary}.</p>
            <CriteriaList criteria={match.criteria} />
          </Card>

          <Card title={`Über ${sponsor.name}`}>
            <p className="mt-about">{sponsor.about}</p>
            <div className="mt-about-grid">
              <Section title="Ziele mit einer Partnerschaft">
                <ul className="mt-goals">
                  {sponsor.goals.map((g) => <li key={g}>{g}</li>)}
                </ul>
              </Section>
              <Section title="Interessiert an">
                <ul className="mt-tags">
                  {sponsor.interests.map((i) => {
                    const own = seeker.discipline.includes(i);
                    return (
                      <li key={i}>
                        <Badge tone={own ? 'gold' : 'neutral'}>
                          {own && <Icon name="check" size={12} />}
                          {i}
                          {own && <span className="visually-hidden"> (Ihre Disziplin)</span>}
                        </Badge>
                      </li>
                    );
                  })}
                </ul>
                {sponsor.interests.some((i) => seeker.discipline.includes(i)) && (
                  <p className="mt-kv-hint mt-tags-hint">Mit Haken: Ihre Disziplin</p>
                )}
              </Section>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
