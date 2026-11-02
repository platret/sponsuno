// Shared UI kit of the demo. Styles in demo.css (classes prefixed "ui-"). Views compose these;
// add a new primitive here only if two or more views need it.
import { createContext, useCallback, useContext, useId, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { initials, statusLabel } from './format';
import type { Criterion, PartnershipStatus } from './types';

/* ---------- Icons (24px grid, stroke) ---------- */

const PATHS = {
  home: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  match: 'M7 7a3 3 0 1 0 0 .01M17 17a3 3 0 1 0 0 .01M9.5 9.5l5 5M17 7h.01M7 17h.01',
  handshake: 'M3 12l4-4 4 2 3-2 7 5-4 4-4-3-2 2-4-2zM7 8l-2-2M17 8l2-2',
  sparkles: 'M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  building: 'M4 21V5l8-2v18M12 9h8v12M8 8h.01M8 12h.01M8 16h.01M16 13h.01M16 17h.01M3 21h18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6 6 18',
  half: 'M12 4a8 8 0 1 0 0 16z',
  clock: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8L3.5 9.7l5.9-.9z',
  eyeOff: 'M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-3.3 3.8M6.7 6.7C4.4 8.3 3 12 3 12s4 6 9 6a9 9 0 0 0 4.3-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 18l-6-6 6-6',
  plus: 'M12 5v14M5 12h14',
  reset: 'M4 4v6h6M4.5 15a8 8 0 1 0 1.9-8.3L4 10',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  filter: 'M4 5h16l-6 8v6l-4-2v-4z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={`ui-icon${className ? ` ${className}` : ''}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}

/* ---------- Buttons ---------- */

type Variant = 'gold' | 'navy' | 'ghost' | 'quiet' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  icon?: IconName;
  /** Render as a link instead of a button. */
  href?: string;
}

export function Button({ variant = 'navy', size = 'md', icon, href, className, children, type = 'button', ...rest }: ButtonProps) {
  const cls = `ui-btn ui-btn-${variant} ui-btn-${size}${className ? ` ${className}` : ''}`;
  const inner = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children && <span>{children}</span>}
    </>
  );
  if (href) {
    // Forward attributes that make sense on a link (aria-*, id, title, onClick); drop button-only ones
    const { disabled: _disabled, form: _form, formAction: _formAction, name: _name, value: _value, ...linkProps } = rest;
    void _disabled; void _form; void _formAction; void _name; void _value;
    return <a className={cls} href={href} {...(linkProps as AnchorHTMLAttributes<HTMLAnchorElement>)}>{inner}</a>;
  }
  return <button type={type} className={cls} {...rest}>{inner}</button>;
}

/* ---------- Layout pieces ---------- */

