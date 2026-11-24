import { team } from '../content';
import { pageMeta } from '../pages';
import { pageHref } from '../lib/links';
import { Portrait } from './Portrait';
import '../styles/sections/team-strip.css';

/** Landing page team row (2026-11-25, owner's call): the four founders in their fixed order (Aurel, Alex, Maurice,
    Dozie), square portraits and names only, then a link to /ueber-uns/ (team and project status). Trust before the
    FAQ and the waitlist: a pre-launch site asking for an e-mail should show who is behind it. */
export function TeamStrip() {
  return (
    <section className="section surface-paper ts" aria-labelledby="ts-title">
      <div className="container">
        <div className="ts-head" data-reveal="" data-scroll="rise">
          <div>
            <p className="label">{team.stripLabel}</p>
            <h2 id="ts-title">{team.title}</h2>
            <p className="section-intro">{team.intro}</p>
          </div>
          <a className="link-arrow ts-more" href={pageHref(pageMeta('ueber-uns').path)}>
            {team.stripLink}
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </a>
        </div>
        <ul className="ts-grid" role="list" data-scroll-stagger="">
          {team.members.map((member) => (
            <li className="ts-member" key={member.name} data-reveal="" data-scroll="rise">
              <Portrait member={member} size={240} photoClass="ts-photo" monoClass="ts-photo ts-mono" />
              <p className="ts-name">{member.name}</p>
              {member.linkedin && (
                <a className="ts-link" href={member.linkedin} aria-label={team.linkedinLabel(member.name)}>LinkedIn</a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
