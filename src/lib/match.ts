// Hero match animation: a gold thread runs from the athlete card down past the criteria into
// the sponsor card. Each criterion ticks when the thread reaches its row; a spark rides the tip.

export interface MatchElements {
  figure: HTMLElement;
  stage: HTMLElement;
  path: SVGPathElement;
  glow: SVGPathElement;
  spark: HTMLElement;
  anchorA: HTMLElement;
  anchorB: HTMLElement;
}

export interface MatchController {
  play(): void;
  showFinal(): void;
  /** On narrow screens the card sits below the first screen, so it plays once it scrolls into view. */
  playWhenVisible(): void;
  destroy(): void;
}

const DRAW_START = 500;
const DRAW_MS = 2000;

export function createMatchController(el: MatchElements): MatchController {
  const { figure, stage, path, glow, spark, anchorA, anchorB } = el;
  const rows = [...figure.querySelectorAll<HTMLElement>('.criteria li')];
  const steps = [...figure.querySelectorAll<HTMLElement>('[data-step]')];
  let timers: number[] = [];
  let length = 0;
  let played = false;
  let sparkRaf = 0;
  let io: IntersectionObserver | null = null;

  const centerOf = (node: Element) => {
    const s = stage.getBoundingClientRect();
    const r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2 - s.left, y: r.top + r.height / 2 - s.top };
  };

  const layout = () => {
    const a = centerOf(anchorA);
    const b = centerOf(anchorB);
    const last = centerOf(rows[rows.length - 1]);
    const bend = Math.min(last.y + 12, b.y - 24);
    const mid = (bend + b.y) / 2;
    const d = `M ${a.x} ${a.y} V ${bend} C ${a.x} ${mid} ${b.x} ${mid} ${b.x} ${b.y}`;
    path.setAttribute('d', d);
    glow.setAttribute('d', d);
    length = path.getTotalLength();
    [path, glow].forEach((p) => { p.style.strokeDasharray = `${length}`; });
    return a;
  };

  // Measure the stage untilted, otherwise the thread would follow the tilted card positions
  const measureFlat = () => {
    stage.style.transition = 'none';
    stage.style.transform = 'none';
    const a = layout();
    stage.style.transform = '';
    void stage.offsetWidth;
    stage.style.transition = '';
    return a;
  };

  const setStep = (n: number) => steps.forEach((node) => node.classList.toggle('is-on', Number(node.dataset.step) <= n));
  const setOffset = (value: string, transition: string) => [path, glow].forEach((p) => {
    p.style.transition = transition;
    p.style.strokeDashoffset = value;
  });
  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  const showFinal = () => {
    clearTimers();
    cancelAnimationFrame(sparkRaf);
    played = true;
    measureFlat();
    setOffset('0', 'none');
    setStep(99);
    spark.style.opacity = '0';
  };

  const runSpark = (t0: number) => {
    cancelAnimationFrame(sparkRaf);
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - t0) / DRAW_MS));
      const pt = path.getPointAtLength(p * length);
      spark.style.transform = `translate(${pt.x}px, ${pt.y}px)`;
      spark.style.opacity = p > 0 && p < 1 ? '1' : '0';
      if (p < 1) sparkRaf = requestAnimationFrame(tick);
    };
    sparkRaf = requestAnimationFrame(tick);
  };

  const play = () => {
    clearTimers();
    played = false;
    figure.classList.add('is-animated');
    const a = measureFlat();
    setOffset(`${length}`, 'none');
    setStep(0);
    void path.getBoundingClientRect();

    timers.push(window.setTimeout(() => setStep(1), 60));
    timers.push(window.setTimeout(() => {
      setOffset('0', `stroke-dashoffset ${DRAW_MS}ms linear`);
      runSpark(performance.now());
    }, DRAW_START));
    rows.forEach((row) => {
      const y = centerOf(row).y;
      const at = DRAW_START + DRAW_MS * Math.max(0, (y - a.y) / length);
      timers.push(window.setTimeout(() => setStep(Number(row.dataset.step)), at));
    });
    timers.push(window.setTimeout(() => {
      clearTimers();
      setStep(99);
      anchorB.classList.remove('is-pulse');
      void anchorB.offsetWidth;
      anchorB.classList.add('is-pulse');
      played = true;
    }, DRAW_START + DRAW_MS + 60));
  };

  const playWhenVisible = () => {
    if (!window.matchMedia('(max-width: 960px)').matches) { play(); return; }
    figure.classList.add('is-animated');
    setStep(0);
    io?.disconnect();
    io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io?.disconnect();
      play();
    }, { threshold: 0.35 });
    io.observe(figure);
  };

  // Any resize, also one during the intro, ends in a correctly measured final state
  let frame = 0;
  let lastWidth = window.innerWidth;
  const onResize = () => {
    if (window.innerWidth === lastWidth && !played) return;
    lastWidth = window.innerWidth;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { if (played || timers.length) showFinal(); });
  };
  window.addEventListener('resize', onResize);

  return {
    play,
    showFinal,
    playWhenVisible,
    destroy() {
      clearTimers();
      cancelAnimationFrame(sparkRaf);
      cancelAnimationFrame(frame);
      io?.disconnect();
      window.removeEventListener('resize', onResize);
    },
  };
}
