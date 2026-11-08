import { useEffect, useRef, useState, type ReactNode } from 'react';
import { problem, story, type StoryState } from '../content';
import { stageCss } from '../lib/storyLayout';
import { pageHref } from '../lib/links';
import { StageArt } from './StoryArt';
import '../styles/sections/story.css';

const Label = ({ children }: { children: string }) => <p className="st-label">{children}</p>;

// Where the stage is pinned (story.css, "Pinned"; keep the two in step). There the snapshots are display: none.
const PINNED = '(min-height: 561px) and (min-width: 761px), (min-height: 561px) and (prefers-reduced-motion: no-preference)';

/** One text step. The snapshot (static picture of its state) shows only where the stage is not pinned. */
function Step({ state, snap, as: Tag = 'div', children }: { state: StoryState; snap: boolean; as?: 'div' | 'li'; children: ReactNode }) {
  return (
    <Tag className="st-step" data-story-step={state}>
      <div className="st-snap" aria-hidden="true">{snap && <StageArt state={state} />}</div>
      <div className="st-copy">{children}</div>
    </Tag>
  );
}

/**
 * Scroll story under the hero, in place of the old Problem section: how sponsor search is today (the three
 * interview findings) and how Sponsuno is meant to solve it. The text steps are normal content; the graphic
 * beside them (desktop) or above them (phones) is sticky. Two IntersectionObservers (a step crossing the
 * reading line; a step or the section entering or leaving the screen) trigger one position check that sets
 * data-step on the stage; CSS transitions do the rest. No scroll handler, no hijacking.
 * Without JS, under reduced motion on phones and on short screens every step shows its own static picture
 * instead (story.css). DESIGN.md -> Story.
 * The snapshots are in the prerendered HTML (the no-JS path). Once hydrated, they are dropped while the stage is
 * pinned (about half of the page's elements) and come back when the screen stops matching PINNED.
 */
export function Story() {
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [snaps, setSnaps] = useState(true);

  useEffect(() => {
    const pinned = window.matchMedia(PINNED);
    const update = () => setSnaps(!pinned.matches);
    update();
    pinned.addEventListener('change', update);
    return () => pinned.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (!stage || !section) return;
    const root = document.documentElement;
    root.classList.add('story-ready');
    if (!('IntersectionObserver' in window)) return () => root.classList.remove('story-ready');

    const steps = [...section.querySelectorAll<HTMLElement>('[data-story-step]')];
    const activate = (el: HTMLElement) => {
      const state = el.dataset.storyStep;
      if (!state || stage.dataset.step === state && el.classList.contains('is-active')) return;
      stage.dataset.step = state;
      steps.forEach((s) => s.classList.toggle('is-active', s === el));
    };

    // The reading line sits at --st-read % of the viewport height (story.css, per breakpoint). The current step
    // is the last one whose top has passed it (or the first one). It is worked out from the step positions,
    // only when an observer reports a change (a step crossing the line, or entering or leaving the screen
    // after a jump, a reload or Back): never per scroll frame, and never stale after a jump.
    let read = 50;
    const sync = () => {
      const line = window.innerHeight * (read + 1) / 100;
      let current = steps[0];
      for (const s of steps) {
        if (s.getBoundingClientRect().top <= line) current = s;
        else break;
      }
      activate(current);
    };

    let band: IntersectionObserver | undefined;
    let screen: IntersectionObserver | undefined;
    const build = () => {
      band?.disconnect();
      screen?.disconnect();
      read = parseFloat(getComputedStyle(section).getPropertyValue('--st-read')) || 50;
      band = new IntersectionObserver(sync, { rootMargin: `-${read}% 0px -${Math.max(0, 98 - read)}% 0px` });
      screen = new IntersectionObserver(sync);
      steps.forEach((s) => { band!.observe(s); screen!.observe(s); });
      screen.observe(section);
      sync();
    };
    build();
    const mq = window.matchMedia('(max-width: 960px)');
    mq.addEventListener('change', build);

    // Keyboard: a focused link inside a step shows that step's picture
    const onFocus = (e: FocusEvent) => {
      const step = (e.target as Element | null)?.closest?.<HTMLElement>('[data-story-step]');
      if (step) activate(step);
    };
    section.addEventListener('focusin', onFocus);

    return () => {
      band?.disconnect();
      screen?.disconnect();
      mq.removeEventListener('change', build);
      section.removeEventListener('focusin', onFocus);
      root.classList.remove('story-ready');
    };
  }, []);

  return (
    <section className="story" id="problem" aria-labelledby="story-title" ref={sectionRef}>
      <style dangerouslySetInnerHTML={{ __html: stageCss }} />
      <div className="st-layout">
        {/* The opening step comes before the stage in the source: on phones and tablets the story opens with
            its heading, unpinned, and the sticky picture follows (desktop places it beside the text). */}
        <div className="st-head">
          <Step state="heute" snap={snaps}>
            <h2 id="story-title">{problem.title}</h2>
            <p className="st-intro">{problem.intro}</p>
          </Step>
        </div>

        <div className="st-stage" aria-hidden="true">
          <StageArt state="heute" live stageRef={stageRef} />
        </div>

        <div className="st-text">

          <ul className="st-findings" role="list">
            {problem.items.map((item, i) => (
              <Step key={item.title} state={story.findingStates[i]} snap={snaps} as="li">
                <Label>{story.labels.heute}</Label>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Step>
            ))}
          </ul>

          {story.steps.map((s) => (
            <Step key={s.state} state={s.state} snap={snaps}>
              <Label>{story.labels.solution}</Label>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Step>
          ))}

          <Step state={story.after.state} snap={snaps}>
            <Label>{story.labels.planned}</Label>
            <h3>{story.after.title}</h3>
            <p>{story.after.text}</p>
            <p className="st-more">
              <a className="link-arrow" href={pageHref(story.after.href)}>
                {story.after.link}
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </a>
            </p>
          </Step>
        </div>
      </div>
    </section>
  );
}
