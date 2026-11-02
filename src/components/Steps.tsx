import { useRef } from 'react';
import { steps } from '../content';
import { gsap, motionEnabled, useGSAP } from '../lib/motion';
import { SplitHeading } from './SplitHeading';

/** Four steps on a gold rail that fills with scroll; each dot lights up when the fill reaches it. */
export function Steps() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const stepEls = gsap.utils.toArray<HTMLElement>('.step', wrap);
    const fill = wrap.querySelector('.steps-fill');
    if (!motionEnabled()) {
      stepEls.forEach((s) => s.classList.add('is-reached'));
      return;
    }

    const mm = gsap.matchMedia();
    // Wide: horizontal rail
    mm.add('(min-width: 1081px)', () => {
      gsap.fromTo(fill, { scaleX: 0, scaleY: 1 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: {
          trigger: wrap, start: 'top 78%', end: 'bottom 60%', scrub: 0.6,
          onUpdate: (self) => {
            const w = wrap.offsetWidth;
            stepEls.forEach((s) => s.classList.toggle('is-reached', self.progress * w >= s.offsetLeft - 2));
          },
        },
      });
    });
    // Phone: vertical rail
    mm.add('(max-width: 600px)', () => {
      gsap.fromTo(fill, { scaleY: 0, scaleX: 1 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: {
          trigger: wrap, start: 'top 70%', end: 'bottom 55%', scrub: 0.6,
          onUpdate: (self) => {
            const h = wrap.offsetHeight;
            stepEls.forEach((s) => s.classList.toggle('is-reached', self.progress * h >= s.offsetTop - 2));
          },
        },
      });
    });

    gsap.fromTo(wrap.querySelectorAll('.step-num span'), { yPercent: 100 }, {
      yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: wrap, start: 'top 82%', once: true },
    });
  }, { scope: wrapRef });

  return (
    <section className="section section-paper" id="ablauf" aria-labelledby="ablauf-title">
      <div className="container">
        <div className="section-head">
          <SplitHeading id="ablauf-title" text={steps.title} />
          <p className="section-intro" data-reveal="">{steps.intro}</p>
        </div>
        <div className="steps-wrap" ref={wrapRef}>
          <span className="steps-rail" aria-hidden="true"><span className="steps-fill" /></span>
          <ol className="steps">
            {steps.items.map((step, i) => (
              <li className="step" key={step.title}>
                <span className="step-num" aria-hidden="true"><span>{i + 1}</span></span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
