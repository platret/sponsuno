import { useEffect, useRef } from 'react';
import { mountSilk, type SilkPalette } from '../lib/silk';
import { motionEnabled } from '../lib/motion';

export function SilkCanvas({ palette }: { palette: SilkPalette }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    try {
      return mountSilk(canvas, palette, { still: !motionEnabled() }) ?? undefined;
    } catch (err) {
      // The CSS gradient behind the canvas stays as the fallback.
      console.warn('Silk shader unavailable:', err);
    }
  }, [palette]);
  return <canvas ref={ref} className="silk" aria-hidden="true" />;
}
