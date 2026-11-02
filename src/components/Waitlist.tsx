import { useRef, useState, type FormEvent } from 'react';
import { waitlist, type Role } from '../content';
import { gsap, isNarrow, JOINED_EVENT, motionEnabled, scrollIntoFocus, useGSAP } from '../lib/motion';
import { useMagnetic } from '../hooks/usePointerFx';
import { Emblem } from './Emblem';
import { SplitHeading } from './SplitHeading';

// Set VITE_WAITLIST_ENDPOINT (e.g. a Formspree form URL) to store sign-ups. It receives a JSON POST
// of { rolle, email }. Without it the form only previews the success state: nothing is stored.
const ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT?.trim() ?? '';

type Status = 'idle' | 'sending' | 'done';

interface WaitlistProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export function Waitlist({ role, onRoleChange }: WaitlistProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const sectionRef = useRef<HTMLElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const submitRef = useMagnetic<HTMLButtonElement>();
  const { contextSafe } = useGSAP({ scope: sectionRef });

  const showError = contextSafe((message: string) => {
    // Clear first so screen readers announce the alert again on a repeated mistake
    setError(null);
    requestAnimationFrame(() => setError(message));
    if (motionEnabled() && rowRef.current) gsap.fromTo(rowRef.current, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
  });

  const celebrate = contextSafe(() => {
    setStatus('done');
    requestAnimationFrame(() => {
      const success = successRef.current;
      if (!success) return;
      if (motionEnabled()) gsap.fromTo(success, { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'expo.out' });
      success.focus({ preventScroll: true });
      // On one-column layouts the emblem sits below the form: bring it in before it spins
      const emblem = sectionRef.current?.querySelector<HTMLElement>('.emblem');
      let delay = 0;
      if (emblem && isNarrow(960)) {
        delay = 500;
        scrollIntoFocus(emblem);
      }
      window.setTimeout(() => document.dispatchEvent(new CustomEvent(JOINED_EVENT)), delay);
    });
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    if (!ENDPOINT) { celebrate(); return; }

    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ rolle: role, email: value }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      celebrate();
    } catch {
      setStatus('idle');
      showError(waitlist.failed);
    }
  };

  const invalid = error !== null;

  return (
    <section className="section section-navy waitlist" id="warteliste" aria-labelledby="warteliste-title" ref={sectionRef}>
      <div className="grain" aria-hidden="true" />
      <div className="container waitlist-grid">
        <div className="waitlist-copy">
          <SplitHeading id="warteliste-title" text={waitlist.title} />
          <p className="section-intro" data-reveal="">{waitlist.intro}</p>

          {status !== 'done' ? (
            <form className="waitlist-form" noValidate data-reveal="" onSubmit={submit}>
              <fieldset className="roles">
                <legend>{waitlist.legend}</legend>
                <div className="role-options">
                  {waitlist.roles.map((r) => (
                    <label key={r.value}>
                      <input type="radio" name="rolle" value={r.value} checked={role === r.value} onChange={() => onRoleChange(r.value)} />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="email-row" ref={rowRef}>
                <label className="visually-hidden" htmlFor="email">{waitlist.emailLabel}</label>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={waitlist.placeholder}
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? 'email-error email-hint' : 'email-hint'}
                />
                <button className="btn btn-gold btn-shine" type="submit" ref={submitRef} disabled={status === 'sending'}>
                  {waitlist.submit}
                </button>
              </div>
              <p className="form-error" id="email-error" role="alert" hidden={!invalid}>{error}</p>
              <p className="form-hint" id="email-hint">{waitlist.hint}</p>
            </form>
          ) : (
            <p className="form-success" role="status" tabIndex={-1} ref={successRef}>{waitlist.success}</p>
          )}
        </div>
        <Emblem />
      </div>
    </section>
  );
}
