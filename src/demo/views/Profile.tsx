import './profile.css';
import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import photo from '../../assets/symbolbild-mtb-192.jpg';
import { formatRange, kindLabel } from '../format';
import { href } from '../router';
import { useDemo } from '../store';
import type { ProfileKind, Region, SeekerProfile, SupportKind } from '../types';
import { Avatar, Badge, Button, Card, ChipGroup, Field, Icon, PageHeader, Progress, useToast } from '../ui';

/* ---------- Constants ---------- */

const REGIONS = [
  'Zürcher Oberland', 'Winterthur', 'Zürich', 'Bern', 'Luzern', 'St. Gallen', 'Basel', 'Graubünden',
] as const satisfies readonly Region[];
// Compile-time guard: fails if a Region is added to types.ts but missing here.
const regionsComplete: Exclude<Region, (typeof REGIONS)[number]> extends never ? true : never = true;
void regionsComplete;

const SUPPORT_KINDS = ['Geld', 'Material', 'Dienstleistung', 'Infrastruktur'] as const satisfies readonly SupportKind[];
const KINDS = Object.keys(kindLabel) as ProfileKind[];

const OFFER_SUGGESTIONS = [
  'Logo auf dem Trikot',
  'Beiträge auf Instagram',
  'Besuch am Firmenanlass',
  'Erwähnung im Programmheft',
  'Bandenwerbung',
];

const SUGGEST_ID = (uid: string, s: string) => `${uid}-suggest-${OFFER_SUGGESTIONS.indexOf(s)}`;

const BIO_MAX = 280;
const BIO_MIN = 80;
const OFFERS_MAX = 10;
const REACH_MAX = 6;

/* ---------- Draft model ---------- */

interface ReachRow { key: string; label: string; value: string }

interface Draft {
  name: string;
  kind: ProfileKind;
  discipline: string;
  region: Region;
  bio: string;
  needs: SupportKind[];
  preferredIndustries: string[];
  /** Kept as strings while editing so an empty field stays empty. */
  budgetMin: string;
  budgetMax: string;
  offers: string[];
  reach: ReachRow[];
}

let rowCounter = 0;
const rowKey = () => `pf-row-${++rowCounter}`;

function toDraft(s: SeekerProfile): Draft {
  return {
    name: s.name,
    kind: s.kind,
    discipline: s.discipline,
    region: s.region,
    bio: s.bio,
    needs: [...s.needs],
    preferredIndustries: [...s.preferredIndustries],
    budgetMin: String(s.budget.min),
    budgetMax: String(s.budget.max),
    offers: [...s.offers],
    reach: s.reach.map((r) => ({ key: rowKey(), ...r })),
  };
}

