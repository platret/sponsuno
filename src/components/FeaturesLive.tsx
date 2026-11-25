import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig, m } from 'motion/react';
import { ArtKit } from './featuresArt';

/* Motion for the «Mit Sponsuno» illustrations, loaded by Features.tsx after hydration (its own chunk, never in the
   first JavaScript) and only when the visitor allows motion. It swaps the plain SVG elements of featuresArt.tsx for
   Motion's `m` elements; LazyMotion loads Motion's DOM features on top (lib/motionFeatures.ts). */

const loadFeatures = () => import('../lib/motionFeatures').then((r) => r.default);
const KIT = { live: true, svg: m.svg, g: m.g, path: m.path, rect: m.rect, circle: m.circle };

export function LiveArt({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <ArtKit.Provider value={KIT}>{children}</ArtKit.Provider>
      </MotionConfig>
    </LazyMotion>
  );
}
