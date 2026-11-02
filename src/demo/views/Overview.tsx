import './overview.css';
import { useId, useRef, useState } from 'react';
import { DEMO_TODAY } from '../data';
import { daysUntil, draftTypeLabel, formatDate, formatDateShort, relativeDays } from '../format';
import { href } from '../router';
import { useDemo } from '../store';
import type { Deliverable, Draft, Partnership, Reminder, SeekerProfile } from '../types';
import { Avatar, Badge, Button, Card, CriteriaList, EmptyState, Icon, PageHeader, Progress, ScoreBadge, StatusBadge, useToast } from '../ui';

/* ---------- Small helpers (view-local) ---------- */

/** "1 Entwurf" / "2 Entwürfe" */
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const byDate = <T extends { date: string }>(a: T, b: T) => a.date.localeCompare(b.date);

/** Open deliverables of a partnership, earliest first. */
const openDeliverables = (p: Partnership): Deliverable[] =>
  p.deliverables.filter((d) => !d.done).sort((a, b) => a.due.localeCompare(b.due));

/** "überfällig seit 3 Tagen" / "seit gestern überfällig" */
function overdueText(iso: string): string {
  const d = -daysUntil(iso);
  return d === 1 ? 'seit gestern überfällig' : `seit ${d} Tagen überfällig`;
}

interface CheckItem { key: string; label: string; done: boolean; detail: string }

/** Same minimum as the bio rule in Profile.tsx, so both views count the profile the same way. */
const BIO_MIN = 80;

/** The same eight checks, with the same rules, as completeness() in Profile.tsx. */
function profileChecklist(p: SeekerProfile): CheckItem[] {
  const bioLen = p.bio.trim().length;
  const reachN = p.reach.filter((r) => r.label.trim() && r.value.trim()).length;
  const budgetOk = p.budget.max > 0 && p.budget.min <= p.budget.max;
  return [
    { key: 'name', label: 'Name', done: Boolean(p.name.trim()), detail: p.name.trim() || 'Noch leer' },
    { key: 'discipline', label: 'Sportart oder Sparte', done: Boolean(p.discipline.trim()), detail: p.discipline.trim() || 'Noch leer' },
    { key: 'bio', label: `Kurzbeschreibung mit mindestens ${BIO_MIN} Zeichen`, done: bioLen >= BIO_MIN, detail: bioLen ? `${bioLen} Zeichen` : 'Noch leer' },
    { key: 'needs', label: 'Mindestens eine Unterstützungsart', done: p.needs.length > 0, detail: p.needs.length ? p.needs.join(', ') : 'Noch nichts gewählt' },
    { key: 'industries', label: 'Mindestens eine Wunschbranche', done: p.preferredIndustries.length > 0, detail: p.preferredIndustries.length ? plural(p.preferredIndustries.length, 'Branche', 'Branchen') : 'Noch keine gewählt' },
    { key: 'budget', label: 'Budget pro Jahr', done: budgetOk, detail: budgetOk ? 'Angegeben' : 'Noch offen' },
    { key: 'offers', label: 'Mindestens drei Gegenleistungen', done: p.offers.length >= 3, detail: `${p.offers.length} erfasst` },
    { key: 'reach', label: 'Mindestens zwei Angaben zur Reichweite', done: reachN >= 2, detail: `${reachN} erfasst` },
  ];
}

/* ---------- View ---------- */

