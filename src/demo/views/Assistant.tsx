import './assistant.css';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { DEMO_TODAY } from '../data';
import { draftStatusLabel, draftTypeLabel, formatDate, formatDateShort, relativeDays, statusLabel } from '../format';
import { href, navigate, useRoute } from '../router';
import { newId, useDemo } from '../store';
import { Avatar, Badge, Button, EmptyState, Field, Icon, PageHeader, Tabs, useToast, type IconName } from '../ui';
import type { Draft, DraftStatus, DraftType, Partnership, PartnershipStatus, SeekerProfile, Sponsor } from '../types';

// KI-Manager: the simulated AI sponsoring manager. Texts come from local templates (see generateDraft),
// never from a real model. Status flow: entwurf -> geprueft -> versendet (simulated, nothing is sent).

/* ---------- Constants ---------- */

const NEW_PARAM = 'neu';
const STATUSES: DraftStatus[] = ['entwurf', 'geprueft', 'versendet'];
const TAB_LABEL: Record<DraftStatus, string> = { entwurf: 'Entwürfe', geprueft: 'Geprüft', versendet: 'Versendet (simuliert)' };
// The type badge is neutral; the status uses its own tones so the two never look alike.
const STATUS_TONE = { entwurf: 'muted', geprueft: 'gold', versendet: 'success' } as const;
const EMPTY_TAB: Record<DraftStatus, string> = {
  entwurf: 'Keine offenen Entwürfe. Beginnen Sie einen neuen oder schauen Sie bei den geprüften nach.',
  geprueft: 'Noch nichts geprüft. Lesen Sie einen Entwurf und markieren Sie ihn danach als geprüft.',
  versendet: 'Noch nichts versendet.',
};

const TYPES: { value: DraftType; icon: IconName; text: string }[] = [
  { value: 'anfrage', icon: 'mail', text: 'Erster Kontakt mit einem möglichen Sponsor' },
  { value: 'update', icon: 'edit', text: 'Kurzer Stand zu Gegenleistungen und Saison' },
  { value: 'verlaengerung', icon: 'reset', text: 'Vorschlag für die nächste Saison' },
  { value: 'dank', icon: 'star', text: 'Danke zum Abschluss oder zwischendurch' },
];
const TYPE_ICON = Object.fromEntries(TYPES.map((t) => [t.value, t.icon])) as Record<DraftType, IconName>;

const WRITE_MS = 1000;

/* ---------- Helpers ---------- */

const motionAllowed = () => document.documentElement.classList.contains('motion');

/** Demo date plus the local clock time, exactly like now() in store.tsx, so drafts created here and there sort alike. */
const stamp = () => `${DEMO_TODAY}T${new Date().toTimeString().slice(0, 8)}`;

const joinList = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;

const asSentence = (s: string) => {
  const t = s.trim();
  if (!t) return '';
  const cap = t[0].toUpperCase() + t.slice(1);
  return /[.!?]$/.test(cap) ? cap : `${cap}.`;
};

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

const byNewest = (a: Draft, b: Draft) => b.updatedAt.localeCompare(a.updatedAt);

const PARTNERSHIP_ORDER: PartnershipStatus[] = ['aktiv', 'vereinbart', 'gespraech', 'anfrage', 'abgeschlossen'];
// Update, renewal and thanks speak of an agreed partnership, so a pending request or talk never counts there.
const AGREED_ORDER: PartnershipStatus[] = ['aktiv', 'vereinbart', 'abgeschlossen'];
const THANKS_ORDER: PartnershipStatus[] = ['abgeschlossen', 'aktiv', 'vereinbart'];

/**
 * The partnership a draft should refer to: the running one first, for thanks the finished one.
 * Without a type (or for a first request) any status counts; otherwise only agreed partnerships.
 */
function pickPartnership(all: Partnership[], seekerId: string, sponsorId: string, type?: DraftType): Partnership | undefined {
  const mine = all.filter((p) => p.seekerId === seekerId && p.sponsorId === sponsorId);
  const order = type === 'dank' ? THANKS_ORDER : type && type !== 'anfrage' ? AGREED_ORDER : PARTNERSHIP_ORDER;
  for (const status of order) {
    const p = mine.find((x) => x.status === status);
    if (p) return p;
  }
  return undefined;
}

/** The sponsor interest that matches the seeker's discipline, if any (the same check as matchFor in data.ts). */
const matchInterest = (seeker: SeekerProfile, sponsor: Sponsor) =>
  sponsor.interests.find((i) => seeker.discipline.toLowerCase().includes(i.toLowerCase()));

/** The goal a draft refers to. A first request only knows the sponsor's own goals. */
const goalFor = (type: DraftType, sponsor: Sponsor, partnership: Partnership | undefined) =>
  (type === 'anfrage' ? undefined : partnership?.goals[0]) ?? sponsor.goals[0];

interface Generated { subject: string; body: string }