const parseAmount = (v: string): number | null => {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

const cleanReach = (rows: ReachRow[]) =>
  rows.map((r) => ({ label: r.label.trim(), value: r.value.trim() })).filter((r) => r.label || r.value);

/** The patch that "Speichern" sends. Only valid when validate() returns no errors. */
function toPatch(d: Draft): Partial<SeekerProfile> {
  return {
    name: d.name.trim(),
    kind: d.kind,
    discipline: d.discipline.trim(),
    region: d.region,
    bio: d.bio.trim(),
    needs: SUPPORT_KINDS.filter((k) => d.needs.includes(k)),
    preferredIndustries: [...d.preferredIndustries],
    budget: { min: parseAmount(d.budgetMin) ?? 0, max: parseAmount(d.budgetMax) ?? 0 },
    offers: d.offers.map((o) => o.trim()).filter(Boolean),
    reach: cleanReach(d.reach),
  };
}

/** Comparable snapshot, independent of row keys and whitespace. */
const snapshot = (d: Draft) => {
  const patch = toPatch(d);
  return JSON.stringify({
    ...patch,
    preferredIndustries: [...(patch.preferredIndustries ?? [])].sort(),
    budgetMin: d.budgetMin.trim(),
    budgetMax: d.budgetMax.trim(),
  });
};

type ErrorKey = 'name' | 'discipline' | 'budgetMin' | 'budgetMax' | 'budgetRange' | 'reach';
type TouchKey = 'name' | 'discipline' | 'budgetMin' | 'budgetMax';

function validate(d: Draft): Partial<Record<ErrorKey, string>> {
  const e: Partial<Record<ErrorKey, string>> = {};
  if (!d.name.trim()) e.name = 'Bitte geben Sie einen Namen ein.';
  if (!d.discipline.trim()) e.discipline = 'Bitte geben Sie eine Sportart oder Sparte ein.';
  const min = parseAmount(d.budgetMin);
  const max = parseAmount(d.budgetMax);
  if (min === null) e.budgetMin = 'Bitte geben Sie einen Betrag ab 0 ein.';
  if (max === null) e.budgetMax = 'Bitte geben Sie einen Betrag ab 0 ein.';
  if (min !== null && max !== null && min > max) e.budgetRange = 'Der Mindestbetrag darf nicht höher sein als der Höchstbetrag.';
  if (d.reach.some((r) => Boolean(r.label.trim()) !== Boolean(r.value.trim()))) {
    e.reach = 'Bitte füllen Sie bei jeder Angabe Bezeichnung und Wert aus oder entfernen Sie die Zeile.';
  }
  return e;
}

/* ---------- Completeness ---------- */

interface Check { label: string; done: boolean; target: string }

function completeness(d: Draft, ids: Record<string, string>): Check[] {
  const min = parseAmount(d.budgetMin);
  const max = parseAmount(d.budgetMax);
  return [
    { label: 'Name', done: Boolean(d.name.trim()), target: ids.name },
    { label: 'Sportart oder Sparte', done: Boolean(d.discipline.trim()), target: ids.discipline },
    { label: `Kurzbeschreibung mit mindestens ${BIO_MIN} Zeichen`, done: d.bio.trim().length >= BIO_MIN, target: ids.bio },
    { label: 'Mindestens eine Unterstützungsart', done: d.needs.length > 0, target: ids.needs },
    { label: 'Mindestens eine Wunschbranche', done: d.preferredIndustries.length > 0, target: ids.industries },
    { label: 'Budget pro Jahr', done: min !== null && max !== null && max > 0 && min <= max, target: ids.budgetMin },
    { label: 'Mindestens drei Gegenleistungen', done: d.offers.length >= 3, target: ids.offer },
    { label: 'Mindestens zwei Angaben zur Reichweite', done: cleanReach(d.reach).filter((r) => r.label && r.value).length >= 2, target: ids.reachAdd },
  ];
}

const focusById = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const smooth = document.documentElement.classList.contains('motion');
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
  el.focus({ preventScroll: true });
};

/* ---------- View ---------- */

