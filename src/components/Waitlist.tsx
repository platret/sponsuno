import { useEffect, useRef, useState, type FormEvent } from 'react';
import { contact, waitlist, waitlistNext, type Role } from '../content';
import { siteHref, WAITLIST_ENDPOINT as ENDPOINT } from '../lib/links';
import { motionEnabled } from '../lib/motion';
import '../styles/sections/waitlist.css';

// Set VITE_WAITLIST_ENDPOINT (e.g. a Formspree form URL) to store sign-ups. It receives a JSON POST
// of { rolle, email }. Without it the form stores nothing (see AGENTS.md); waitlist.previewIntro,
// previewNote and previewSuccess say so and offer an e-mail to the team instead, so nobody believes they signed up.
const CONTACT = contact.email;
const INTRO = ENDPOINT ? waitlist.intro : CONTACT ? waitlist.previewIntro : null;

/** mailto: link to the team with subject and body prefilled for the chosen role. */
function mailHref(role: Role): string {
  const label = waitlist.roles.find((r) => r.value === role)?.label ?? '';
  const subject = encodeURIComponent(waitlist.mailSubject(label));
  const body = encodeURIComponent(waitlist.mailBody(role, label));
  return `mailto:${CONTACT}?subject=${subject}&body=${body}`;
}

type Status = 'idle' | 'sending' | 'done';

interface WaitlistProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

/** Navy closing block, part one: a narrow centred form. Continues seamlessly into the footer. */
export function Waitlist({ role, onRoleChange }: WaitlistProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const emailRef = useRef<HTMLInputElement>(null);
  const [shaking, setShaking] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  // Without an endpoint the prerendered form must not submit natively (before hydration or without JS
  // the browser would POST email and rolle to the page itself, i.e. to the host). The submit button
  // stays disabled until React has hydrated; a disabled default button also blocks Enter-submission.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const showError = (message: string) => {
    // Clear first so screen readers announce the alert again on a repeated mistake
    setError(null);
    requestAnimationFrame(() => setError(message));
    // Short horizontal shake, only with motion on (otherwise animationend would never reset it).
    // Reset first so a repeated mistake restarts the animation.
    if (motionEnabled()) {
      setShaking(false);
      requestAnimationFrame(() => setShaking(true));
    }
  };

  const succeed = () => {
    setStatus('done');
    requestAnimationFrame(() => successRef.current?.focus({ preventScroll: true }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const value = email.trim();
    setEmail(value);
    const input = emailRef.current;
    if (input) input.value = value;
    if (!value || !input?.checkValidity()) {
      showError(waitlist.invalid);
      input?.focus();
      return;
    }
    setError(null);
    if (!ENDPOINT) {
      succeed();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ rolle: role, email: value }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      succeed();
    } catch {
      setStatus('idle');
      showError(waitlist.failed);
    }
  };

  const invalid = error !== null;

  return (
    <section className="wl section surface-navy" id="warteliste" aria-labelledby="warteliste-title">
      {/* Signature 2 ("the page opens"): the navy surface as its own layer, so the scroll-driven clip
          (data-scroll="frame") never touches the content or its focus outlines. Hidden without .scroll-fx. */}
      <div className="wl-surface" data-scroll="frame" aria-hidden="true" />
      <div className="container">
        <div className="wl-inner">
          <div className="wl-head" data-reveal="" data-scroll="rise">
            <h2 className="wl-title" id="warteliste-title">{waitlist.title}</h2>
            {INTRO && <p className="wl-intro">{INTRO}</p>}
          </div>

          {status !== 'done' ? (
            <form
              className="wl-form"
              method="post"
              action={ENDPOINT || undefined}
              noValidate
              data-reveal=""
              data-scroll="rise"
              onSubmit={submit} aria-busy={status === 'sending' || undefined}>
              <fieldset className="wl-roles">
                <legend className="wl-legend">{waitlist.legend}</legend>
                <div className="wl-chips">
                  {waitlist.roles.map((r) => (
                    <label className="wl-chip" key={r.value}>
                      <input
                        className="wl-chip-input"
                        type="radio"
                        name="rolle"
                        value={r.value}
                        checked={role === r.value}
                        onChange={() => onRoleChange(r.value)}
                      />
                      <span className="wl-chip-box">{r.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div
                className={`wl-row${shaking ? ' is-shaking' : ''}`}
                onAnimationEnd={(e) => { if (e.target === e.currentTarget) setShaking(false); }}
              >
                <label className="visually-hidden" htmlFor="wl-email">{waitlist.emailLabel}</label>
                <input
                  ref={emailRef}
                  className="wl-email"
                  id="wl-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  placeholder={waitlist.placeholder}
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? 'wl-error wl-hint' : 'wl-hint'}
                />
                <button className="btn btn-gold wl-submit" type="submit" disabled={status === 'sending' || (!ENDPOINT && !hydrated)}>
                  {waitlist.submit}
                </button>
              </div>
              <p className="wl-error" id="wl-error" role="alert" hidden={!invalid}>{error}</p>
              <p className="wl-hint" id="wl-hint">
                {ENDPOINT ? waitlist.hint : waitlist.previewNote}
                {!ENDPOINT && CONTACT && <> {waitlist.previewMailLead} <a href={mailHref(role)}>{CONTACT}</a>.</>}
              </p>
            </form>
          ) : (
            <div className="wl-success" role="status" tabIndex={-1} ref={successRef}>
              <div className="wl-success-main">
                {ENDPOINT
                  ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  : <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4 7l8 6 8-6" /></svg>}
                <div>
                  <p>{ENDPOINT ? waitlist.success : waitlist.previewSuccess}</p>
                  {!ENDPOINT && CONTACT && (
                    <>
                      <p>{waitlist.previewMailIntro}</p>
                      <p className="wl-mail">
                        <a className="btn btn-gold" href={mailHref(role)}>{waitlist.previewMailButton}</a>
                        <span className="wl-mail-address">{CONTACT}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
              <p className="wl-next">
                {waitlist.nextLabel} <a href={siteHref(waitlistNext[role].href, true)}>{waitlistNext[role].label}</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