/** Template-based "suggestion". Simulated: no model involved, only the profile, sponsor and partnership data. */
function generateDraft(type: DraftType, seeker: SeekerProfile, sponsor: Sponsor, partnership: Partnership | undefined, note: string): Generated {
  const we = seeker.kind !== 'athlete';
  const I = (ich: string, wir: string) => (we ? wir : ich);
  const goal = goalFor(type, sponsor, partnership);
  const done = partnership?.deliverables.filter((d) => d.done) ?? [];
  const open = partnership?.deliverables.filter((d) => !d.done) ?? [];
  const bullets = (items: string[]) => items.map((t) => `– ${t}`).join('\n');
  const noteLine = note.trim() ? `Ausserdem ${I('ist mir', 'ist uns')} ein Punkt wichtig: ${asSentence(note)}` : '';
  const sign = `Freundliche Grüsse\n${seeker.name}`;
  const compose = (subject: string, paragraphs: string[]): Generated => ({
    subject,
    body: ['Guten Tag', ...paragraphs.filter(Boolean), sign].join('\n\n'),
  });

  switch (type) {
    case 'anfrage': {
      // No article or preposition in front of name and discipline: both are free text in the profile.
      const intro = we
        ? `Wir schreiben Ihnen für ${seeker.name} (${seeker.discipline}, Region ${seeker.region}).`
        : `Ich bin ${seeker.name} und trainiere in der Region ${seeker.region} (${seeker.discipline}).`;
      const interest = matchInterest(seeker, sponsor);
      const fit = interest
        ? `Sie interessieren sich für ${interest}, und Ihr Ziel «${goal}» passt zu dem, was ${I('ich', 'wir')} anbieten ${I('kann', 'können')}:`
        : `Ihr Ziel «${goal}» passt zu dem, was ${I('ich', 'wir')} anbieten ${I('kann', 'können')}:`;
      return compose(`Anfrage für eine Partnerschaft: ${seeker.discipline}`, [
        intro,
        `Für die kommende Saison ${I('suche ich', 'suchen wir')} Unterstützung in Form von ${joinList(seeker.needs)}.`,
        `${fit}\n${bullets(seeker.offers.slice(0, 3))}`,
        noteLine,
        `Hätten Sie in den nächsten Wochen Zeit für ein kurzes Gespräch? ${I('Ich komme', 'Wir kommen')} gerne bei Ihnen vorbei.`,
      ]);
    }
    case 'update': {
      if (!partnership) {
        return compose(`Kurzes Update von ${seeker.name}`, [
          `Hier ein kurzer Stand aus ${I('meiner', 'unserer')} aktuellen Saison (${seeker.discipline}).`,
          `Für eine mögliche Zusammenarbeit ${I('könnte ich', 'könnten wir')} zum Beispiel Folgendes anbieten: ${joinList(seeker.offers.slice(0, 2))}.`,
          noteLine,
          `Gerne ${I('halte ich', 'halten wir')} Sie auf dem Laufenden.`,
        ]);
      }
      const progress = done.length
        ? `Von den vereinbarten Gegenleistungen ${I('habe ich', 'haben wir')} ${done.length} von ${partnership.deliverables.length} erledigt:\n${bullets(done.map((d) => d.text))}`
        : 'Die vereinbarten Gegenleistungen beginnen demnächst.';
      const next = open[0] ? `Als Nächstes steht an: ${open[0].text} (bis ${formatDate(open[0].due)}).` : 'Damit sind alle vereinbarten Gegenleistungen erledigt.';
      return compose('Update zu unserer Partnerschaft', [
        'Hier ein kurzer Stand zu unserer Partnerschaft.',
        progress,
        `${next} Ihr Ziel «${goal}» ${I('behalte ich', 'behalten wir')} dabei im Blick.`,
        noteLine,
        `Vielen Dank für Ihre Unterstützung. Bei Fragen ${I('bin ich', 'sind wir')} gerne für Sie da.`,
      ]);
    }
    case 'verlaengerung': {
      if (!partnership) {
        return compose('Zusammenarbeit in der nächsten Saison', [
          `${I('Ich würde', 'Wir würden')} gerne mit Ihnen über eine Zusammenarbeit in der nächsten Saison sprechen. Ihr Ziel «${goal}» passt gut zu ${I('meinem', 'unserem')} Angebot: ${joinList(seeker.offers.slice(0, 3))}.`,
          noteLine,
          'Hätten Sie in den nächsten zwei Wochen Zeit für ein Gespräch?',
        ]);
      }
      const runs = partnership.end >= DEMO_TODAY ? 'läuft' : 'lief';
      return compose('Verlängerung unserer Partnerschaft', [
        `Unsere Partnerschaft ${runs} bis zum ${formatDate(partnership.end)}.${done.length ? ` In dieser Zeit ${I('habe ich', 'haben wir')} umgesetzt:\n${bullets(done.map((d) => d.text))}` : ''}`,
        open.length ? `Noch offen ${open.length === 1 ? 'ist' : 'sind'}: ${joinList(open.map((d) => d.text))}.` : '',
        `${I('Ich würde', 'Wir würden')} die Zusammenarbeit gerne für die nächste Saison fortsetzen und dabei weiter auf Ihr Ziel «${goal}» eingehen.`,
        noteLine,
        'Hätten Sie in den nächsten zwei Wochen Zeit für ein Gespräch? Dabei könnten wir auf die Saison zurückschauen und die nächste planen.',
      ]);
    }
    case 'dank': {
      if (!partnership) {
        return compose('Danke für Ihre Zeit', [
          `${I('Ich möchte mich', 'Wir möchten uns')} herzlich für Ihr Interesse und Ihre Zeit bedanken.`,
          noteLine,
          `Gerne ${I('bleibe ich', 'bleiben wir')} mit Ihnen in Kontakt.`,
        ]);
      }
      return compose('Danke für Ihre Unterstützung', [
        `${I('Ich möchte mich', 'Wir möchten uns')} herzlich für Ihre Unterstützung bedanken: ${partnership.support.description}.`,
        done.length ? `Gemeinsam haben wir umgesetzt:\n${bullets(done.map((d) => d.text))}` : '',
        noteLine,
        `Gerne ${I('bleibe ich', 'bleiben wir')} mit Ihnen in Kontakt.`,
      ]);
    }
  }
}

/**
 * What the template for this type actually reads, for the "Daraus entsteht der Vorschlag" box.
 * Keep in sync with generateDraft: the box must not claim inputs the template ignores.
 */
