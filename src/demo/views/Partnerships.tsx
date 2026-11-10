import './partnerships.css';
import { useId, useRef, useState, type FormEvent } from 'react';
import { DEMO_TODAY } from '../data';
import { href, navigate, useRoute } from '../router';
import { useDemo } from '../store';
import {
  daysUntil, draftStatusLabel, draftTypeLabel, formatChf, formatDate, formatDateShort, kindLabel, relativeDays, statusLabel,
} from '../format';
import { Avatar, Badge, Button, Card, EmptyState, Field, Icon, PageHeader, Progress, StatusBadge, useToast } from '../ui';
import type { Deliverable, DraftStatus, Partnership, PartnershipStatus, Role, SeekerProfile, Sponsor } from '../types';

/* ---------- Helpers ---------- */

const STAGES: PartnershipStatus[] = ['anfrage', 'gespraech', 'vereinbart', 'aktiv', 'abgeschlossen', 'abgesagt'];

/** The other side of a partnership, seen from the current role. */
interface Counterpart {
  name: string;
  /** Industry (sponsor) or kind and discipline (seeker). */
  sub: string;
  region: string;
  tone: 'gold' | 'navy';
}

function counterpartOf(
  p: Partnership,
  role: Role,
  sponsorById: (id: string) => Sponsor | undefined,
  seekerById: (id: string) => SeekerProfile | undefined,
): Counterpart | undefined {
  if (role === 'seeker') {
    const s = sponsorById(p.sponsorId);
    return s && { name: s.name, sub: s.industry, region: s.region, tone: 'gold' };
  }
  const s = seekerById(p.seekerId);
  return s && { name: s.name, sub: `${kindLabel[s.kind]}, ${s.discipline}`, region: s.region, tone: 'navy' };
}

const byDue = (a: Deliverable, b: Deliverable) => a.due.localeCompare(b.due);
const nextOpen = (p: Partnership): Deliverable | undefined => p.deliverables.filter((d) => !d.done).sort(byDue)[0];
const doneCount = (p: Partnership) => p.deliverables.filter((d) => d.done).length;
const isOverdue = (d: Deliverable) => !d.done && daysUntil(d.due) < 0;
const year = (iso: string) => iso.slice(0, 4);
const shortWithYear = (iso: string) => `${formatDateShort(iso)} ${year(iso)}`;
/** Short date, with the year only when it differs from the demo's today. */
const shortSmart = (iso: string) => (year(iso) === year(DEMO_TODAY) ? formatDateShort(iso) : shortWithYear(iso));

const isDeclined = (p: Partnership) => p.status === 'abgesagt';
/** Ended either way: ran and finished, or declined. */
const isClosed = (p: Partnership) => p.status === 'abgeschlossen' || p.status === 'abgesagt';
/** Deliverables can be ticked only while the partnership is agreed or running. */
const isEditable = (p: Partnership) => p.status === 'vereinbart' || p.status === 'aktiv';
const isProposal = (p: Partnership) => p.status === 'anfrage' || p.status === 'gespraech';
const plural = (n: number) => (n === 1 ? 'Partnerschaft' : 'Partnerschaften');

/** "1. März – 14. Dez. 2026", with both years when they differ. */
function periodShort(p: Partnership) {
  const sameYear = year(p.start) === year(p.end);
  return `${sameYear ? formatDateShort(p.start) : shortWithYear(p.start)} – ${shortWithYear(p.end)}`;
}

/** relativeDays for the next two months, months beyond that ("in 8 Monaten"). */
function relativeLong(iso: string) {
  const d = daysUntil(iso);
  if (Math.abs(d) <= 60) return relativeDays(iso);
  const m = Math.round(Math.abs(d) / 30.44);
  return d > 0 ? `in ${m} Monaten` : `vor ${m} Monaten`;
}

/** "seit gestern", "seit 3 Tagen", "seit 2 Wochen" */
function overdueSince(iso: string) {
  const d = -daysUntil(iso);
  if (d === 1) return 'seit gestern';
  return d >= 14 ? `seit ${Math.round(d / 7)} Wochen` : `seit ${d} Tagen`;
}

/** Where the contract stands in time, as one short phrase. */
function timePhrase(p: Partnership) {
  if (daysUntil(p.start) > 0) return `Beginnt ${relativeLong(p.start)}`;
  const d = daysUntil(p.end);
  if (d > 0) return `Endet ${relativeLong(p.end)}`;
  if (d === 0) return 'Endet heute';
  return `Beendet ${relativeLong(p.end)}`;
}

/* ---------- View ---------- */

export default function Partnerships() {
  const { state, seeker, sponsor } = useDemo();
  const route = useRoute();
  const param = route.name === 'partnerschaften' ? route.param : undefined;
  const mine = state.partnerships.filter((p) => (state.role === 'seeker' ? p.seekerId === seeker.id : p.sponsorId === sponsor.id));

  if (param) {
    const p = mine.find((x) => x.id === param);
    return p ? <Detail key={p.id} p={p} /> : <NotFound />;
  }
  return <List items={mine} />;
}

function NotFound() {
  return (
    <>
      <PageHeader title="Partnerschaft nicht gefunden" back={{ href: href('partnerschaften'), label: 'Alle Partnerschaften' }} />
      <Card>
        <EmptyState
          title="Diese Partnerschaft gibt es in dieser Ansicht nicht"
          text="Vielleicht gehört sie zur anderen Ansicht, oder die Vorschau wurde zurückgesetzt."
          action={<Button href={href('partnerschaften')} variant="navy" icon="arrowLeft">Alle Partnerschaften</Button>}
        />
      </Card>
    </>
  );
}

