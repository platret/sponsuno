import { useEffect, useRef, useState, type FormEvent } from 'react';
import { contact, waitlist, waitlistNext, type Role } from '../content';
import { siteHref, WAITLIST_ENDPOINT as ENDPOINT } from '../lib/links';
import { motionEnabled } from '../lib/motion';
import '../styles/sections/waitlist.css';

// Set VITE_WAITLIST_ENDPOINT=/api/warteliste (the Worker route, worker/waitlist.ts: Brevo double opt-in) to store
// sign-ups. It receives a JSON POST of { rolle, email, website } (website = the hidden honeypot field). Without it the
// form stores nothing (see AGENTS.md); waitlist.previewIntro, previewNote and previewSuccess say so and offer an e-mail
// to the team instead, so nobody believes they signed up. The same e-mail route takes over when the Worker answers
// 503 not_configured (endpoint set, Brevo setup not finished).
const CONTACT = contact.email;

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
  const [website, setWebsite] = useState('');
  // true once the Worker has answered 503 not_configured: from then on the form behaves as without an endpoint
  const [fallback, setFallback] = useState(false);
  const live = Boolean(ENDPOINT) && !fallback;
  const intro = live ? waitlist.intro : CONTACT ? waitlist.previewIntro : null;
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const emailRef = useRef<HTMLInputElement>(null);
  const [shaking, setShaking] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  // The prerendered form must not submit natively (before hydration or without JS the browser would POST the fields to
  // the page itself, or form-encoded to the endpoint and show its JSON answer). The submit button stays disabled until
  // React has hydrated; a disabled default button also blocks Enter-submission.
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
    if (!live) {
      succeed();
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ rolle: role, email: value, website }),
      });
      if (res.status === 503) {
        const answer: unknown = await res.json().catch(() => null);
        if (answer && typeof answer === 'object' && (answer as { reason?: unknown }).reason === 'not_configured') {
          // Brevo not set up yet: nothing was stored, so show the e-mail route instead of a sign-up
          setFallback(true);
          succeed();
          return;
        }
      }
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
            {intro && <p className="wl-intro">{intro}</p>}
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
                <button className="btn btn-gold wl-submit" type="submit" disabled={status === 'sending' || !hydrated}>
                  {waitlist.submit}
                </button>
              </div>
              {/* Honeypot: hidden from people and assistive technology, skipped by Tab and autofill. Bots that fill it
                  get a normal-looking success from the Worker, and nothing is stored. */}
              {ENDPOINT && (
                <div className="visually-hidden" aria-hidden="true">
                  <label htmlFor="wl-website">{waitlist.honeypotLabel}</label>
                  <input
                    id="wl-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              )}
              <p className="wl-error" id="wl-error" role="alert" hidden={!invalid}>{error}</p>
              <p className="wl-hint" id="wl-hint">
                {live ? waitlist.hint : waitlist.previewNote}
                {!live && CONTACT && <> {waitlist.previewMailLead} <a href={mailHref(role)}>{CONTACT}</a>.</>}
              </p>
            </form>
          ) : (
            <div className="wl-success" role="status" tabIndex={-1} ref={successRef}>
              <div className="wl-success-main">
                {/* An envelope either way: the next step is an e-mail (the confirmation link, or the prepared message) */}
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="M4 7l8 6 8-6" /></svg>
                <div>
                  <p>{live ? waitlist.success : waitlist.previewSuccess}</p>
                  {!live && CONTACT && (
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
