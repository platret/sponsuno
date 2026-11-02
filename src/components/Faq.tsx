import { useRef, type MouseEvent } from 'react';
import { faq } from '../content';
import { motionEnabled } from '../lib/motion';
import { SplitHeading } from './SplitHeading';

const EASE = 'cubic-bezier(.16,1,.3,1)';

/** Native <details>, with a height animation that survives rapid clicks. */
function FaqItem({ q, a }: { q: string; a: string }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const anim = useRef<Animation | null>(null);
  const closing = useRef(false);

  const toggle = (e: MouseEvent<HTMLElement>) => {
    const d = detailsRef.current;
    const body = bodyRef.current;
    if (!d || !body || !motionEnabled() || !body.animate) return;
    e.preventDefault();
    const from = anim.current ? body.getBoundingClientRect().height : null;
    anim.current?.cancel();

    if (d.open && !closing.current) {
      closing.current = true;
      const a = body.animate(
        [{ height: `${from ?? body.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
        { duration: 380, easing: EASE, fill: 'forwards' },
      );
      a.onfinish = () => { d.open = false; closing.current = false; a.cancel(); anim.current = null; };
      anim.current = a;
    } else {
      closing.current = false;
      d.open = true;
      const a = body.animate(
        [{ height: `${from ?? 0}px`, opacity: from ? 1 : 0 }, { height: `${body.scrollHeight}px`, opacity: 1 }],
        { duration: 520, easing: EASE },
      );
      a.onfinish = () => { anim.current = null; };
      anim.current = a;
    }
  };

  return (
    <details ref={detailsRef}>
      <summary onClick={toggle}>{q}</summary>
      <div className="faq-body" ref={bodyRef}><p>{a}</p></div>
    </details>
  );
}

export function Faq() {
  return (
    <section className="section section-paper" id="fragen" aria-labelledby="fragen-title">
      <div className="container faq-grid">
        <div className="section-head">
          <SplitHeading id="fragen-title" text={faq.title} />
          <p className="section-intro" data-reveal="">
            {faq.introBefore}<a href="#warteliste">{faq.introLink}</a>{faq.introAfter}
          </p>
        </div>
        <div className="faq">
          {faq.items.map((item) => <FaqItem key={item.q} {...item} />)}
        </div>
      </div>
    </section>
  );
}