export function PageHeader({ title, lead, actions, back }: { title: string; lead?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="ui-page-header">
      {back && <a className="ui-back" href={back.href}><Icon name="arrowLeft" size={16} />{back.label}</a>}
      <div className="ui-page-header-row">
        <div>
          <h1>{title}</h1>
          {lead && <p className="ui-lead">{lead}</p>}
        </div>
        {actions && <div className="ui-page-actions">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({ title, action, children, className, as: Tag = 'section', tone = 'light' }: {
  title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; as?: 'section' | 'article' | 'div'; tone?: 'light' | 'dark';
}) {
  const headingId = useId();
  return (
    <Tag className={`ui-card ui-card-${tone}${className ? ` ${className}` : ''}`} aria-labelledby={title ? headingId : undefined}>
      {(title || action) && (
        <div className="ui-card-head">
          {title && <h2 id={headingId}>{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </Tag>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="ui-empty">
      <p className="ui-empty-title">{title}</p>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

/* ---------- Data display ---------- */

type Tone = 'neutral' | 'gold' | 'navy' | 'success' | 'muted' | 'danger';

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>;
}

const STATUS_TONE: Record<PartnershipStatus, Tone> = {
  anfrage: 'gold', gespraech: 'gold', vereinbart: 'navy', aktiv: 'success', abgeschlossen: 'muted', abgesagt: 'muted',
};

export function StatusBadge({ status }: { status: PartnershipStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{statusLabel[status]}</Badge>;
}

export function Progress({ value, label }: { value: number; label: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="ui-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Avatar({ name, src, size = 40, tone = 'navy' }: { name: string; src?: string; size?: number; tone?: 'navy' | 'gold' | 'ivory' }) {
  if (src) return <img className="ui-avatar" src={src} alt="" width={size} height={size} style={{ width: size, height: size }} />;
  return (
    <span className={`ui-avatar ui-avatar-${tone}`} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

const CRITERION_ICON = { match: 'check', partial: 'half', miss: 'x' } as const;
const CRITERION_TEXT = { match: 'passt', partial: 'passt teilweise', miss: 'passt nicht' } as const;

/** The four Sponsuno criteria (Region, Unterstützungsart, Branche, Budget) with their state. */
export function CriteriaList({ criteria, compact = false }: { criteria: Criterion[]; compact?: boolean }) {
  return (
    <ul className={`ui-criteria${compact ? ' ui-criteria-compact' : ''}`} aria-label="Übereinstimmung nach Kriterien">
      {criteria.map((c) => (
        <li key={c.key} className={`is-${c.state}`}>
          <span className="ui-criteria-mark"><Icon name={CRITERION_ICON[c.state]} size={14} /></span>
          <span className="ui-criteria-label">{c.label}</span>
          {!compact && <span className="ui-criteria-detail">{c.detail}</span>}
          <span className="visually-hidden">: {CRITERION_TEXT[c.state]}</span>
        </li>
      ))}
    </ul>
  );
}

/** "3 von 4" with four dots. */
export function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="ui-score">
      <span className="ui-score-dots" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => <span key={i} className={i < score ? 'is-on' : undefined} />)}
      </span>
      <span aria-hidden="true">{score} von 4</span>
      <span className="visually-hidden">Passt in {score} von 4 Kriterien</span>
    </span>
  );
}

/* ---------- Navigation within a view ---------- */

/** Ids that connect a tab with its panel. Pass the same idBase to Tabs and TabPanel. */
const tabId = (idBase: string, value: string) => `${idBase}-tab-${value}`;
const panelId = (idBase: string) => `${idBase}-panel`;

export function Tabs<T extends string>({ items, value, onChange, label, idBase }: {
  /** countLabel: hidden context for the number, e.g. "Vorschläge" → read as "6 Vorschläge". */
  items: { value: T; label: string; count?: number; countLabel?: string }[]; value: T; onChange: (v: T) => void; label: string;
  /** Links each tab to the TabPanel with the same idBase (aria-controls / aria-labelledby). */
  idBase?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    const last = items.length - 1;
    const next = e.key === 'ArrowRight' ? (i + 1) % items.length
      : e.key === 'ArrowLeft' ? (i - 1 + items.length) % items.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    onChange(items[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div className="ui-tabs" role="tablist" aria-label={label}>
      {items.map((item, i) => (
        <button
          key={item.value}
          ref={(el) => { refs.current[i] = el; }}
          role="tab"
          type="button"
          id={idBase ? tabId(idBase, item.value) : undefined}
          aria-controls={idBase ? panelId(idBase) : undefined}
          aria-selected={item.value === value}
          tabIndex={item.value === value ? 0 : -1}
          className="ui-tab"
          onClick={() => onChange(item.value)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {item.label}
          {item.count !== undefined && (
            <span className="ui-tab-count">{item.count}{item.countLabel && <span className="visually-hidden"> {item.countLabel}</span>}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/** The panel of a Tabs group, labelled by the selected tab. */
export function TabPanel({ idBase, value, className, children }: { idBase: string; value: string; className?: string; children: ReactNode }) {
  return (
    <div role="tabpanel" id={panelId(idBase)} aria-labelledby={tabId(idBase, value)} className={className}>
      {children}
    </div>
  );
}

/* ---------- Form fields ---------- */

/** The hint gets the id `${htmlFor}-hint`; link it from the input with aria-describedby. */
export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div className="ui-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className="ui-field-hint" id={`${htmlFor}-hint`}>{hint}</p>}
    </div>
  );
}

/** Multi-select chips (aria-pressed toggle buttons). */
export function ChipGroup<T extends string>({ options, value, onChange, label }: {
  options: readonly T[]; value: T[]; onChange: (v: T[]) => void; label: string;
}) {
  return (
    <div className="ui-chips" role="group" aria-label={label}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" className="ui-chip" aria-pressed={on} onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}>
            {on && <Icon name="check" size={14} />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Toasts ---------- */

interface Toast { id: number; text: string }
const ToastContext = createContext<(text: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="ui-toasts" role="status" aria-live="polite">
        {toasts.map((t) => <div key={t.id} className="ui-toast"><Icon name="check" size={16} />{t.text}</div>)}
      </div>
    </ToastContext.Provider>
  );
}

/** Show a short confirmation, e.g. toast('Entwurf gespeichert'). */
export const useToast = () => useContext(ToastContext);