export default function Overview() {
  const { state, seeker, matches, sponsorById } = useDemo();

  const mine = state.partnerships.filter((p) => p.seekerId === seeker.id);
  const running = mine.filter((p) => p.status === 'aktiv' || p.status === 'vereinbart');
  // Counter-services only count as obligations once a partnership is agreed (aktiv/vereinbart).
  // The summary and the card below use the same basis, so their numbers match.
  const openCount = running.reduce((n, p) => n + openDeliverables(p).length, 0);
  const openPartnershipCount = running.filter((p) => p.deliverables.some((d) => !d.done)).length;
  const overdueCount = running.reduce((n, p) => n + openDeliverables(p).filter((d) => daysUntil(d.due) < 0).length, 0);
  // Planned counter-services in partnerships that are not agreed yet (Anfrage, Im Gespräch)
  const plannedCount = mine
    .filter((p) => p.status === 'anfrage' || p.status === 'gespraech')
    .reduce((n, p) => n + openDeliverables(p).length, 0);

  const partnered = new Set(mine.map((p) => p.sponsorId));
  const candidates = matches.filter((m) => !state.hidden.includes(m.sponsorId) && !partnered.has(m.sponsorId));
  // Same set as "Passende Partner" with the filter "Ab 3 von 4" (and as the count on Profil)
  const goodMatches = matches.filter((m) => m.score >= 3 && !state.hidden.includes(m.sponsorId)).length;
  const suggestions = candidates.slice(0, 3);

  const openReminders = state.reminders.filter((r) => !r.done).sort(byDate);
  const doneReminders = state.reminders.filter((r) => r.done).sort(byDate);

  const pending = state.drafts.filter((d) => d.status === 'entwurf').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const firstName = seeker.kind === 'athlete' ? seeker.name.split(/\s+/)[0] : seeker.name;

  const overdueReminders = openReminders.filter((r) => daysUntil(r.date) < 0).length;

  // One short sentence on what needs attention, most urgent first
  const attention = (() => {
    if (overdueCount > 0 || overdueReminders > 0) {
      const parts = [
        overdueCount > 0 ? `${plural(overdueCount, 'Gegenleistung ist', 'Gegenleistungen sind')} überfällig` : '',
        overdueReminders > 0 ? `${plural(overdueReminders, 'Termin ist', 'Termine sind')} überfällig` : '',
      ].filter(Boolean);
      return `${parts.join(', und ')}.`;
    }
    const next = openReminders[0];
    const nextPart = next ? `der nächste Termin ist ${relativeDays(next.date)}` : '';
    if (pending.length > 0) {
      const drafts = pending.length === 1 ? '1 Entwurf wartet' : `${pending.length} Entwürfe warten`;
      return `${drafts} auf Ihre Prüfung${nextPart ? `, und ${nextPart}` : ''}.`;
    }
    if (nextPart) return `${nextPart.charAt(0).toUpperCase()}${nextPart.slice(1)}.`;
    return 'Im Moment ist nichts offen.';
  })();

  return (
    <div className="ov">
      <PageHeader
        title={`Guten Tag, ${firstName}`}
        lead={<><span className="ov-date">Heute, {formatDate(DEMO_TODAY)}</span>{' '}{attention}</>}
      />

      <div className="ov-layout">
        <div className="ov-main">
          <section className="ov-summary" aria-labelledby="ov-summary-title">
            <h2 id="ov-summary-title" className="visually-hidden">Auf einen Blick</h2>
            <ul className="ov-summary-list">
              <SummaryItem
                value={running.length}
                label={running.length === 1 ? 'Laufende Partnerschaft' : 'Laufende Partnerschaften'}
                hint="Aktiv oder vereinbart"
                to={href('partnerschaften')}
              />
              <SummaryItem
                value={openCount}
                label={openCount === 1 ? 'Offene Gegenleistung' : 'Offene Gegenleistungen'}
                hint={openPartnershipCount > 0 ? `Aus ${plural(openPartnershipCount, 'Partnerschaft', 'Partnerschaften')}` : 'Alles erledigt'}
                to={href('partnerschaften')}
              />
              <SummaryItem
                value={goodMatches}
                label={goodMatches === 1 ? 'Passender Partner' : 'Passende Partner'}
                hint="Ab 3 von 4 Kriterien"
                to={href('partner')}
              />
            </ul>
          </section>

          <Reminders open={openReminders} done={doneReminders} />

          <Card title="Offene Gegenleistungen" action={<a className="ov-head-link" href={href('partnerschaften')}>Alle Partnerschaften</a>}>
            {running.length === 0 ? (
              <EmptyState
                title="Keine laufende Partnerschaft"
                text="Sobald eine Partnerschaft vereinbart ist, sehen Sie hier, was Sie als Gegenleistung zugesagt haben."
                action={<Button variant="ghost" size="sm" href={href('partner')}>Passende Partner ansehen</Button>}
              />
            ) : (
              <ul className="ov-deliv-list">
                {running.map((p) => {
                  const sponsor = sponsorById(p.sponsorId);
                  const open = openDeliverables(p);
                  const doneN = p.deliverables.length - open.length;
                  const next = open[0];
                  const overdue = open.filter((d) => daysUntil(d.due) < 0);
                  const name = sponsor?.name ?? 'Unbekannter Partner';
                  return (
                    <li key={p.id} className="ov-deliv">
                      <div className="ov-deliv-head">
                        <Avatar name={name} size={40} tone="gold" />
                        <div className="ov-deliv-title">
                          <h3>{name}</h3>
                          <p className="ov-small">{p.support.kind} · bis {formatDate(p.end)}</p>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>

                      <div className="ov-deliv-progress">
                        <Progress value={p.deliverables.length ? doneN / p.deliverables.length : 0} label={`Gegenleistungen für ${name}: ${doneN} von ${p.deliverables.length} erledigt`} />
                        <p className="ov-small" aria-hidden="true">{doneN} von {p.deliverables.length} erledigt</p>
                      </div>

                      {next ? (
                        <div className={`ov-deliv-next${overdue.length ? ' is-overdue' : ''}`}>
                          <p className="ov-deliv-next-label">Als Nächstes</p>
                          <p className="ov-deliv-next-text">{next.text}</p>
                          <p className="ov-deliv-next-due">
                            {daysUntil(next.due) < 0 ? (
                              <span className="ov-flag ov-flag-overdue"><Icon name="clock" size={14} />Fällig am {formatDateShort(next.due)}, {overdueText(next.due)}</span>
                            ) : daysUntil(next.due) <= 7 ? (
                              <span className="ov-flag ov-flag-soon"><Icon name="clock" size={14} />Fällig {relativeDays(next.due)}, am {formatDateShort(next.due)}</span>
                            ) : (
                              <>Fällig am {formatDateShort(next.due)} ({relativeDays(next.due)})</>
                            )}
                          </p>
                          {overdue.length > 1 && (
                            <p className="ov-small ov-overdue-more">Insgesamt {overdue.length} Gegenleistungen überfällig.</p>
                          )}
                        </div>
                      ) : (
                        <p className="ov-deliv-alldone"><Icon name="check" size={16} />Alle Gegenleistungen erledigt.</p>
                      )}

                      <a className="ov-arrow-link" href={href('partnerschaften', p.id)}>
                        Partnerschaft öffnen<span className="visually-hidden">: {name}</span>
                        <Icon name="arrowRight" size={16} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
            {plannedCount > 0 && (
              <p className="ov-small ov-planned-note">
                Dazu {plannedCount === 1 ? 'kommt 1 geplante Gegenleistung' : `kommen ${plannedCount} geplante Gegenleistungen`} aus
                Partnerschaften, die noch nicht vereinbart sind. Sie zählen erst mit, wenn die Partnerschaft vereinbart ist.
              </p>
            )}
          </Card>

          <Card title="Für Sie vorgeschlagen" action={<a className="ov-head-link" href={href('partner')}>Alle passenden Partner</a>}>
            {suggestions.length === 0 ? (
              <EmptyState
                title="Keine neuen Vorschläge"
                text="Ergänzen Sie Ihr Profil oder blenden Sie ausgeblendete Partner wieder ein."
                action={<Button variant="ghost" size="sm" href={href('partner')}>Zu den passenden Partnern</Button>}
              />
            ) : (
              <ul className="ov-sugg-list">
                {suggestions.map((m) => {
                  const sp = sponsorById(m.sponsorId);
                  if (!sp) return null;
                  const saved = state.shortlist.includes(sp.id);
                  return (
                    <li key={sp.id} className="ov-sugg">
                      <div className="ov-sugg-top">
                        <Avatar name={sp.name} size={44} tone="gold" />
                        <span className="ov-sugg-score" aria-hidden="true"><ScoreBadge score={m.score} /></span>
                      </div>
                      <h3 className="ov-sugg-name">
                        <a className="ov-sugg-link" href={href('partner', sp.id)}>
                          {sp.name}<span className="visually-hidden">, passt in {m.score} von 4 Kriterien</span>
                        </a>
                      </h3>
                      <p className="ov-small">{sp.industry} · {sp.region}</p>
                      {saved && <p className="ov-sugg-saved"><Badge tone="gold"><Icon name="star" size={12} />Gemerkt</Badge></p>}
                      <CriteriaList criteria={m.criteria} compact />
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <aside className="ov-side" aria-label="Profil und KI-Manager">
          <ProfileCard profile={seeker} />
          <AssistantCard pending={pending} sponsorName={(id) => sponsorById(id)?.name} />
        </aside>
      </div>
    </div>
  );
}

/* ---------- Summary ---------- */

function SummaryItem({ value, label, hint, to }: { value: number; label: string; hint: string; to: string }) {
  return (
    <li>
      <a className="ov-summary-item" href={to}>
        <span className="ov-summary-value">{value}</span>
        <span className="ov-summary-text">
          <span className="ov-summary-label">{label}</span>
          <span className="ov-summary-hint">{hint}</span>
        </span>
        <Icon name="arrowRight" size={18} className="ov-summary-arrow" />
      </a>
    </li>
  );
}

/* ---------- Reminders ---------- */

function Reminders({ open, done }: { open: Reminder[]; done: Reminder[] }) {
  const { dispatch } = useDemo();
  const toast = useToast();
  const [showDone, setShowDone] = useState(false);
  const doneListId = useId();
  const toggleRefs = useRef(new Map<string, HTMLButtonElement>());
  const disclosureRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLSpanElement>(null);

  const toggle = (r: Reminder, list: Reminder[]) => {
    const reopening = r.done;
    dispatch({ type: 'toggleReminder', reminderId: r.id });
    toast(reopening ? 'Termin wieder offen' : 'Termin erledigt');
    // The item moves to the other list: keep keyboard focus at a sensible place.
    // Reopened: follow the item into the open list. Marked done: go to the next open item.
    const i = list.findIndex((x) => x.id === r.id);
    const neighbour = list[i + 1] ?? list[i - 1];
    window.requestAnimationFrame(() => {
      const target = reopening
        ? toggleRefs.current.get(r.id)
        : neighbour ? toggleRefs.current.get(neighbour.id) : disclosureRef.current;
      (target ?? headingRef.current)?.focus();
    });
  };

  const row = (r: Reminder, list: Reminder[]) => {
    const d = daysUntil(r.date);
    const late = !r.done && d < 0;
    return (
      <li key={r.id} className={`ov-rem${r.done ? ' is-done' : ''}${late ? ' is-late' : ''}`}>
        <button
          type="button"
          className="ov-rem-toggle"
          aria-pressed={r.done}
          aria-label={`Erledigt: ${r.text}`}
          ref={(el) => { if (el) toggleRefs.current.set(r.id, el); else toggleRefs.current.delete(r.id); }}
          onClick={() => toggle(r, list)}
        >
          <span className="ov-rem-box" aria-hidden="true"><Icon name="check" size={14} /></span>
        </button>
        <div className="ov-rem-date">
          <span className="ov-rem-day">{formatDateShort(r.date)}</span>
          <span className="ov-rem-rel">{late ? `überfällig, ${relativeDays(r.date)}` : relativeDays(r.date)}</span>
        </div>
        <a className="ov-rem-text" href={r.href}>{r.text}</a>
      </li>
    );
  };

  return (
    <Card title={<span ref={headingRef} tabIndex={-1} className="ov-focus-anchor">Nächste Termine</span>} className="ov-reminders">
      {open.length === 0 ? (
        <p className="ov-rem-empty"><Icon name="check" size={16} />Keine offenen Termine.</p>
      ) : (
        <ul className="ov-rem-list">{open.map((r) => row(r, open))}</ul>
      )}
      {done.length > 0 && (
        <div className="ov-rem-done">
          <button
            ref={disclosureRef}
            type="button"
            className="ov-disclosure"
            aria-expanded={showDone}
            aria-controls={doneListId}
            onClick={() => setShowDone((v) => !v)}
          >
            <Icon name="arrowRight" size={16} className="ov-disclosure-icon" />
            Erledigt ({done.length})
          </button>
          <ul id={doneListId} className="ov-rem-list" hidden={!showDone}>{done.map((r) => row(r, done))}</ul>
        </div>
      )}
    </Card>
  );
}

/* ---------- Side column ---------- */

function ProfileCard({ profile }: { profile: SeekerProfile }) {
  const items = profileChecklist(profile);
  const doneN = items.filter((i) => i.done).length;
  const complete = doneN === items.length;
  if (complete) {
    return (
      <Card title="Ihr Profil" className="ov-profile">
        <p className="ov-profile-done">
          <span className="ov-check-mark" aria-hidden="true"><Icon name="check" size={14} /></span>
          <span><strong>Alle {items.length} Angaben ausgefüllt</strong></span>
        </p>
        <p className="ov-small ov-profile-note">Alles, was für das Matching zählt, ist erfasst. Änderungen wirken sich direkt auf die Vorschläge aus.</p>
        <Button variant="ghost" size="sm" href={href('profil')} icon="edit">Profil ansehen</Button>
      </Card>
    );
  }
  return (
    <Card title="Profil vervollständigen" className="ov-profile">
      <div className="ov-profile-meter">
        <p><strong>{doneN} von {items.length}</strong> Angaben ausgefüllt</p>
        <Progress value={doneN / items.length} label={`Profil: ${doneN} von ${items.length} Angaben ausgefüllt`} />
      </div>
      <p className="ov-small ov-profile-note">Je vollständiger das Profil, desto genauer die Vorschläge.</p>
      <ul className="ov-check-list">
        {items.map((it) => (
          <li key={it.key} className={it.done ? 'is-done' : 'is-open'}>
            <span className="ov-check-mark" aria-hidden="true">{it.done && <Icon name="check" size={14} />}</span>
            {it.done ? (
              <span className="ov-check-body">
                <span className="ov-check-label">{it.label}</span>
                <span className="ov-check-detail">{it.detail}</span>
                <span className="visually-hidden">: erledigt</span>
              </span>
            ) : (
              <a className="ov-check-body ov-check-link" href={href('profil')}>
                <span className="ov-check-label">{it.label}</span>
                <span className="ov-check-detail">{it.detail}<span className="visually-hidden">, jetzt ergänzen</span></span>
                <Icon name="arrowRight" size={16} />
              </a>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function AssistantCard({ pending, sponsorName }: {
  pending: Draft[];
  sponsorName: (id: string) => string | undefined;
}) {
  const newest = pending[0];
  return (
    <Card title={<span className="ov-ai-title"><Icon name="sparkles" size={20} />KI-Manager</span>} tone="dark" className="ov-ai">
      {newest ? (
        <>
          <p className="ov-ai-count">
            <span className="ov-ai-num">{pending.length}</span>
            {pending.length === 1 ? 'Entwurf wartet auf Ihre Prüfung' : 'Entwürfe warten auf Ihre Prüfung'}
          </p>
          <div className="ov-ai-draft">
            <p className="ov-ai-meta">
              <span className="ov-ai-type">{draftTypeLabel[newest.type]}</span>
              <span>An {sponsorName(newest.sponsorId) ?? 'unbekannten Partner'}</span>
              <span className="ov-nowrap">bearbeitet {formatDateShort(newest.updatedAt)}</span>
            </p>
            <p className="ov-ai-subject">{newest.subject}</p>
          </div>
          <Button variant="gold" href={href('ki-manager', newest.id)} icon="edit" className="ov-ai-btn">Neuesten Entwurf prüfen</Button>
          {pending.length > 1 && <a className="ov-ai-all" href={href('ki-manager')}>Alle Entwürfe ansehen</a>}
        </>
      ) : (
        <>
          <p className="ov-ai-count">Keine Entwürfe offen</p>
          <Button variant="gold" href={href('ki-manager')} className="ov-ai-btn">Zum KI-Manager</Button>
        </>
      )}
      <p className="ov-ai-note">
        <Icon name="check" size={14} />
        <span>Entwürfe gehen erst raus, wenn Sie sie geprüft haben. In der Demo sind es vorbereitete Beispieltexte, und es wird nichts versendet.</span>
      </p>
    </Card>
  );
}