/* ---------- List: light pipeline and grouped partner table ---------- */

function List({ items }: { items: Partnership[] }) {
  const { state, sponsor, sponsorById, seekerById } = useDemo();
  const role = state.role;
  const [filter, setFilter] = useState<PartnershipStatus | null>(null);
  const stagesRef = useRef<HTMLOListElement>(null);

  // "Alle Phasen zeigen" removes itself: return focus to the phase button that set the filter.
  const clearFilter = () => {
    const prev = filter;
    setFilter(null);
    window.requestAnimationFrame(() => {
      const ol = stagesRef.current;
      (ol?.querySelector<HTMLButtonElement>(`[data-stage="${prev}"]`) ?? ol?.querySelector<HTMLButtonElement>('.ps-stage'))?.focus();
    });
  };

  const lead = role === 'seeker'
    ? 'Alle Ihre Partnerschaften an einem Ort: von der ersten Anfrage über die Gegenleistungen bis zur gemeinsamen Bilanz.'
    : `Anfragen und Partnerschaften von ${sponsor.name}: was angefragt ist, was läuft und welche Gegenleistungen Sie schon erhalten haben.`;

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Partnerschaften" lead={lead} />
        <Card>
          <EmptyState
            title="Noch keine Partnerschaften"
            text={role === 'seeker' ? 'Sobald Sie einen Sponsor anfragen, erscheint die Partnerschaft hier.' : 'Sobald Sie jemand anfragt, erscheint die Anfrage hier.'}
            action={role === 'seeker'
              ? <Button href={href('partner')} variant="gold" icon="match">Passende Partner ansehen</Button>
              : <Button href={href('sponsor')} variant="navy" icon="building">Zum Cockpit</Button>}
          />
        </Card>
      </>
    );
  }

  const counts = Object.fromEntries(STAGES.map((s) => [s, items.filter((p) => p.status === s).length])) as Record<PartnershipStatus, number>;
  const shown = STAGES.filter((s) => (filter ? s === filter : counts[s] > 0));

  return (
    <>
      <PageHeader title="Partnerschaften" lead={lead} />

      <div className="ps-pipeline">
        <ol ref={stagesRef} className="ps-stages" aria-label="Phasen einer Partnerschaft, nach Phase filtern">
          {STAGES.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="ps-stage"
                data-stage={s}
                aria-pressed={filter === s}
                aria-label={`${statusLabel[s]}: ${counts[s]} ${plural(counts[s])}`}
                onClick={() => setFilter(filter === s ? null : s)}
              >
                <span className="ps-stage-count" aria-hidden="true">{counts[s]}</span>
                <span className="ps-stage-label" aria-hidden="true">{statusLabel[s]}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="ps-filter-note" aria-live="polite">
          {filter ? (
            <>
              <span>Nur {statusLabel[filter]}: {counts[filter]} {plural(counts[filter])}.</span>
              <button type="button" className="ps-linkbtn" onClick={clearFilter}>Alle Phasen zeigen</button>
            </>
          ) : <span>Wählen Sie eine Phase, um nur diese zu zeigen.</span>}
        </p>
      </div>

      <div className="ps-groups">
        {shown.map((s) => {
          const group = items.filter((p) => p.status === s).sort((a, b) => a.start.localeCompare(b.start));
          return (
            <section key={s} className="ps-group" aria-labelledby={`ps-group-${s}`}>
              <h2 id={`ps-group-${s}`} className="ps-group-title">
                {statusLabel[s]}
                <span className="ps-group-count" aria-hidden="true">{group.length}</span>
                <span className="visually-hidden">, {group.length} {plural(group.length)}</span>
              </h2>
              {group.length === 0 ? (
                <p className="ps-group-empty">In dieser Phase gibt es gerade keine Partnerschaft.</p>
              ) : (
                <div className="ps-table">
                  <div className="ps-table-head" aria-hidden="true">
                    <span>{role === 'seeker' ? 'Sponsor und Unterstützung' : 'Partner und Unterstützung'}</span>
                    <span>Wert und Laufzeit</span>
                    <span>Gegenleistungen</span>
                    <span>Als Nächstes fällig</span>
                  </div>
                  <ul className="ps-rows">
                    {group.map((p) => {
                      const cp = counterpartOf(p, role, sponsorById, seekerById);
                      return cp ? <Row key={p.id} p={p} cp={cp} role={role} /> : null;
                    })}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}

function Row({ p, cp, role }: { p: Partnership; cp: Counterpart; role: Role }) {
  const total = p.deliverables.length;
  const done = doneCount(p);
  const closed = isClosed(p);
  const declined = isDeclined(p);
  const next = closed ? undefined : nextOpen(p);
  const doneWord = role === 'seeker' ? 'erledigt' : 'erhalten';
  return (
    <li className={declined ? 'ps-row is-declined' : 'ps-row'}>
      <div className="ps-cell ps-who">
        <Avatar name={cp.name} tone={cp.tone} size={44} />
        <div className="ps-who-text">
          <span className="ps-who-line">
            <a className="ps-row-link" href={href('partnerschaften', p.id)}>{cp.name}</a>
            {declined && <Badge tone="muted">Abgesagt</Badge>}
          </span>
          <p className="ps-desc">{p.support.description}</p>
        </div>
      </div>

      <div className="ps-cell">
        <span className="ps-cell-label">Wert und Laufzeit</span>
        <p className={p.support.valueChf > 0 ? 'ps-value' : 'ps-value is-open'}>{p.support.valueChf > 0 ? formatChf(p.support.valueChf) : 'Wert offen'}</p>
        <p className="ps-small">{periodShort(p)}</p>
      </div>

      <div className="ps-cell">
        <span className="ps-cell-label">Gegenleistungen</span>
        {declined ? (
          <p className="ps-small">Entfallen, die Anfrage wurde abgesagt</p>
        ) : total > 0 ? (
          <>
            <Progress value={done / total} label={`Gegenleistungen: ${done} von ${total} ${doneWord}`} />
            <p className="ps-small">{done} von {total} {doneWord}</p>
          </>
        ) : <p className="ps-small">Noch keine erfasst</p>}
      </div>

      <div className="ps-cell">
        <span className="ps-cell-label">Als Nächstes fällig</span>
        {next ? (
          <>
            <p className="ps-next-item">{next.text}</p>
            {isOverdue(next)
              ? <p className="ps-small ps-overdue"><Icon name="clock" size={14} />Überfällig {overdueSince(next.due)}</p>
              : <p className="ps-small">{shortWithYear(next.due)}, {relativeLong(next.due)}</p>}
          </>
        ) : closed ? (
          <p className="ps-small"><span aria-hidden="true">–</span><span className="visually-hidden">Nichts mehr fällig</span></p>
        ) : <p className="ps-small">{total > 0 ? `Alles ${doneWord}` : 'Nichts fällig'}</p>}
      </div>

      <Icon name="arrowRight" size={18} className="ps-row-arrow" />
    </li>
  );
}

/* ---------- Detail ---------- */

const LEAD: Record<Role, Record<PartnershipStatus, (name: string) => string>> = {
  seeker: {
    anfrage: (n) => `Ihre Anfrage an ${n} ist erfasst. Hier sehen Sie Ihren Vorschlag und was als Nächstes kommt.`,
    gespraech: () => 'Sie sind im Gespräch. Hier halten Sie fest, was vereinbart werden soll.',
    vereinbart: () => 'Die Vereinbarung steht. Sobald es losgeht, starten Sie die Partnerschaft hier.',
    aktiv: () => 'Die Partnerschaft läuft. Hier behalten Sie Gegenleistungen, Termine und Notizen im Blick.',
    abgeschlossen: () => 'Die Partnerschaft ist abgeschlossen. Hier sehen Sie, was erbracht wurde.',
    abgesagt: (n) => `Die Anfrage wurde abgesagt. ${n} möchte diese Partnerschaft nicht eingehen.`,
  },
  sponsor: {
    anfrage: (n) => `${n} hat Sie angefragt. Prüfen Sie den Vorschlag und entscheiden Sie, ob Sie ein Gespräch möchten.`,
    gespraech: (n) => `Sie sind mit ${n} im Gespräch. Hier sehen Sie den aktuellen Vorschlag.`,
    vereinbart: (n) => `Die Vereinbarung mit ${n} steht. Die Partnerschaft hat noch nicht begonnen.`,
    aktiv: () => 'Die Partnerschaft läuft. Hier sehen Sie, welche Gegenleistungen Sie schon erhalten haben.',
    abgeschlossen: () => 'Die Partnerschaft ist abgeschlossen. Hier sehen Sie, was erbracht wurde.',
    abgesagt: (n) => `Die Anfrage wurde abgesagt. Sie haben die Anfrage von ${n} nicht angenommen.`,
  },
};

const DECLINED_LEAD: Record<Role, (name: string) => string> = {
  seeker: (n) => `Die Anfrage wurde abgesagt. ${n} möchte diese Partnerschaft nicht eingehen.`,
  sponsor: (n) => `Die Anfrage wurde abgesagt. Sie haben die Anfrage von ${n} nicht angenommen.`,
};

function Detail({ p }: { p: Partnership }) {
  const { state, sponsorById, seekerById } = useDemo();
  const role = state.role;
  const cp = counterpartOf(p, role, sponsorById, seekerById);
  if (!cp) return <NotFound />;
  const declined = isDeclined(p);

  return (
    <div className="ps-detail">
      <PageHeader
        title={cp.name}
        back={{ href: href('partnerschaften'), label: 'Alle Partnerschaften' }}
        lead={<><span className="ps-lead-meta">{cp.sub} · {cp.region}</span>{declined ? DECLINED_LEAD[role](cp.name) : LEAD[role][p.status](cp.name)}</>}
        actions={(
          <div className="ps-head-meta">
            {declined ? <Badge tone="muted">Abgesagt</Badge> : <StatusBadge status={p.status} />}
            <span>{periodShort(p)}</span>
          </div>
        )}
      />

      <Timeline p={p} declined={declined} />

      <div className="ps-detail-grid">
        <div className="ps-col">
          <Agreement p={p} cp={cp} role={role} declined={declined} />
          <Deliverables p={p} cp={cp} role={role} declined={declined} />
        </div>
        <div className="ps-col">
          {!declined && <Review p={p} role={role} />}
          <Notes p={p} />
          {role === 'seeker' && <Drafts p={p} cp={cp} />}
        </div>
      </div>

      <NextStep p={p} cp={cp} role={role} declined={declined} />
    </div>
  );
}

/* ---------- Agreement ---------- */

function Agreement({ p, cp, role, declined }: { p: Partnership; cp: Counterpart; role: Role; declined: boolean }) {
  const pending = isProposal(p);
  return (
    <Card
      title="Vereinbarung"
      action={declined ? <Badge tone="muted">Nicht vereinbart</Badge> : pending ? <Badge tone="neutral">Vorschlag</Badge> : undefined}
    >
      {pending && <p className="ps-card-intro">Noch nicht vereinbart. Das ist der aktuelle Vorschlag; beide Seiten können ihn im Gespräch anpassen.</p>}
      {declined && <p className="ps-card-intro">Die Anfrage wurde abgesagt. Das war der Vorschlag; vereinbart wurde nichts.</p>}
      <dl className="ps-facts">
        <div>
          <dt>Unterstützung</dt>
          <dd><Badge tone="gold">{p.support.kind}</Badge><span className="ps-fact-text">{p.support.description}</span></dd>
        </div>
        <div>
          <dt>Wert</dt>
          <dd>
            {p.support.valueChf > 0
              ? <span className="ps-fact-value">{formatChf(p.support.valueChf)}</span>
              : <span className="ps-fact-text">Wert offen, wird im Gespräch geklärt</span>}
          </dd>
        </div>
        <div>
          <dt>Laufzeit</dt>
          <dd><span className="ps-fact-text">{formatDate(p.start)} bis {formatDate(p.end)}</span></dd>
        </div>
        <div>
          <dt>{role === 'seeker' ? `Ziele von ${cp.name}` : 'Ihre Ziele'}</dt>
          <dd>
            {p.goals.length > 0
              ? <ul className="ps-dots">{p.goals.map((g) => <li key={g}>{g}</li>)}</ul>
              : <span className="ps-fact-text">Noch keine Ziele festgehalten</span>}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

/* ---------- Timeline ---------- */

function Timeline({ p, declined }: { p: Partnership; declined: boolean }) {
  // Positions in days relative to the demo's today; the scale always includes today and (unless declined) the review date.
  const tStart = daysUntil(p.start);
  const tEnd = daysUntil(p.end);
  const tReview = declined ? tEnd : daysUntil(p.reviewDate);
  const lo = Math.min(tStart, 0, tReview);
  const hi = Math.max(tEnd, 0, tReview);
  const span = Math.max(1, hi - lo);
  const pos = (t: number) => ((t - lo) / span) * 100;

  const startPct = pos(tStart);
  const endPct = pos(tEnd);
  const contractPct = Math.max(0.5, endPct - startPct);
  const elapsed = Math.min(Math.max(0, -tStart), tEnd - tStart) / Math.max(1, tEnd - tStart);
  const todayPct = pos(0);
  const reviewPct = pos(tReview);
  const align = (pct: number) => (pct < 15 ? 'is-start' : pct > 85 ? 'is-end' : 'is-center');
  // Start and end labels need about 170px together: hide the end label where the bar is too short for both.
  // The dates are always listed in words below.
  const endLabelClass = `ps-tl-label is-end${contractPct < 65 ? ' ps-tl-hide-sm' : ''}${contractPct < 40 ? ' ps-tl-hide-md' : ''}`;

  return (
    <Card
      title="Laufzeit"
      className={declined ? 'ps-timeline-card is-declined' : 'ps-timeline-card'}
      action={<Badge tone={declined ? 'muted' : 'neutral'}>{declined ? 'Nicht zustande gekommen' : timePhrase(p)}</Badge>}
    >
      {declined && <p className="ps-card-intro">Vorgeschlagen war diese Laufzeit. Weil die Anfrage abgesagt wurde, findet sie nicht statt.</p>}
      <div className="ps-timeline" aria-hidden="true">
        <div className="ps-lane">
          <span className={`ps-tl-label ps-tl-today ${align(todayPct)}`} style={{ left: `${todayPct}%` }}>
            Heute, {formatDateShort(DEMO_TODAY)}
          </span>
        </div>
        <div className="ps-track">
          <span className="ps-track-contract" style={{ left: `${startPct}%`, width: `${contractPct}%` }}>
            <span className="ps-track-elapsed" style={{ width: `${elapsed * 100}%` }} />
          </span>
          {!declined && <span className="ps-mark-review" style={{ left: `${reviewPct}%` }} />}
          <span className="ps-mark-today" style={{ left: `${todayPct}%` }} />
        </div>
        <div className="ps-lane ps-lane-dates">
          <span className="ps-tl-label is-start" style={{ left: `${startPct}%` }}>{shortWithYear(p.start)}</span>
          {contractPct >= 30 && <span className={endLabelClass} style={{ left: `${endPct}%` }}>{shortWithYear(p.end)}</span>}
        </div>
        {!declined && (
          <div className="ps-lane">
            <span className={`ps-tl-label ps-tl-review ${align(reviewPct)}`} style={{ left: `${reviewPct}%` }}>
              <span className="ps-diamond" />Gemeinsam prüfen, {shortSmart(p.reviewDate)}
            </span>
          </div>
        )}
      </div>

      <dl className="ps-timeline-facts">
        <div>
          <dt>{declined ? 'Vorgeschlagener Beginn' : 'Beginn'}</dt>
          <dd>{formatDate(p.start)}{!declined && <span>{relativeLong(p.start)}</span>}</dd>
        </div>
        <div>
          <dt>{declined ? 'Vorgeschlagenes Ende' : 'Ende'}</dt>
          <dd>{formatDate(p.end)}{!declined && <span>{relativeLong(p.end)}</span>}</dd>
        </div>
        {!declined && (
          <div>
            <dt>Gemeinsam prüfen am</dt>
            <dd>{formatDate(p.reviewDate)}<span>{relativeLong(p.reviewDate)}</span></dd>
          </div>
        )}
      </dl>
    </Card>
  );
}

/* ---------- Deliverables ---------- */

function deliverablesIntro(p: Partnership, cp: Counterpart, role: Role, declined: boolean) {
  if (declined) return 'Diese Gegenleistungen waren vorgeschlagen. Weil die Anfrage abgesagt wurde, entfallen sie.';
  if (isProposal(p)) {
    return role === 'seeker'
      ? `Was Sie ${cp.name} als Gegenleistung vorschlagen. Abhaken können Sie, sobald die Partnerschaft vereinbart ist.`
      : `Was ${cp.name} Ihnen als Gegenleistung vorschlägt. Den Erhalt bestätigen Sie, sobald die Partnerschaft vereinbart ist.`;
  }
  if (isClosed(p)) {
    return role === 'seeker' ? `Was Sie ${cp.name} zugesagt hatten.` : `Was ${cp.name} Ihnen zugesagt hatte.`;
  }
  return role === 'seeker'
    ? `Was Sie ${cp.name} zugesagt haben. Haken Sie ab, was erledigt ist.`
    : `Was ${cp.name} Ihnen zugesagt hat. Bestätigen Sie, was Sie erhalten haben.`;
}

function Deliverables({ p, cp, role, declined }: { p: Partnership; cp: Counterpart; role: Role; declined: boolean }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const uid = useId();
  const [text, setText] = useState('');
  const [due, setDue] = useState('');
  const [error, setError] = useState('');
  const textRef = useRef<HTMLInputElement>(null);
  const dueRef = useRef<HTMLInputElement>(null);

  const list = [...p.deliverables].sort(byDue);
  const total = list.length;
  const done = doneCount(p);
  const doneWord = role === 'seeker' ? 'erledigt' : 'erhalten';
  const editable = isEditable(p);
  const proposal = isProposal(p);
  const closed = isClosed(p);
  // Only agreed or running partnerships can be late; proposals and closed ones are history or plans.
  const overdue = editable ? list.filter(isOverdue).length : 0;
  const showProgress = total > 0 && !proposal && !declined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) { setError('Bitte beschreiben Sie die Gegenleistung.'); textRef.current?.focus(); return; }
    if (!due) { setError('Bitte wählen Sie ein Fälligkeitsdatum.'); dueRef.current?.focus(); return; }
    dispatch({ type: 'addDeliverable', partnershipId: p.id, text: t, due });
    setText(''); setDue(''); setError('');
    toast(proposal ? 'Gegenleistung zum Vorschlag hinzugefügt' : 'Gegenleistung hinzugefügt');
  };

  /** Meta line under an item that cannot be ticked here. */
  const staticMeta = (d: Deliverable) => {
    if (declined) return <>Vorgeschlagen für {formatDate(d.due)}</>;
    if (proposal) return <>Vorgeschlagen für {formatDate(d.due)}, {relativeLong(d.due)}</>;
    if (d.done) return <>{role === 'seeker' ? 'Erledigt' : 'Erhalten'} · fällig war {formatDate(d.due)}</>;
    return <>Nicht {role === 'seeker' ? 'erbracht' : 'erhalten'} · fällig war {formatDate(d.due)}</>;
  };

  return (
    <Card title="Gegenleistungen" action={overdue > 0 ? <Badge tone="gold"><Icon name="clock" size={14} />{overdue} überfällig</Badge> : undefined}>
      <p className="ps-card-intro">{deliverablesIntro(p, cp, role, declined)}</p>

      {total > 0 ? (
        <>
          {showProgress && (
            <div className="ps-progress-row">
              <Progress value={done / total} label={`Gegenleistungen: ${done} von ${total} ${doneWord}`} />
              <span>{done} von {total} {doneWord}</span>
            </div>
          )}
          <ul className={editable ? 'ps-checklist' : 'ps-checklist is-static'}>
            {list.map((d) => {
              const id = `${uid}-${d.id}`;
              const late = editable && isOverdue(d);
              if (!editable) {
                const ticked = closed && !declined && d.done;
                return (
                  <li key={d.id} className={ticked ? 'is-done-static' : undefined}>
                    <p className="ps-check">
                      <span className={ticked ? 'ps-static-mark is-done' : 'ps-static-mark'} aria-hidden="true">
                        {ticked && <Icon name="check" size={14} />}
                      </span>
                      <span className="ps-check-text">{d.text}</span>
                    </p>
                    <p className="ps-check-meta">{staticMeta(d)}</p>
                  </li>
                );
              }
              return (
                <li key={d.id} className={`${d.done ? 'is-done' : ''}${late ? ' is-late' : ''}`}>
                  <input
                    id={id}
                    type="checkbox"
                    className="ps-check-input"
                    checked={d.done}
                    aria-describedby={`${id}-meta`}
                    onChange={() => dispatch({ type: 'toggleDeliverable', partnershipId: p.id, deliverableId: d.id })}
                  />
                  <label htmlFor={id} className="ps-check">
                    <span className="ps-check-box" aria-hidden="true"><Icon name="check" size={14} /></span>
                    <span className="ps-check-text">{d.text}</span>
                  </label>
                  <p id={`${id}-meta`} className="ps-check-meta">
                    {d.done
                      ? <>{role === 'seeker' ? 'Erledigt' : 'Erhalten'} · fällig war {formatDate(d.due)}</>
                      : late
                        ? <span className="ps-overdue"><Icon name="clock" size={14} />Überfällig {overdueSince(d.due)}, fällig war {formatDate(d.due)}</span>
                        : <>Fällig am {formatDate(d.due)}, {relativeLong(d.due)}</>}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      ) : <p className="ps-muted-block">Noch keine Gegenleistungen erfasst.</p>}

      {!closed && (
        <form className="ps-add" onSubmit={submit} noValidate aria-labelledby={`${uid}-add`}>
          <h3 id={`${uid}-add`} className="ps-add-title">
            {proposal
              ? 'Vorschlag ergänzen'
              : role === 'seeker' ? 'Gegenleistung ergänzen' : 'Erwartete Gegenleistung ergänzen'}
          </h3>
          <div className="ps-add-fields">
            <Field label="Beschreibung" htmlFor={`${uid}-text`}>
              <input
                ref={textRef}
                id={`${uid}-text`}
                type="text"
                value={text}
                placeholder="z. B. Beitrag nach dem Saisonfinale"
                aria-invalid={error !== '' && !text.trim()}
                aria-describedby={error ? `${uid}-err` : undefined}
                onChange={(e) => setText(e.target.value)}
              />
            </Field>
            <Field label="Fällig am" htmlFor={`${uid}-due`}>
              <input
                ref={dueRef}
                id={`${uid}-due`}
                type="date"
                value={due}
                aria-invalid={error !== '' && !due}
                aria-describedby={error ? `${uid}-err` : undefined}
                onChange={(e) => setDue(e.target.value)}
              />
            </Field>
            <Button type="submit" variant="navy" icon="plus" className="ps-add-btn">Hinzufügen</Button>
          </div>
          {error && <p id={`${uid}-err`} className="ps-error" role="alert">{error}</p>}
        </form>
      )}
    </Card>
  );
}

/* ---------- Review ("Gemeinsam prüfen") ---------- */

function Review({ p, role }: { p: Partnership; role: Role }) {
  const d = daysUntil(p.reviewDate);
  const closed = isClosed(p);
  const doneItems = p.deliverables.filter((x) => x.done).sort(byDue);
  const total = p.deliverables.length;

  return (
    <Card title="Gemeinsam prüfen">
      <p className="ps-review-date">{formatDate(p.reviewDate)}</p>
      <p className="ps-small ps-review-rel">{d === 0 ? 'Heute' : d > 0 ? `Termin ${relativeLong(p.reviewDate)}` : `Termin war ${relativeLong(p.reviewDate)}`}</p>
      <p className="ps-card-intro">
        An diesem Termin schauen beide Seiten gemeinsam zurück: Was hat funktioniert, was soll sich ändern, und wie geht es weiter?
      </p>

      {closed ? (
        <div className="ps-summary">
          <h3>Bilanz</h3>
          {total > 0 ? (
            <>
              <p>{doneItems.length} von {total} Gegenleistungen {role === 'seeker' ? 'erbracht' : 'erhalten'}.</p>
              {doneItems.length > 0 && (
                <ul className="ps-summary-list">
                  {doneItems.map((x) => (
                    <li key={x.id}><Icon name="check" size={16} /><span>{x.text}</span><span className="ps-small">{shortWithYear(x.due)}</span></li>
                  ))}
                </ul>
              )}
            </>
          ) : <p>Es wurden keine Gegenleistungen erfasst.</p>}
        </div>
      ) : (
        <ul className="ps-dots ps-questions" aria-label="Fragen für den Termin">
          <li>Welche Ziele wurden erreicht?</li>
          <li>Welche Gegenleistungen haben am meisten gebracht?</li>
          <li>Soll die Partnerschaft weitergehen, und in welcher Form?</li>
        </ul>
      )}
    </Card>
  );
}

/* ---------- Notes ---------- */

function Notes({ p }: { p: Partnership }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const id = useId();
  const [value, setValue] = useState(p.notes);
  const dirty = value !== p.notes;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!dirty) return; // Speichern is aria-disabled while nothing changed
    dispatch({ type: 'updateNotes', partnershipId: p.id, notes: value });
    toast('Notiz gespeichert');
  };

  return (
    <Card title="Notizen">
      <form className="ps-notes" onSubmit={save}>
        <Field label="Notiz zur Partnerschaft" htmlFor={id}>
          <textarea id={id} value={value} rows={5} aria-describedby={`${id}-hint`} onChange={(e) => setValue(e.target.value)} />
          <p id={`${id}-hint`} className="ui-field-hint">Beide Seiten sehen dieselbe Notiz.</p>
        </Field>
        <div className="ps-notes-actions">
          {/* aria-disabled instead of disabled: the focused button stays focusable after saving */}
          <Button type="submit" variant="navy" size="md" aria-disabled={!dirty || undefined}>Speichern</Button>
          {dirty && <span className="ps-small">Nicht gespeichert</span>}
        </div>
      </form>
    </Card>
  );
}

/* ---------- Related drafts (seeker only) ---------- */

const DRAFT_TONE: Record<DraftStatus, 'neutral' | 'navy' | 'muted'> = { entwurf: 'neutral', geprueft: 'navy', versendet: 'muted' };

function Drafts({ p, cp }: { p: Partnership; cp: Counterpart }) {
  const { state } = useDemo();
  const drafts = state.drafts.filter((d) => d.sponsorId === p.sponsorId);
  return (
    <Card title="Nachrichten im KI-Manager">
      <p className="ps-card-intro">Entwürfe für {cp.name}. Sie prüfen jeden Text selbst, bevor er rausgeht.</p>
      {drafts.length > 0 ? (
        <ul className="ps-drafts">
          {drafts.map((d) => (
            <li key={d.id}>
              <a href={href('ki-manager', d.id)} className="ps-draft">
                <span className="ps-draft-subject">{d.subject}</span>
                <span className="ps-draft-meta">
                  <span className="ps-small">{draftTypeLabel[d.type]} · {shortWithYear(d.updatedAt)}</span>
                  <Badge tone={DRAFT_TONE[d.status]}>{draftStatusLabel[d.status]}</Badge>
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : <p className="ps-muted-block">Noch keine Entwürfe für diesen Sponsor.</p>}
      <a className="ps-textlink" href={href('ki-manager')} aria-describedby={`ps-drafts-hint-${p.id}`}>
        <Icon name="arrowRight" size={16} />Zum KI-Manager
      </a>
      <p id={`ps-drafts-hint-${p.id}`} className="ps-small ps-link-hint">Für einen neuen Entwurf wählen Sie dort {cp.name} als Empfänger.</p>
    </Card>
  );
}

/* ---------- Next step (status actions) ---------- */

interface StepAction { label: string; to: PartnershipStatus; toast: string; variant: 'gold' | 'outline' }

function NextStep({ p, cp, role, declined }: { p: Partnership; cp: Counterpart; role: Role; declined: boolean }) {
  const { state, dispatch } = useDemo();
  const toast = useToast();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const declineRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const stageIndex = STAGES.indexOf(p.status);
  const focusSoon = (el: { current: HTMLElement | null }) => window.requestAnimationFrame(() => el.current?.focus());

  const run = (a: StepAction) => {
    dispatch({ type: 'setPartnershipStatus', partnershipId: p.id, status: a.to });
    setConfirmDecline(false);
    toast(a.toast);
    // The button that was pressed disappears: keep keyboard focus in this card.
    focusSoon(headingRef);
  };

  const askDecline = () => { setConfirmDecline(true); focusSoon(cancelRef); };
  const cancelDecline = () => { setConfirmDecline(false); focusSoon(declineRef); };

  // The signed-in sponsor is the one asked: let the presenter answer the request from the other side.
  const viewAsSponsor = () => {
    dispatch({ type: 'setRole', role: 'sponsor' });
    navigate('partnerschaften', p.id);
    toast(`Sie sehen die Anfrage jetzt als ${cp.name}.`);
    focusSoon(headingRef);
  };

  // The signed-in sponsor has a cockpit, so the presenter can answer as that sponsor; any other sponsor's answer is simulated here.
  const cockpitSponsor = state.sponsorId === p.sponsorId;
  // The request text lives in the KI-Manager. Until it is marked as sent (simulated), the request has not gone out.
  const requestDrafts = state.drafts.filter((d) => d.sponsorId === p.sponsorId && d.type === 'anfrage');
  const unsentRequest = requestDrafts.some((d) => d.status === 'versendet') ? undefined : requestDrafts[0];
  // Seekers other than the demo persona cannot act in the demo: the sponsor takes their step too.
  const otherSeeker = p.seekerId !== state.seekerId;

  let text = '';
  let actions: StepAction[] = [];
  let decline: StepAction | null = null;
  let secondary: StepAction | null = null;

  if (declined) {
    text = role === 'seeker'
      ? `${cp.name} hat Ihre Anfrage abgesagt. Unter «Passende Partner» finden Sie weitere mögliche Sponsoren.`
      : `Sie haben die Anfrage von ${cp.name} abgesagt.`;
    if (role === 'sponsor') {
      secondary = { label: 'Absage zurücknehmen', to: 'anfrage', toast: 'Absage zurückgenommen. Die Anfrage ist wieder offen.', variant: 'outline' };
    }
  } else if (role === 'seeker') {
    switch (p.status) {
      case 'anfrage':
        if (unsentRequest) {
          text = `Ihre Anfrage an ${cp.name} ist vorbereitet. Den Text prüfen und senden (simuliert) Sie im KI-Manager; danach ist der Sponsor am Zug.`;
        } else {
          text = `Ihre Anfrage liegt bei ${cp.name}. Den nächsten Schritt macht der Sponsor.`;
          if (!cockpitSponsor) {
            text += ' Die Antwort des Sponsors können Sie hier simulieren.';
            actions = [{ label: 'Antwort des Sponsors simulieren', to: 'gespraech', toast: `Simuliert: ${cp.name} schlägt ein Gespräch vor.`, variant: 'gold' }];
          }
        }
        if (cockpitSponsor) text += ' Im Sponsor-Cockpit beantworten Sie die Anfrage selbst aus Sicht des Sponsors.';
        break;
      case 'gespraech':
        text = 'Wenn Sie sich über Unterstützung und Gegenleistungen einig sind, halten Sie die Vereinbarung hier fest.';
        actions = [{ label: 'Als vereinbart markieren', to: 'vereinbart', toast: 'Als vereinbart markiert', variant: 'gold' }];
        break;
      case 'vereinbart':
        text = 'Die Vereinbarung steht. Starten Sie die Partnerschaft, sobald sie beginnt. Ab dann zählen die Gegenleistungen.';
        actions = [{ label: 'Partnerschaft starten', to: 'aktiv', toast: 'Partnerschaft gestartet', variant: 'gold' }];
        break;
      case 'aktiv':
        text = 'Wenn die Laufzeit vorbei ist, schliessen Sie die Partnerschaft ab und ziehen beim Termin «Gemeinsam prüfen» Bilanz.';
        actions = [{ label: 'Abschliessen und Bilanz ziehen', to: 'abgeschlossen', toast: 'Partnerschaft abgeschlossen', variant: 'gold' }];
        break;
      case 'abgeschlossen':
        text = 'Diese Partnerschaft ist abgeschlossen. Ein kurzer Dank hält den Kontakt warm, falls beide Seiten später wieder zusammenarbeiten möchten.';
        break;
      case 'abgesagt':
        text = 'Diese Anfrage wurde abgesagt. Unter «Passende Partner» finden Sie weitere Vorschläge.';
        break;
    }
  } else {
    switch (p.status) {
      case 'anfrage':
        text = `${cp.name} möchte mit Ihnen zusammenarbeiten. Schlagen Sie ein Gespräch vor oder sagen Sie freundlich ab.`;
        actions = [{ label: 'Gespräch vorschlagen', to: 'gespraech', toast: 'Gespräch vorgeschlagen.', variant: 'gold' }];
        decline = { label: 'Absagen', to: 'abgesagt', toast: 'Anfrage abgesagt.', variant: 'outline' };
        break;
      case 'gespraech':
        if (otherSeeker) {
          text = `Sie sind im Gespräch mit ${cp.name}. Sobald beide Seiten einig sind, halten Sie die Vereinbarung hier fest; in der Vorschau übernehmen Sie diesen Schritt für beide Seiten. Oder sagen Sie freundlich ab.`;
          actions = [{ label: 'Als vereinbart markieren', to: 'vereinbart', toast: 'Als vereinbart markiert.', variant: 'gold' }];
          decline = { label: 'Absagen', to: 'abgesagt', toast: 'Anfrage abgesagt.', variant: 'outline' };
        } else {
          text = `Sie sind im Gespräch. Sobald beide Seiten einig sind, hält ${cp.name} die Vereinbarung fest.`;
        }
        break;
      case 'vereinbart':
        text = `Die Vereinbarung steht. Die Partnerschaft beginnt am ${formatDate(p.start)}.`;
        break;
      case 'aktiv':
        text = 'Die Partnerschaft läuft. Bestätigen Sie in der Liste oben, welche Gegenleistungen Sie erhalten haben.';
        break;
      case 'abgeschlossen':
        text = 'Diese Partnerschaft ist abgeschlossen.';
        break;
      case 'abgesagt':
        text = 'Sie haben diese Anfrage abgesagt.';
        break;
    }
  }

  const declineAction = decline;
  const secondaryAction = secondary;
  const thanks = role === 'seeker' && p.status === 'abgeschlossen' && !declined;
  const canViewAsSponsor = role === 'seeker' && p.status === 'anfrage' && state.sponsorId === p.sponsorId;
  const hintId = `ps-next-hint-${p.id}`;

  return (
    <section className="ui-card ui-card-dark ps-next" aria-labelledby="ps-next-title">
      <div className="ps-next-main">
        <h2 id="ps-next-title" ref={headingRef} tabIndex={-1}>Nächster Schritt</h2>
        <p className="ps-next-text">{text}</p>
        <div className="ps-next-actions">
          {actions.map((a) => <Button key={a.to} variant="gold" icon="arrowRight" onClick={() => run(a)}>{a.label}</Button>)}
          {declineAction && !confirmDecline && (
            <button ref={declineRef} type="button" className="ps-btn-outline" onClick={askDecline}>{declineAction.label}</button>
          )}
          {declineAction && confirmDecline && (
            <span
              className="ps-confirm"
              role="group"
              aria-labelledby={`${hintId}-q`}
              onKeyDown={(e) => { if (e.key === 'Escape') cancelDecline(); }}
            >
              <span id={`${hintId}-q`}>Anfrage wirklich absagen?</span>
              <button type="button" className="ps-btn-outline" onClick={() => run(declineAction)}>Ja, absagen</button>
              <button ref={cancelRef} type="button" className="ps-btn-plain" onClick={cancelDecline}>Abbrechen</button>
            </span>
          )}
          {secondaryAction && (
            <button type="button" className="ps-btn-outline" onClick={() => run(secondaryAction)}>{secondaryAction.label}</button>
          )}
          {role === 'seeker' && p.status === 'anfrage' && unsentRequest && (
            <Button href={href('ki-manager', unsentRequest.id)} variant="gold" icon="sparkles">Anfrage im KI-Manager prüfen</Button>
          )}
          {canViewAsSponsor && (
            <Button variant="gold" icon="building" onClick={viewAsSponsor}>Als Sponsor ansehen</Button>
          )}
          {declined && role === 'seeker' && (
            <Button href={href('partner')} variant="gold" icon="match">Passende Partner ansehen</Button>
          )}
          {thanks && (
            <a className="ui-btn ui-btn-gold ui-btn-md" href={href('ki-manager')} aria-describedby={hintId}>
              <Icon name="sparkles" size={18} /><span>Im KI-Manager entwerfen</span>
            </a>
          )}
        </div>
        {thanks && <p id={hintId} className="ps-next-hint">Wählen Sie dort {cp.name} als Empfänger und den Typ «Dank».</p>}
      </div>

      <div className="ps-steps-wrap">
        <p className="ps-steps-caption">
          {declined ? 'Nach der Anfrage abgesagt. Die weiteren Phasen entfallen.' : `Schritt ${stageIndex + 1} von ${STAGES.length}: ${statusLabel[p.status]}`}
        </p>
        <ol className={declined ? 'ps-steps is-declined' : 'ps-steps'} aria-label="Phasen der Partnerschaft">
          {STAGES.map((s, i) => {
            const cls = declined
              ? (i === 0 ? 'is-past' : 'is-void')
              : i < stageIndex ? 'is-past' : i === stageIndex ? 'is-current' : undefined;
            const current = !declined && i === stageIndex;
            return (
              <li key={s} className={cls} aria-current={current ? 'step' : undefined}>
                <span className="ps-step-dot" aria-hidden="true" />
                <span className="ps-step-label">{statusLabel[s]}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