function basisRows(type: DraftType, seeker: SeekerProfile, sponsor: Sponsor, partnership: Partnership | undefined): [string, string][] {
  const goal = goalFor(type, sponsor, partnership);
  const done = partnership?.deliverables.filter((d) => d.done) ?? [];
  const open = partnership?.deliverables.filter((d) => !d.done) ?? [];
  const progress = (p: Partnership) => `${done.length} von ${p.deliverables.length} Gegenleistungen erledigt`;
  switch (type) {
    case 'anfrage': {
      const interest = matchInterest(seeker, sponsor);
      const rows: [string, string][] = [
        ['Ihr Profil', `${seeker.name}, ${seeker.discipline}, Region ${seeker.region}`],
        ['Bedarf und Angebot', `${joinList(seeker.needs)}; ${joinList(seeker.offers.slice(0, 3))}`],
        ['Interessen des Sponsors', interest
          ? `${interest} passt zu Ihrer Disziplin und wird erwähnt.`
          : `${joinList(sponsor.interests)}. Keines passt direkt zu Ihrer Disziplin, der Text geht deshalb nur auf das Ziel ein.`],
        ['Ziel des Sponsors', goal],
      ];
      if (partnership) rows.push(['Partnerschaft', 'Wird für eine Anfrage nicht verwendet.']);
      return rows;
    }
    case 'update':
      return partnership
        ? [
            ['Partnerschaft', `${statusLabel[partnership.status]}, ${progress(partnership)}`],
            ['Als Nächstes', open[0] ? `${open[0].text} (bis ${formatDate(open[0].due)})` : 'Nichts mehr offen'],
            ['Ziel des Sponsors', goal],
          ]
        : [
            ['Ihr Profil', `${seeker.name}, ${seeker.discipline}`],
            ['Ihr Angebot', joinList(seeker.offers.slice(0, 2))],
            ['Partnerschaft', 'Noch keine vereinbart. Der Vorschlag bleibt deshalb allgemeiner.'],
          ];
    case 'verlaengerung':
      return partnership
        ? [
            ['Partnerschaft', `${statusLabel[partnership.status]} bis ${formatDate(partnership.end)}, ${progress(partnership)}`],
            ['Ziel des Sponsors', goal],
          ]
        : [
            ['Ihr Angebot', joinList(seeker.offers.slice(0, 3))],
            ['Ziel des Sponsors', goal],
            ['Partnerschaft', 'Noch keine vereinbart. Der Vorschlag bleibt deshalb allgemeiner.'],
          ];
    case 'dank':
      return partnership
        ? [
            ['Unterstützung', partnership.support.description],
            ['Umgesetzt', done.length ? joinList(done.map((d) => d.text)) : 'Noch keine Gegenleistung erledigt'],
          ]
        : [['Partnerschaft', 'Noch keine vereinbart. Der Text dankt allgemein für Interesse und Zeit.']];
  }
}

/**
 * Sensible default recipient for a draft type: a first request goes to a sponsor from the shortlist,
 * updates and renewals to a running partnership, thanks to a finished one.
 */
function defaultRecipient(type: DraftType, withPartnership: { sponsor: Sponsor; partnership: Partnership }[], shortlisted: Sponsor[]): string {
  const byStatus = (statuses: PartnershipStatus[]) => {
    for (const s of statuses) {
      const hit = withPartnership.find((x) => x.partnership.status === s);
      if (hit) return hit.sponsor.id;
    }
    return undefined;
  };
  const first = withPartnership[0]?.sponsor.id ?? shortlisted[0]?.id ?? '';
  switch (type) {
    case 'anfrage': return shortlisted[0]?.id ?? byStatus(['anfrage', 'gespraech']) ?? first;
    case 'update':
    case 'verlaengerung': return byStatus(['aktiv', 'vereinbart']) ?? first;
    case 'dank': return byStatus(['abgeschlossen', 'aktiv', 'vereinbart']) ?? first;
  }
}

interface Preset { type: DraftType; sponsorId?: string; nonce: number }

/* ---------- View ---------- */

export default function Assistant() {
  const { state } = useDemo();
  const route = useRoute();
  const param = route.name === 'ki-manager' ? route.param : undefined;
  const isNew = param === NEW_PARAM;
  const selected = param && !isNew ? state.drafts.find((d) => d.id === param) : undefined;

  // The list follows the selected draft (e.g. after "Als geprüft markieren" it moves to "Geprüft").
  const [tab, setTab] = useState<DraftStatus>(selected?.status ?? 'entwurf');
  const syncKey = selected ? `${selected.id}:${selected.status}` : '';
  const [lastSync, setLastSync] = useState(syncKey);
  if (syncKey !== lastSync) {
    setLastSync(syncKey);
    if (selected) setTab(selected.status);
  }

  const [preset, setPreset] = useState<Preset>({ type: 'anfrage', nonce: 0 });
  const startNew = (p?: { type: DraftType; sponsorId?: string }) => {
    setPreset((prev) => ({ type: p?.type ?? 'anfrage', sponsorId: p?.sponsorId, nonce: prev.nonce + 1 }));
    navigate('ki-manager', NEW_PARAM);
  };

  let detail;
  if (isNew) detail = <NewDraft key={preset.nonce} preset={preset} />;
  else if (selected) detail = <DraftEditor key={selected.id} draft={selected} />;
  else if (param) {
    detail = (
      <div className="as-pane-card">
        <EmptyState
          title="Entwurf nicht gefunden"
          text="Vielleicht wurde er gelöscht oder die Vorschau zurückgesetzt."
          action={<Button variant="ghost" href={href('ki-manager')} icon="arrowLeft">Zu allen Entwürfen</Button>}
        />
      </div>
    );
  } else detail = <NextSteps onNew={startNew} />;

  const view = param ? 'detail' : 'list';

  // Narrow widths: the detail is its own screen. The back link is the first thing in the header there,
  // and assistant.css hides lead and principle card so the editor starts near the top (wide: hidden link).
  return (
    <div className="as-root" data-view={view}>
      <PageHeader
        title="KI-Manager"
        back={param ? { href: href('ki-manager'), label: 'Alle Entwürfe' } : undefined}
        lead="Der KI-Manager bereitet Anfragen, Updates und Dankesnachrichten für Sie vor. Sie lesen, passen an und entscheiden, was rausgeht."
      />

      <Principle />

      <div className="as-layout" data-view={view}>
        <div className="as-side">
          <DraftList tab={tab} onTab={setTab} selectedId={selected?.id} onNew={() => startNew()} />
          <Reminders />
        </div>
        <div className="as-detail">{detail}</div>
      </div>
    </div>
  );
}

