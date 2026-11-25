import { team } from '../content';
import { NEW_TAB } from '../lib/links';
import { Portrait } from './Portrait';
import '../styles/sections/team-strip.css';

/** Landing page team row (#team, 2026-11-25, owner's call; the header «Über uns», the footer and old /ueber-uns/ links
    lead here): the four founders in their fixed order (Aurel, Alex, Maurice, Dozie), initials, name and LinkedIn. The square and the
    LinkedIn link open the profile in a new tab. Trust before the
    FAQ and the waitlist: a pre-launch site asking for an e-mail should show who is behind it. */
export function TeamStrip() {
  return (
    <section className="section surface-paper ts" id="team" aria-labelledby="ts-title">
      <div className="container">
        <div className="ts-head" data-reveal="" data-scroll="rise">
          <div>
            <p className="label">{team.stripLabel}</p>
            <h2 id="ts-title">{team.title}</h2>
            <p className="section-intro">{team.intro}</p>
          </div>
        </div>
        <ul className="ts-grid" role="list" data-scroll-stagger="">
          {team.members.map((member) => (
            <li className="ts-member" key={member.name} data-reveal="" data-scroll="rise">
              {member.linkedin ? (
                // The square opens the profile too, for the mouse; keyboard and screen readers use the LinkedIn link
                // below (one tab stop per person). The name stays plain text, so it can be selected and copied.
                <a className="ts-square-link" href={member.linkedin} {...NEW_TAB} tabIndex={-1} aria-hidden="true">
                  <Portrait member={member} size={240} photoClass="ts-photo" monoClass="ts-photo ts-mono" />
                </a>
              ) : (
                <Portrait member={member} size={240} photoClass="ts-photo" monoClass="ts-photo ts-mono" />
              )}
              <p className="ts-name">{member.name}</p>
              {member.linkedin && (
                <a className="ts-link" href={member.linkedin} {...NEW_TAB} aria-label={team.linkedinLabel(member.name)}>LinkedIn</a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
