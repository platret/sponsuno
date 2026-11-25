import { useRef } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, m, type Variants } from 'motion/react';
import { AnimateIn, CardFrame, MotionKit, STATES, type MotionKitValue } from './featuresCard';

/* The animated card of «Mit Sponsuno», loaded by Features.tsx after hydration on desktop only (its own chunk, like
   the hero field), so Motion (motion.dev) never weighs on the first load or on phones. LazyMotion loads Motion's DOM
   features on top (lib/motionFeatures.ts). MotionConfig reducedMotion="user" drops movement under reduced motion. */

const loadFeatures = () => import('../lib/motionFeatures').then((r) => r.default);

const list: Variants = { show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } } };
const row: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const KIT = { div: m.div, span: m.span, list, row } as unknown as MotionKitValue;

export function LiveCard({ step }: { step: number }) {
  const State = STATES[step];
  const first = useRef(step);
  const moved = useRef(false);
  if (step !== first.current) moved.current = true;
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <MotionKit.Provider value={KIT}>
          <CardFrame step={step}>
            <AnimatePresence mode="wait" initial={false}>
              <m.div key={step} exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}>
                <AnimateIn.Provider value={moved.current}><State /></AnimateIn.Provider>
              </m.div>
            </AnimatePresence>
          </CardFrame>
        </MotionKit.Provider>
      </MotionConfig>
    </LazyMotion>
  );
}