/* ---------- Principle ---------- */

function Principle() {
  const id = useId();
  return (
    <section className="as-principle" aria-labelledby={id}>
      <span className="as-principle-mark" aria-hidden="true"><Icon name="check" size={22} /></span>
      <div className="as-principle-copy">
        <h2 id={id}>Entwürfe gehen erst raus, wenn Sie sie geprüft haben.</h2>
        <p>Der KI-Manager bereitet vor, Sie behalten das letzte Wort.</p>
      </div>
      <ol className="as-flow" aria-label="Ablauf eines Entwurfs">
        <li><span className="as-flow-dot" aria-hidden="true" />Entwurf</li>
        <li><span className="as-flow-dot" aria-hidden="true" />Von Ihnen geprüft</li>
        <li><span className="as-flow-dot" aria-hidden="true" />Versendet (simuliert)</li>
      </ol>
    </section>
  );
}

/* ---------- Left pane ---------- */

function DraftList({ tab, onTab, selectedId, onNew }: { tab: DraftStatus; onTab: (s: DraftStatus) => void; selectedId?: string; onNew: () => void }) {
  const { state, sponsorById } = useDemo();
  const headingId = useId();
  const counts = useMemo(() => {
    const c: Record<DraftStatus, number> = { entwurf: 0, geprueft: 0, versendet: 0 };
    for (const d of state.drafts) c[d.status] += 1;
    return c;
  }, [state.drafts]);
  const items = state.drafts.filter((d) => d.status === tab).sort(byNewest);

  return (
    <section className="as-pane-card as-list" aria-labelledby={headingId}>
      <div className="as-list-head">
        <h2 id={headingId}>Ihre Entwürfe</h2>
        <Button variant="gold" size="sm" icon="plus" onClick={onNew}>Neuer Entwurf</Button>
      </div>

      <Tabs
        label="Entwürfe nach Status"
        value={tab}
        onChange={onTab}
        items={STATUSES.map((s) => ({ value: s, label: TAB_LABEL[s], count: counts[s] }))}
      />

      <div role="tabpanel" aria-label={TAB_LABEL[tab]} className="as-list-panel">
        {items.length === 0 ? (
          <p className="as-list-empty">{EMPTY_TAB[tab]}</p>
        ) : (
          <ul className="as-items">
            {items.map((d) => {
              const current = d.id === selectedId;
              return (
                <li key={d.id}>
                  <a className="as-item" href={href('ki-manager', d.id)} aria-current={current ? 'true' : undefined}>
                    <span className="as-item-top">
                      <Badge tone="neutral">{draftTypeLabel[d.type]}</Badge>
                      <span className="as-item-date">{formatDateShort(d.updatedAt)}</span>
                    </span>
                    <span className="as-item-name">{sponsorById(d.sponsorId)?.name ?? 'Unbekannter Sponsor'}</span>
                    <span className="as-item-subject">{d.subject || 'Ohne Betreff'}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function Reminders() {
  const { state } = useDemo();
  const headingId = useId();
  const open = state.reminders.filter((r) => !r.done).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  if (open.length === 0) return null;
  return (
    <section className="as-reminders" aria-labelledby={headingId}>
      <h2 id={headingId}>Nächste Termine</h2>
      <ul>
        {open.map((r) => (
          <li key={r.id}>
            <a href={r.href} className="as-reminder">
              <span className="as-reminder-date">
                <span>{formatDateShort(r.date)}</span>
                <span className="as-reminder-rel">{relativeDays(r.date)}</span>
              </span>
              <span className="as-reminder-text">{r.text}</span>
              <Icon name="arrowRight" size={16} className="as-reminder-arrow" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Empty state: next steps ---------- */

interface Step { key: string; icon: IconName; title: string; text: string; href?: string; onClick?: () => void }

function NextSteps({ onNew }: { onNew: (p?: { type: DraftType; sponsorId?: string }) => void }) {
  const { state, seeker, sponsorById } = useDemo();
  const headingId = useId();

  const steps = (() => {
    const out: Step[] = [];
    const drafts = [...state.drafts].sort(byNewest);
    const name = (id: string) => sponsorById(id)?.name ?? 'Sponsor';
    const hasOpenDraft = (type: DraftType, sponsorId: string) =>
      state.drafts.some((d) => d.type === type && d.sponsorId === sponsorId && d.status !== 'versendet');

    const toReview = drafts.find((d) => d.status === 'entwurf');
    if (toReview) {
      out.push({
        key: 'review', icon: 'check', href: href('ki-manager', toReview.id),
        title: 'Offenen Entwurf prüfen',
        text: `${draftTypeLabel[toReview.type]} an ${name(toReview.sponsorId)}, zuletzt bearbeitet am ${formatDateShort(toReview.updatedAt)}`,
      });
    }
    const toSend = drafts.find((d) => d.status === 'geprueft');
    if (toSend) {
      out.push({
        key: 'send', icon: 'mail', href: href('ki-manager', toSend.id),
        title: 'Geprüften Entwurf senden',
        text: `${draftTypeLabel[toSend.type]} an ${name(toSend.sponsorId)} (Versand simuliert).`,
      });
    }
    const mine = state.partnerships.filter((p) => p.seekerId === seeker.id);
    for (const p of mine.filter((x) => x.status === 'aktiv' || x.status === 'vereinbart').sort((a, b) => a.end.localeCompare(b.end))) {
      if (!hasOpenDraft('verlaengerung', p.sponsorId)) {
        out.push({
          key: `renew-${p.id}`, icon: 'reset', onClick: () => onNew({ type: 'verlaengerung', sponsorId: p.sponsorId }),
          title: 'Verlängerung vorschlagen',
          text: `Die Partnerschaft mit ${name(p.sponsorId)} endet am ${formatDate(p.end)}.`,
        });
      }
      if (!hasOpenDraft('update', p.sponsorId)) {
        const done = p.deliverables.filter((d) => d.done).length;
        out.push({
          key: `update-${p.id}`, icon: 'edit', onClick: () => onNew({ type: 'update', sponsorId: p.sponsorId }),
          title: `Update an ${name(p.sponsorId)}`,
          text: `${done} von ${p.deliverables.length} Gegenleistungen erledigt. Ein kurzer Stand hält den Kontakt warm.`,
        });
      }
    }
    for (const p of mine.filter((x) => x.status === 'abgeschlossen')) {
      if (!hasOpenDraft('dank', p.sponsorId)) {
        out.push({
          key: `thanks-${p.id}`, icon: 'star', onClick: () => onNew({ type: 'dank', sponsorId: p.sponsorId }),
          title: `Dank an ${name(p.sponsorId)}`,
          text: 'Die Partnerschaft ist abgeschlossen. Ein Dank erleichtert ein späteres Wiedersehen.',
        });
      }
    }
    out.push({
      key: 'new', icon: 'plus', onClick: () => onNew(),
      title: 'Neue Anfrage vorbereiten',
      text: 'An einen Sponsor von Ihrer Merkliste oder aus einer laufenden Partnerschaft.',
    });
    return out.slice(0, 3);
  })();

  return (
    <section className="as-pane-card as-next" aria-labelledby={headingId}>
      <span className="as-next-mark" aria-hidden="true"><Icon name="sparkles" size={24} /></span>
      <h2 id={headingId}>Was möchten Sie vorbereiten?</h2>
      <p className="as-next-lead">
        Öffnen Sie einen Entwurf aus der Liste oder beginnen Sie mit einem dieser Schritte. Der KI-Manager schlägt einen Text vor, Sie prüfen ihn, und erst dann wird er (simuliert) versendet.
      </p>
      <ul className="as-steps">
        {steps.map((s) => {
          const inner = (
            <>
              <span className="as-step-icon" aria-hidden="true"><Icon name={s.icon} size={20} /></span>
              <span className="as-step-copy">
                <span className="as-step-title">{s.title}</span>
                <span className="as-step-text">{s.text}</span>
              </span>
              <Icon name="arrowRight" size={18} className="as-step-arrow" />
            </>
          );
          return (
            <li key={s.key}>
              {s.href
                ? <a className="as-step" href={s.href}>{inner}</a>
                : <button type="button" className="as-step" onClick={s.onClick}>{inner}</button>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------- Status steps ---------- */

function StatusSteps({ status }: { status: DraftStatus }) {
  const at = STATUSES.indexOf(status);
  const labels: Record<DraftStatus, string> = { entwurf: 'Entwurf', geprueft: 'Geprüft', versendet: 'Versendet (simuliert)' };
  return (
    <ol className="as-status" aria-label="Status des Entwurfs">
      {STATUSES.map((s, i) => (
        <li key={s} className={i < at ? 'is-done' : i === at ? 'is-current' : undefined} aria-current={i === at ? 'step' : undefined}>
          <span className="as-status-dot" aria-hidden="true">{i < at && <Icon name="check" size={12} />}</span>
          {labels[s]}
        </li>
      ))}
    </ol>
  );
}

/* ---------- Recipient card ---------- */

function Recipient({ sponsor, type, status, partnership }: { sponsor?: Sponsor; type: DraftType; status: DraftStatus; partnership?: Partnership }) {
  return (
    <div className="as-recipient">
      <Avatar name={sponsor?.name ?? '?'} tone="gold" size={48} />
      <div className="as-recipient-copy">
        <p className="as-recipient-label">An</p>
        <p className="as-recipient-name">{sponsor?.name ?? 'Unbekannter Sponsor'}</p>
        {sponsor && <p className="as-recipient-meta">{sponsor.industry} · Kontakt: {sponsor.contact}</p>}
        {partnership && (
          <a className="as-recipient-link" href={href('partnerschaften', partnership.id)}>
            Partnerschaft ansehen ({statusLabel[partnership.status]})
          </a>
        )}
      </div>
      <div className="as-recipient-badges">
        <Badge tone="neutral"><Icon name={TYPE_ICON[type]} size={14} />{draftTypeLabel[type]}</Badge>
        <Badge tone={STATUS_TONE[status]}>
          <span className="as-badge-dot" aria-hidden="true" />
          <span className="visually-hidden">Status: </span>{draftStatusLabel[status]}
        </Badge>
      </div>
    </div>
  );
}

/* ---------- Editor ---------- */

function DraftEditor({ draft }: { draft: Draft }) {
  const { state, seeker, sponsorById, dispatch } = useDemo();
  const toast = useToast();
  const ids = useId();
  const sponsor = sponsorById(draft.sponsorId);
  // The link in the recipient card may also lead to a pending request, so fall back to any status.
  const partnership = pickPartnership(state.partnerships, seeker.id, draft.sponsorId, draft.type)
    ?? pickPartnership(state.partnerships, seeker.id, draft.sponsorId);

  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [error, setError] = useState<{ field: 'subject' | 'body'; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);
  const reopenFocus = useRef(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const sentNoteRef = useRef<HTMLParagraphElement>(null);
  // After a status change the focused button is swapped or removed; these say where focus goes next.
  const focusAfter = useRef<'send' | 'sent' | null>(null);

  const dirty = subject !== draft.subject || body !== draft.body;
  const readOnly = draft.status === 'versendet';
  const reviewed = draft.status === 'geprueft';

  useEffect(() => {
    if (confirmDelete) confirmRef.current?.focus();
    else if (reopenFocus.current) { reopenFocus.current = false; deleteRef.current?.focus(); }
  }, [confirmDelete]);

  useEffect(() => {
    const target = focusAfter.current;
    focusAfter.current = null;
    if (target === 'send') actionsRef.current?.querySelector<HTMLButtonElement>('.as-send')?.focus();
    else if (target === 'sent') sentNoteRef.current?.focus();
  }, [draft.status]);

  const validate = () => {
    if (!subject.trim()) {
      setError({ field: 'subject', text: 'Bitte geben Sie einen Betreff ein.' });
      subjectRef.current?.focus();
      return false;
    }
    if (!body.trim()) {
      setError({ field: 'body', text: 'Der Text ist leer. Bitte schreiben Sie ein paar Zeilen.' });
      bodyRef.current?.focus();
      return false;
    }
    setError(null);
    return true;
  };

  const save = (silent = false) => {
    if (!validate()) return false;
    if (!dirty) return true;
    dispatch({ type: 'updateDraft', draftId: draft.id, patch: { subject: subject.trim(), body } });
    setSubject(subject.trim());
    if (!silent) toast(reviewed ? 'Gespeichert. Der Entwurf muss erneut geprüft werden.' : 'Entwurf gespeichert');
    return true;
  };

  const onSubmit = (e: FormEvent) => { e.preventDefault(); save(); };

  const onKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
  };

  const markReviewed = () => {
    if (!save(true)) return;
    focusAfter.current = 'send';
    dispatch({ type: 'setDraftStatus', draftId: draft.id, status: 'geprueft' });
    toast('Als geprüft markiert');
  };

  const backToDraft = () => {
    dispatch({ type: 'setDraftStatus', draftId: draft.id, status: 'entwurf' });
    toast('Wieder als Entwurf markiert');
  };

  const canSend = reviewed && !dirty;
  const send = () => {
    if (!canSend) {
      toast(reviewed
        ? 'Bitte zuerst speichern und den Entwurf erneut prüfen.'
        : 'Bitte zuerst als geprüft markieren.');
      return;
    }
    focusAfter.current = 'sent';
    dispatch({ type: 'setDraftStatus', draftId: draft.id, status: 'versendet' });
    toast('Versendet (simuliert).');
  };

  const remove = () => {
    dispatch({ type: 'deleteDraft', draftId: draft.id });
    navigate('ki-manager');
    toast('Entwurf gelöscht');
  };

  const cancelDelete = () => { reopenFocus.current = true; setConfirmDelete(false); };

  const copyAsDraft = () => {
    const id = newId('d');
    dispatch({ type: 'createDraft', draft: { ...draft, id, subject: draft.subject, status: 'entwurf', updatedAt: stamp() } });
    navigate('ki-manager', id);
    toast('Kopie als Entwurf erstellt');
  };

  const sendHintId = `${ids}-send`;
  const errorId = `${ids}-error`;

  const deleteControls = confirmDelete ? (
    <div className="as-confirm" role="group" aria-label="Löschen bestätigen" onKeyDown={(e) => { if (e.key === 'Escape') cancelDelete(); }}>
      <span className="as-confirm-text">Diesen Entwurf endgültig löschen?</span>
      <button ref={confirmRef} type="button" className="ui-btn ui-btn-danger ui-btn-md" onClick={remove}>
        <Icon name="trash" size={18} /><span>Ja, löschen</span>
      </button>
      <Button variant="quiet" onClick={cancelDelete}>Abbrechen</Button>
    </div>
  ) : (
    <button ref={deleteRef} type="button" className="ui-btn ui-btn-quiet ui-btn-md as-delete" onClick={() => setConfirmDelete(true)}>
      <Icon name="trash" size={18} /><span>Löschen</span>
    </button>
  );

  const footer = (
    <div className="as-footer">
      <p className="as-footer-meta">
        {readOnly ? 'Nur noch lesbar' : `Zuletzt bearbeitet am ${formatDate(draft.updatedAt)}`}
        {!readOnly && <span className="as-footer-key"> · Speichern auch mit Ctrl+S oder ⌘S</span>}
      </p>
      {deleteControls}
    </div>
  );

  return (
    <article className="as-pane-card as-editor" aria-labelledby={`${ids}-title`}>
      <h2 id={`${ids}-title`} className="visually-hidden">{draftTypeLabel[draft.type]} an {sponsor?.name ?? 'Sponsor'}</h2>
      <StatusSteps status={draft.status} />
      <Recipient sponsor={sponsor} type={draft.type} status={draft.status} partnership={partnership} />

      {readOnly ? (
        <>
          <div className="as-letter">
            <p className="as-letter-subject"><span className="visually-hidden">Betreff: </span>{draft.subject}</p>
            <div className="as-letter-body">{draft.body}</div>
          </div>
          <p ref={sentNoteRef} tabIndex={-1} className="as-note as-focus-anchor">
            <Icon name="check" size={16} />
            Am {formatDate(draft.updatedAt)} versendet (simuliert). Versendete Entwürfe lassen sich nicht mehr bearbeiten.
          </p>
          <div className="as-actions">
            <Button variant="ghost" icon="edit" onClick={copyAsDraft}>Als neuen Entwurf übernehmen</Button>
          </div>
          {footer}
        </>
      ) : (
        <form className="as-form" onSubmit={onSubmit} onKeyDown={onKeyDown} noValidate>
          <Field label="Betreff" htmlFor={`${ids}-subject`}>
            <input
              ref={subjectRef}
              id={`${ids}-subject`}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              aria-invalid={error?.field === 'subject' || undefined}
              aria-describedby={error?.field === 'subject' ? errorId : undefined}
            />
          </Field>
          <Field label="Text" htmlFor={`${ids}-body`} hint={`${wordCount(body)} Wörter${dirty ? ' · Nicht gespeicherte Änderungen' : ''}`}>
            <textarea
              ref={bodyRef}
              id={`${ids}-body`}
              value={body}
              rows={14}
              onChange={(e) => setBody(e.target.value)}
              aria-invalid={error?.field === 'body' || undefined}
              aria-describedby={error?.field === 'body' ? `${errorId} ${ids}-body-hint` : `${ids}-body-hint`}
            />
          </Field>
          {error && <p id={errorId} className="as-error" role="alert">{error.text}</p>}

          {reviewed && dirty && (
            <p className="as-note as-note-gold">
              <Icon name="clock" size={16} />
              Wenn Sie diese Änderungen speichern, wird der Entwurf wieder auf «Entwurf» gesetzt und muss erneut geprüft werden.
            </p>
          )}

          <div ref={actionsRef} className="as-actions">
            {/* aria-disabled instead of disabled: the focused button keeps focus after saving */}
            <Button type="submit" variant={dirty ? 'navy' : 'ghost'} aria-disabled={!dirty || undefined}>Speichern</Button>
            {reviewed ? (
              <Button variant="quiet" onClick={backToDraft} disabled={dirty}>Zurück zu Entwurf</Button>
            ) : (
              <Button variant="ghost" icon="check" onClick={markReviewed}>Als geprüft markieren</Button>
            )}
            <Button
              variant="gold"
              icon="mail"
              className="as-send"
              onClick={send}
              aria-disabled={!canSend || undefined}
              aria-describedby={!canSend ? sendHintId : undefined}
            >
              Senden (simuliert)
            </Button>
          </div>
          {!canSend && (
            <p id={sendHintId} className="as-send-hint">
              {dirty && reviewed
                ? 'Speichern Sie Ihre Änderungen und prüfen Sie den Entwurf erneut, bevor Sie ihn senden.'
                : 'Senden ist erst möglich, wenn Sie den Entwurf als geprüft markiert haben.'}
            </p>
          )}
          {footer}
        </form>
      )}
    </article>
  );
}

/* ---------- New draft ---------- */

interface Writing extends Generated { type: DraftType; sponsorId: string }

function NewDraft({ preset }: { preset: Preset }) {
  const { state, seeker, sponsorById, dispatch } = useDemo();
  const toast = useToast();
  const ids = useId();

  const recipients = useMemo(() => {
    const withPartnership: { sponsor: Sponsor; partnership: Partnership }[] = [];
    const shortlisted: Sponsor[] = [];
    for (const sp of state.sponsors) {
      const p = pickPartnership(state.partnerships, seeker.id, sp.id);
      if (p) withPartnership.push({ sponsor: sp, partnership: p });
      else if (state.shortlist.includes(sp.id)) shortlisted.push(sp);
    }
    return { withPartnership, shortlisted, all: [...withPartnership.map((x) => x.sponsor), ...shortlisted] };
  }, [state.sponsors, state.partnerships, state.shortlist, seeker.id]);

  const presetValid = !!preset.sponsorId && recipients.all.some((s) => s.id === preset.sponsorId);
  const [type, setType] = useState<DraftType>(preset.type);
  const [sponsorId, setSponsorId] = useState(() =>
    presetValid && preset.sponsorId ? preset.sponsorId : defaultRecipient(preset.type, recipients.withPartnership, recipients.shortlisted),
  );
  // Once the recipient was chosen (by hand or by a next-step preset), changing the type no longer moves it.
  const [recipientTouched, setRecipientTouched] = useState(presetValid);
  const [note, setNote] = useState('');
  const [writing, setWriting] = useState<Writing | null>(null);
  const [shown, setShown] = useState(0);
  const finished = useRef(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const sponsor = sponsorById(sponsorId);
  const partnership = sponsor ? pickPartnership(state.partnerships, seeker.id, sponsor.id, type) : undefined;

  // Typewriter reveal (~1 s), then store the draft and open it. Cancelling or leaving the view
  // (unmount) clears both the frame and the final timeout, so nothing is created afterwards.
  useEffect(() => {
    if (!writing) return;
    let cancelled = false;
    const finish = () => {
      if (cancelled || finished.current) return;
      finished.current = true;
      const id = newId('d');
      dispatch({ type: 'createDraft', draft: { id, type: writing.type, sponsorId: writing.sponsorId, subject: writing.subject, body: writing.body, status: 'entwurf', updatedAt: stamp() } });
      navigate('ki-manager', id);
      toast('Entwurf erstellt');
    };
    if (!motionAllowed()) { finish(); return; }
    previewRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const total = writing.subject.length + writing.body.length;
    const start = performance.now();
    let raf = 0;
    let timer = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / WRITE_MS);
      setShown(Math.round(p * total));
      if (p < 1) raf = requestAnimationFrame(tick);
      else timer = window.setTimeout(finish, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [writing, dispatch, toast]);

  if (recipients.all.length === 0) {
    return (
      <div className="as-pane-card">
        <EmptyState
          title="Noch kein Sponsor für einen Entwurf"
          text="Setzen Sie zuerst Sponsoren auf Ihre Merkliste. Danach bereitet der KI-Manager eine Anfrage für Sie vor."
          action={<Button variant="gold" href={href('partner')} icon="match">Passende Partner ansehen</Button>}
        />
      </div>
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!sponsor || writing) return;
    setShown(0);
    setWriting({ ...generateDraft(type, seeker, sponsor, partnership, note), type, sponsorId: sponsor.id });
  };

  const cancelWriting = () => {
    setWriting(null);
    setShown(0);
    toast('Vorschlag verworfen');
    // The busy "Abbrechen" button is replaced by a link, so hand focus back to the submit button.
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus());
  };

  const changeType = (t: DraftType) => {
    setType(t);
    if (!recipientTouched) setSponsorId(defaultRecipient(t, recipients.withPartnership, recipients.shortlisted));
  };

  // A first request to a sponsor the seeker already works with is possible, but rarely what is meant.
  const existing = recipients.withPartnership.find((x) => x.sponsor.id === sponsorId)?.partnership;
  const anfrageToPartner = type === 'anfrage' && !!existing && ['vereinbart', 'aktiv', 'abgeschlossen'].includes(existing.status);

  const partnerGroup = recipients.withPartnership.length > 0 && (
    <optgroup label="Mit Partnerschaft">
      {recipients.withPartnership.map(({ sponsor: s, partnership: p }) => (
        <option key={s.id} value={s.id}>{s.name} · {statusLabel[p.status]}</option>
      ))}
    </optgroup>
  );
  const shortlistGroup = recipients.shortlisted.length > 0 && (
    <optgroup label="Auf der Merkliste">
      {recipients.shortlisted.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
    </optgroup>
  );

  const busy = writing !== null;
  const subjectShown = writing ? writing.subject.slice(0, Math.min(shown, writing.subject.length)) : '';
  const bodyShown = writing ? writing.body.slice(0, Math.max(0, shown - writing.subject.length)) : '';

  return (
    <section className="as-pane-card as-new" aria-labelledby={`${ids}-title`}>
      <div className="as-new-head">
        <span className="as-next-mark" aria-hidden="true"><Icon name="sparkles" size={22} /></span>
        <div>
          <h2 id={`${ids}-title`}>Neuer Entwurf</h2>
          <p className="as-new-lead">Wählen Sie Art und Empfänger. Der Vorschlag landet als Entwurf in Ihrer Liste, versendet wird nichts.</p>
        </div>
      </div>

      <p className="as-sim">
        <Icon name="sparkles" size={16} />
        <span><strong>Simulierter Vorschlag:</strong> In der Vorschau schreibt eine Vorlage den Text, keine echte KI.</span>
      </p>

      <form ref={formRef} className="as-form" onSubmit={onSubmit}>
        <fieldset className="as-types" disabled={busy}>
          <legend>Art des Entwurfs</legend>
          <div className="as-types-grid">
            {TYPES.map((t) => (
              <label key={t.value} className="as-type">
                <input type="radio" name={`${ids}-type`} value={t.value} checked={type === t.value} onChange={() => changeType(t.value)} />
                <span className="as-type-icon" aria-hidden="true"><Icon name={t.icon} size={18} /></span>
                <span className="as-type-copy">
                  <span className="as-type-title">{draftTypeLabel[t.value]}</span>
                  <span className="as-type-text">{t.text}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Empfänger" htmlFor={`${ids}-sponsor`} hint="Sponsoren mit Partnerschaft und von Ihrer Merkliste.">
          <select
            id={`${ids}-sponsor`}
            value={sponsorId}
            onChange={(e) => { setSponsorId(e.target.value); setRecipientTouched(true); }}
            disabled={busy}
            aria-describedby={anfrageToPartner ? `${ids}-sponsor-hint ${ids}-partner-hint` : `${ids}-sponsor-hint`}
          >
            {type === 'anfrage' ? <>{shortlistGroup}{partnerGroup}</> : <>{partnerGroup}{shortlistGroup}</>}
          </select>
        </Field>
        {anfrageToPartner && existing && (
          <p id={`${ids}-partner-hint`} className="as-note as-note-gold">
            <Icon name="handshake" size={16} />
            Mit {sponsor?.name} besteht bereits eine Partnerschaft ({statusLabel[existing.status]}). Eine Anfrage ist für den ersten Kontakt gedacht; für laufende Partnerschaften passen Update, Verlängerung oder Dank besser.
          </p>
        )}

        <Field label="Worauf soll der Entwurf eingehen?" htmlFor={`${ids}-note`} hint="Optional, zum Beispiel ein Wunsch des Sponsors oder ein Termin.">
          <textarea id={`${ids}-note`} aria-describedby={`${ids}-note-hint`} value={note} rows={3} maxLength={300} onChange={(e) => setNote(e.target.value)} disabled={busy} />
        </Field>

        {sponsor && (
          <div className="as-basis">
            <p className="as-basis-title">Daraus entsteht der Vorschlag</p>
            <dl>
              {basisRows(type, seeker, sponsor, partnership).map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
              {note.trim() && <div><dt>Ihre Notiz</dt><dd>{asSentence(note)}</dd></div>}
            </dl>
          </div>
        )}

        <div className="as-actions">
          {/* aria-disabled while writing (onSubmit ignores it): a disabled button would drop keyboard focus */}
          <Button type="submit" variant="gold" icon="sparkles" disabled={!sponsor} aria-disabled={busy || undefined}>
            {busy ? 'Wird geschrieben …' : 'Vorschlag erstellen'}
          </Button>
          {busy
            ? <Button variant="quiet" onClick={cancelWriting}>Abbrechen</Button>
            : <Button variant="quiet" href={href('ki-manager')}>Abbrechen</Button>}
        </div>
      </form>

      <p className="visually-hidden" role="status">{busy ? 'Vorschlag wird geschrieben.' : ''}</p>
      {writing && (
        <div ref={previewRef} className="as-letter as-letter-writing" aria-hidden="true">
          <p className="as-letter-subject">{subjectShown}{shown <= writing.subject.length && <span className="as-caret" />}</p>
          <div className="as-letter-body">{bodyShown}{shown > writing.subject.length && <span className="as-caret" />}</div>
        </div>
      )}
    </section>
  );
}