export default function Profile() {
  const { seeker, state, dispatch, matches } = useDemo();
  const toast = useToast();
  const uid = useId();
  const ids = useMemo(() => ({
    name: `${uid}-name`,
    kind: `${uid}-kind`,
    discipline: `${uid}-discipline`,
    region: `${uid}-region`,
    bio: `${uid}-bio`,
    bioCount: `${uid}-bio-count`,
    bioHint: `${uid}-bio-hint`,
    needs: `${uid}-needs`,
    industries: `${uid}-industries`,
    budgetMin: `${uid}-budget-min`,
    budgetMax: `${uid}-budget-max`,
    offer: `${uid}-offer`,
    offerHint: `${uid}-offer-hint`,
    reachAdd: `${uid}-reach-add`,
    reachError: `${uid}-reach-error`,
    preview: `${uid}-preview`,
    formTop: `${uid}-complete`,
    barStatus: `${uid}-bar-status`,
  }), [uid]);

  // Local draft, re-initialised whenever the stored profile changes (save, demo reset)
  const [draft, setDraft] = useState<Draft>(() => toDraft(seeker));
  const [syncedFrom, setSyncedFrom] = useState(seeker);
  const [submitted, setSubmitted] = useState(false);
  // Errors for single fields appear only after the field was left once (or after Speichern)
  const [touched, setTouched] = useState<Partial<Record<TouchKey, boolean>>>({});
  const [newOffer, setNewOffer] = useState('');
  const [offerNote, setOfferNote] = useState('');
  if (syncedFrom !== seeker) {
    setSyncedFrom(seeker);
    setDraft(toDraft(seeker));
    setSubmitted(false);
    setTouched({});
  }
  const touch = (key: TouchKey) => () => { if (!touched[key]) setTouched((t) => ({ ...t, [key]: true })); };

  // Move focus after list changes (add/remove) once the DOM is updated
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!pendingFocus.current) return;
    document.getElementById(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  // The sticky preview scrolls on its own when it is taller than the viewport; make it keyboard-scrollable then
  const asideRef = useRef<HTMLElement>(null);
  const [asideScrolls, setAsideScrolls] = useState(false);
  useEffect(() => {
    const el = asideRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const check = () => setAsideScrolls(el.scrollHeight > el.clientHeight + 1);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    window.addEventListener('resize', check);
    check();
    return () => { ro.disconnect(); window.removeEventListener('resize', check); };
  }, []);
  useEffect(() => {
    const el = asideRef.current;
    if (el) setAsideScrolls(el.scrollHeight > el.clientHeight + 1);
  });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const industries = useMemo(() => {
    const all = new Set([...state.sponsors.map((s) => s.industry), ...draft.preferredIndustries]);
    return [...all].sort((a, b) => a.localeCompare(b, 'de-CH'));
  }, [state.sponsors, draft.preferredIndustries]);

  const savedSnapshot = useMemo(() => snapshot(toDraft(seeker)), [seeker]);
  const errors = validate(draft);
  const dirty = snapshot(draft) !== savedSnapshot;
  const checks = completeness(draft, ids);
  const doneCount = checks.filter((c) => c.done).length;
  const missing = checks.filter((c) => !c.done);
  const goodMatches = matches.filter((m) => m.score >= 3 && !state.hidden.includes(m.sponsorId)).length;

  /* ----- Offers ----- */

  const suggestions = OFFER_SUGGESTIONS.filter((s) => !draft.offers.some((o) => o.toLowerCase() === s.toLowerCase()));

  /** fromInput: text comes from the input (clear it, keep focus there). Otherwise it is a suggestion chip. */
  const addOffer = (raw: string, fromInput: boolean) => {
    const text = raw.trim().replace(/\s+/g, ' ');
    if (!text) { setOfferNote('Bitte geben Sie eine Gegenleistung ein.'); return; }
    if (draft.offers.some((o) => o.toLowerCase() === text.toLowerCase())) { setOfferNote(`«${text}» steht schon in der Liste.`); return; }
    if (draft.offers.length >= OFFERS_MAX) { setOfferNote(`Sie können höchstens ${OFFERS_MAX} Gegenleistungen angeben.`); return; }
    set('offers', [...draft.offers, text]);
    setOfferNote('');
    if (fromInput) {
      setNewOffer('');
      pendingFocus.current = ids.offer;
    } else {
      // Stay in the suggestion list: next remaining suggestion, else the previous one, else the input
      const i = suggestions.indexOf(text);
      const rest = suggestions.filter((s) => s !== text);
      const next = rest[Math.min(Math.max(i, 0), rest.length - 1)];
      pendingFocus.current = next ? SUGGEST_ID(uid, next) : ids.offer;
    }
  };

  const removeOffer = (i: number) => {
    const next = draft.offers.filter((_, j) => j !== i);
    set('offers', next);
    setOfferNote('');
    pendingFocus.current = next.length ? `${uid}-offer-remove-${Math.min(i, next.length - 1)}` : ids.offer;
  };

  const onOfferKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    addOffer(newOffer, true);
  };

  /* ----- Reach ----- */

  const updateReach = (key: string, field: 'label' | 'value', value: string) =>
    set('reach', draft.reach.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const addReach = () => {
    const row = { key: rowKey(), label: '', value: '' };
    set('reach', [...draft.reach, row]);
    pendingFocus.current = `${uid}-${row.key}-label`;
  };

  const removeReach = (i: number) => {
    const next = draft.reach.filter((_, j) => j !== i);
    set('reach', next);
    pendingFocus.current = next.length ? `${uid}-${next[Math.min(i, next.length - 1)].key}-remove` : ids.reachAdd;
  };

  /* ----- Save / discard ----- */

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!dirty) return; // Speichern is aria-disabled while nothing changed
    setSubmitted(true);
    const order: [ErrorKey, string][] = [
      ['name', ids.name], ['discipline', ids.discipline], ['budgetMin', ids.budgetMin], ['budgetMax', ids.budgetMax],
      ['budgetRange', ids.budgetMin], ['reach', `${uid}-${draft.reach.find((r) => Boolean(r.label.trim()) !== Boolean(r.value.trim()))?.key}-label`],
    ];
    const first = order.find(([k]) => errors[k]);
    if (first) { focusById(first[1]); return; }
    dispatch({ type: 'updateProfile', patch: toPatch(draft) });
    setTouched({});
    toast('Profil gespeichert');
  };

  const discard = () => {
    if (!dirty) return;
    setDraft(toDraft(seeker));
    setSubmitted(false);
    setTouched({});
    setNewOffer('');
    setOfferNote('');
    toast('Änderungen verworfen');
  };

  const describedBy = (...list: (string | false | undefined)[]) => list.filter(Boolean).join(' ') || undefined;
  const shown = (key: TouchKey) => (submitted || touched[key] ? errors[key] : undefined);
  const nameErr = shown('name');
  const disciplineErr = shown('discipline');
  const budgetMinErr = shown('budgetMin');
  const budgetMaxErr = shown('budgetMax');
  const rangeErr = submitted || touched.budgetMin || touched.budgetMax ? errors.budgetRange : undefined;
  const reachErr = submitted ? errors.reach : undefined;

  return (
    <div className="pf">
      <PageHeader
        title="Ihr Profil"
        lead="Diese Angaben sehen Sponsoren, wenn sie Ihr Profil öffnen."
        actions={
          <Button variant="ghost" icon="arrowRight" className="pf-jump pf-down" onClick={() => focusById(ids.preview)}>
            Vorschau ansehen
          </Button>
        }
      />

      <div className="pf-layout">
        <form className="pf-form" onSubmit={onSubmit} noValidate aria-label="Profil bearbeiten">
          {/* Completeness */}
          <section className="pf-complete ui-card ui-card-light" aria-labelledby={ids.formTop}>
            <div className="pf-complete-head">
              <h2 id={ids.formTop} tabIndex={-1} className="pf-focus-heading">Vollständigkeit</h2>
              <p className="pf-complete-count"><strong>{doneCount}</strong> von {checks.length} Angaben</p>
            </div>
            <Progress value={doneCount / checks.length} label={`Profil zu ${Math.round((doneCount / checks.length) * 100)} Prozent vollständig`} />
            {missing.length === 0 ? (
              <p className="pf-complete-done"><Icon name="check" size={16} />Alle Angaben sind ausgefüllt. Vollständige Profile lassen sich besser vergleichen.</p>
            ) : (
              <div className="pf-missing">
                <p className="pf-missing-title">Noch offen</p>
                <ul>
                  {missing.map((c) => (
                    <li key={c.label}>
                      <button type="button" className="pf-missing-btn" onClick={() => focusById(c.target)}>
                        <span className="pf-missing-dot" aria-hidden="true" />
                        {c.label}
                        <Icon name="arrowRight" size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Grundangaben */}
          <div className="pf-section ui-card ui-card-light">
            <fieldset className="pf-fieldset">
              <legend className="pf-legend"><h2>Grundangaben</h2></legend>
              <div className="pf-grid">
                <Field label="Name" htmlFor={ids.name}>
                  <input
                    id={ids.name} type="text" value={draft.name} autoComplete="off"
                    onChange={(e) => set('name', e.target.value)} onBlur={touch('name')}
                    aria-invalid={nameErr ? true : undefined}
                    aria-describedby={describedBy(nameErr && `${ids.name}-err`)}
                  />
                  {nameErr && <p className="pf-error" id={`${ids.name}-err`} role="alert">{nameErr}</p>}
                </Field>
                <Field label="Art" htmlFor={ids.kind}>
                  <select id={ids.kind} value={draft.kind} onChange={(e) => set('kind', e.target.value as ProfileKind)}>
                    {KINDS.map((k) => <option key={k} value={k}>{kindLabel[k]}</option>)}
                  </select>
                </Field>
                <Field label="Sportart oder Sparte" htmlFor={ids.discipline}>
                  <input
                    id={ids.discipline} type="text" value={draft.discipline} autoComplete="off"
                    placeholder={draft.kind === 'kulturverein' ? 'z. B. Blasmusik' : 'z. B. Langstrecken-Mountainbike'}
                    onChange={(e) => set('discipline', e.target.value)} onBlur={touch('discipline')}
                    aria-invalid={disciplineErr ? true : undefined}
                    aria-describedby={describedBy(disciplineErr && `${ids.discipline}-err`)}
                  />
                  {disciplineErr && <p className="pf-error" id={`${ids.discipline}-err`} role="alert">{disciplineErr}</p>}
                </Field>
                <Field label="Region" htmlFor={ids.region}>
                  <select id={ids.region} value={draft.region} onChange={(e) => set('region', e.target.value as Region)}>
                    {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
              </div>
              <div className="ui-field pf-bio">
                <label htmlFor={ids.bio}>Kurzbeschreibung</label>
                <textarea
                  id={ids.bio} value={draft.bio} maxLength={BIO_MAX} rows={4}
                  onChange={(e) => set('bio', e.target.value.slice(0, BIO_MAX))}
                  aria-describedby={`${ids.bioHint} ${ids.bioCount}`}
                />
                <div className="pf-bio-meta">
                  <p className="ui-field-hint" id={ids.bioHint}>Zwei bis drei Sätze: wer Sie sind und wofür Sie Unterstützung suchen.</p>
                  <p className={`pf-count${draft.bio.length >= BIO_MAX - 20 ? ' is-near' : ''}`} id={ids.bioCount}>
                    {draft.bio.length} von {BIO_MAX} Zeichen
                  </p>
                </div>
              </div>
            </fieldset>
          </div>

          {/* Was Sie suchen */}
          <div className="pf-section ui-card ui-card-light">
            <fieldset className="pf-fieldset">
              <legend className="pf-legend"><h2>Was Sie suchen</h2></legend>
              <p className="pf-intro">Diese Angaben fliessen zusammen mit Region und Sportart oder Sparte in den Vergleich mit den Sponsoren ein.</p>
              <div className="pf-block">
                <h3 className="pf-label" id={`${ids.needs}-label`}>Unterstützungsart</h3>
                <div id={ids.needs} tabIndex={-1} className="pf-focus-target">
                  <ChipGroup options={SUPPORT_KINDS} value={draft.needs} onChange={(v) => set('needs', v)} label="Unterstützungsart" />
                </div>
              </div>
              <div className="pf-block">
                <h3 className="pf-label">Wunschbranchen</h3>
                <div id={ids.industries} tabIndex={-1} className="pf-focus-target">
                  <ChipGroup options={industries} value={draft.preferredIndustries} onChange={(v) => set('preferredIndustries', v)} label="Wunschbranchen" />
                </div>
              </div>
              <div className="pf-block">
                <h3 className="pf-label">Budget pro Jahr</h3>
                <div className="pf-budget">
                  <Field label="Mindestens, in CHF" htmlFor={ids.budgetMin}>
                    <input
                      id={ids.budgetMin} type="number" inputMode="numeric" min={0} step={500} value={draft.budgetMin}
                      onChange={(e) => set('budgetMin', e.target.value)} onBlur={touch('budgetMin')}
                      aria-invalid={budgetMinErr || rangeErr ? true : undefined}
                      aria-describedby={describedBy(budgetMinErr && `${ids.budgetMin}-err`, rangeErr && `${uid}-range-err`)}
                    />
                    {budgetMinErr && <p className="pf-error" id={`${ids.budgetMin}-err`} role="alert">{budgetMinErr}</p>}
                  </Field>
                  <span className="pf-budget-sep" aria-hidden="true">bis</span>
                  <Field label="Höchstens, in CHF" htmlFor={ids.budgetMax}>
                    <input
                      id={ids.budgetMax} type="number" inputMode="numeric" min={0} step={500} value={draft.budgetMax}
                      onChange={(e) => set('budgetMax', e.target.value)} onBlur={touch('budgetMax')}
                      aria-invalid={budgetMaxErr || rangeErr ? true : undefined}
                      aria-describedby={describedBy(budgetMaxErr && `${ids.budgetMax}-err`, rangeErr && `${uid}-range-err`)}
                    />
                    {budgetMaxErr && <p className="pf-error" id={`${ids.budgetMax}-err`} role="alert">{budgetMaxErr}</p>}
                  </Field>
                </div>
                {rangeErr && <p className="pf-error" id={`${uid}-range-err`} role="alert">{rangeErr}</p>}
              </div>
            </fieldset>
          </div>

          {/* Was Sie bieten */}
          <div className="pf-section ui-card ui-card-light">
            <fieldset className="pf-fieldset">
              <legend className="pf-legend"><h2>Was Sie bieten</h2></legend>
              <p className="pf-intro">Gegenleistungen, die Sie einem Sponsor verbindlich zusagen können.</p>
              {draft.offers.length > 0 ? (
                <ul className="pf-list" aria-label="Gegenleistungen">
                  {draft.offers.map((o, i) => (
                    <li key={`${o}-${i}`} className="pf-list-item">
                      <span className="pf-list-dot" aria-hidden="true" />
                      <span className="pf-list-text">{o}</span>
                      <button
                        type="button" className="pf-icon-btn" id={`${uid}-offer-remove-${i}`}
                        aria-label={`«${o}» entfernen`} onClick={() => removeOffer(i)}
                      >
                        <Icon name="trash" size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pf-empty">Noch keine Gegenleistungen. Fügen Sie mindestens drei hinzu.</p>
              )}
              <div className="ui-field pf-add">
                <label htmlFor={ids.offer}>Gegenleistung hinzufügen</label>
                <div className="pf-add-row">
                  <input
                    id={ids.offer} type="text" value={newOffer} autoComplete="off" maxLength={80}
                    placeholder="z. B. Vortrag im Betrieb"
                    onChange={(e) => { setNewOffer(e.target.value); if (offerNote) setOfferNote(''); }}
                    onKeyDown={onOfferKey}
                    aria-describedby={describedBy(offerNote && ids.offerHint)}
                  />
                  <Button variant="navy" icon="plus" onClick={() => addOffer(newOffer, true)}>Hinzufügen</Button>
                </div>
                {offerNote && <p className="pf-error" id={ids.offerHint} role="alert">{offerNote}</p>}
              </div>
              {suggestions.length > 0 && (
                <div className="pf-block">
                  <h3 className="pf-label">Vorschläge</h3>
                  <ul className="pf-suggest">
                    {suggestions.map((s) => (
                      <li key={s}>
                        <button
                          type="button" className="pf-suggest-btn" id={SUGGEST_ID(uid, s)}
                          onClick={() => addOffer(s, false)} aria-label={`Vorschlag hinzufügen: ${s}`}
                        >
                          <Icon name="plus" size={14} />{s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </fieldset>
          </div>

          {/* Reichweite */}
          <div className="pf-section ui-card ui-card-light">
            <fieldset className="pf-fieldset" aria-describedby={reachErr ? ids.reachError : undefined}>
              <legend className="pf-legend"><h2>Reichweite</h2></legend>
              <p className="pf-intro">Einfache, überprüfbare Angaben, zum Beispiel Rennen pro Saison oder Besucher pro Jahr.</p>
              {draft.reach.length > 0 ? (
                <ul className="pf-reach" aria-label="Angaben zur Reichweite">
                  {draft.reach.map((r, i) => {
                    const rowInvalid = submitted && Boolean(r.label.trim()) !== Boolean(r.value.trim());
                    return (
                      <li key={r.key} className="pf-reach-row">
                        <div className="ui-field">
                          <label htmlFor={`${uid}-${r.key}-label`}>Bezeichnung <span className="visually-hidden">{i + 1}</span></label>
                          <input
                            id={`${uid}-${r.key}-label`} type="text" value={r.label} autoComplete="off" maxLength={40}
                            placeholder="z. B. Mitglieder"
                            onChange={(e) => updateReach(r.key, 'label', e.target.value)}
                            aria-invalid={rowInvalid && !r.label.trim() ? true : undefined}
                            aria-describedby={rowInvalid ? ids.reachError : undefined}
                          />
                        </div>
                        <div className="ui-field">
                          <label htmlFor={`${uid}-${r.key}-value`}>Wert <span className="visually-hidden">{i + 1}</span></label>
                          <input
                            id={`${uid}-${r.key}-value`} type="text" value={r.value} autoComplete="off" maxLength={30}
                            placeholder="z. B. 180"
                            onChange={(e) => updateReach(r.key, 'value', e.target.value)}
                            aria-invalid={rowInvalid && !r.value.trim() ? true : undefined}
                            aria-describedby={rowInvalid ? ids.reachError : undefined}
                          />
                        </div>
                        <button
                          type="button" className="pf-icon-btn pf-reach-remove" id={`${uid}-${r.key}-remove`}
                          aria-label={`Angabe ${r.label.trim() ? `«${r.label.trim()}»` : i + 1} entfernen`}
                          onClick={() => removeReach(i)}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="pf-empty">Noch keine Angaben zur Reichweite.</p>
              )}
              {reachErr && <p className="pf-error" id={ids.reachError} role="alert">{reachErr}</p>}
              <div>
                <Button
                  variant="ghost" icon="plus" id={ids.reachAdd}
                  onClick={addReach} disabled={draft.reach.length >= REACH_MAX}
                >
                  Angabe hinzufügen
                </Button>
                {draft.reach.length >= REACH_MAX && <p className="ui-field-hint pf-hint-gap">Die Vorschau erlaubt höchstens {REACH_MAX} Angaben.</p>}
              </div>
            </fieldset>
          </div>

          {/* Save bar */}
          <div className={`pf-bar${dirty ? ' is-dirty' : ''}`}>
            <p className="pf-bar-status" role="status" id={ids.barStatus}>
              <span className="pf-bar-dot" aria-hidden="true" />
              {dirty ? 'Ungespeicherte Änderungen' : 'Alle Änderungen gespeichert'}
            </p>
            <div className="pf-bar-actions">
              {/* aria-disabled instead of disabled: the focused button stays focusable after save or discard */}
              <Button variant="quiet" icon="reset" onClick={discard} aria-disabled={!dirty || undefined}>
                <span className="pf-long">Änderungen verwerfen</span><span className="pf-short">Verwerfen</span>
              </Button>
              <Button variant="gold" type="submit" icon="check" aria-disabled={!dirty || undefined}>Speichern</Button>
            </div>
          </div>
        </form>

        {/* Live preview */}
        <aside
          className="pf-aside" aria-label="Vorschau" ref={asideRef}
          tabIndex={asideScrolls ? 0 : undefined}
        >
          <Preview draft={draft} showPhoto={seeker.id === 'lea' && draft.kind === 'athlete'} headingId={ids.preview} />
          {dirty ? (
            <p className="pf-recalc">
              Speichern Sie zuerst, damit Sponsuno die passenden Partner mit Ihren Änderungen neu berechnet.
              Beim Verlassen der Seite gehen ungespeicherte Änderungen verloren.
            </p>
          ) : (
            <p className="pf-recalc">
              Nach dem Speichern berechnet Sponsuno die passenden Partner neu.{' '}
              {goodMatches > 0 && <>Mit dem gespeicherten Profil {goodMatches === 1 ? 'passt derzeit ein Sponsor' : `passen derzeit ${goodMatches} Sponsoren`} in drei oder vier Kriterien. </>}
              <a href={href('partner')}>Passende Partner ansehen<Icon name="arrowRight" size={14} /></a>
            </p>
          )}
          <Button variant="quiet" icon="arrowLeft" className="pf-back pf-up" onClick={() => focusById(ids.formTop)}>
            Zurück zum Formular
          </Button>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Preview ---------- */

function Preview({ draft, showPhoto, headingId }: { draft: Draft; showPhoto: boolean; headingId: string }) {
  const name = draft.name.trim() || 'Ihr Name';
  const discipline = draft.discipline.trim();
  const min = parseAmount(draft.budgetMin);
  const max = parseAmount(draft.budgetMax);
  const budgetOk = min !== null && max !== null && min <= max;
  const reach = cleanReach(draft.reach).filter((r) => r.label && r.value);
  const bio = draft.bio.trim();
  const needs = SUPPORT_KINDS.filter((k) => draft.needs.includes(k));

  return (
    <Card tone="dark" className="pf-preview" title={<span id={headingId} tabIndex={-1} className="pf-preview-title">So sehen Sponsoren Ihr Profil</span>}>
      <div className="pf-pv-head">
        <figure className="pf-pv-avatar">
          <Avatar name={name} src={showPhoto ? photo : undefined} size={76} tone="gold" />
          {showPhoto && <figcaption>KI-generiertes Symbolbild</figcaption>}
        </figure>
        <div className="pf-pv-id">
          <h3 className="pf-pv-name">{name}</h3>
          <p className="pf-pv-meta">{kindLabel[draft.kind]}{discipline && <> · {discipline}</>}</p>
          <p className="pf-pv-region">{draft.region}</p>
        </div>
      </div>

      {bio ? <p className="pf-pv-bio">{bio}</p> : <p className="pf-pv-bio pf-pv-empty">Noch keine Kurzbeschreibung.</p>}

      <dl className="pf-pv-facts">
        <div>
          <dt>Sucht</dt>
          <dd>
            {needs.length > 0
              ? <span className="pf-pv-badges">{needs.map((n) => <Badge key={n} tone="gold">{n}</Badge>)}</span>
              : <span className="pf-pv-empty">Keine Angabe</span>}
          </dd>
        </div>
        <div>
          <dt>Budget pro Jahr</dt>
          <dd className="pf-pv-budget">{budgetOk ? formatRange({ min, max }) : <span className="pf-pv-empty">Keine gültige Angabe</span>}</dd>
        </div>
        <div>
          <dt>Wunschbranchen</dt>
          <dd>{draft.preferredIndustries.length > 0 ? draft.preferredIndustries.join(', ') : <span className="pf-pv-empty">Keine Angabe</span>}</dd>
        </div>
      </dl>

      <div className="pf-pv-block">
        <h4 className="pf-pv-sub">Gegenleistungen</h4>
        {draft.offers.length > 0 ? (
          <ul className="pf-pv-offers">
            {draft.offers.map((o, i) => <li key={`${o}-${i}`}>{o}</li>)}
          </ul>
        ) : <p className="pf-pv-empty">Noch keine Gegenleistungen.</p>}
      </div>

      <div className="pf-pv-block">
        <h4 className="pf-pv-sub">Reichweite</h4>
        {reach.length > 0 ? (
          <dl className="pf-pv-reach">
            {reach.map((r, i) => (
              <div key={`${r.label}-${i}`}>
                <dt>{r.label}</dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
        ) : <p className="pf-pv-empty">Noch keine Angaben.</p>}
      </div>
    </Card>
  );
}
