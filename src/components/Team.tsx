import { contact, projectStatus, team, type TeamMember } from '../content';
import { Icon } from './kit/Icon';
import { rich } from './rich';
import '../styles/sections/team.css';

/** "Aurel Eugster" -> "AE": first letter of the first and the last name. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Real photo when content.ts provides one, otherwise a monogram disc (decorative: the name follows). Both are cut
    like a sticker: a white rim and one hairline (team.css). */
function Portrait({ member }: { member: TeamMember }) {
  if (member.photo) {
    return (
      <img
        className="team-portrait team-photo"
        src={member.photo.src}
        alt={member.photo.alt}
        width={120}
        height={120}
        loading="lazy"
        decoding="async"
      />
    );
  }
  return <span className="team-portrait team-mono" aria-hidden="true">{initials(member.name)}</span>;
}

/** "Stand des Projekts": the programme with a link, then the steps so far and the planned ones as a short
    vertical sequence, in an ink card. The state is written out (Erledigt / Geplant); the marker on the line only echoes
    it (done: a yellow disc with a check; planned: an empty dashed ring). */
function ProjectStatus() {
  return (
    <div className="team-status surface-tinte">
      <div className="team-status-head">
        <h2 className="team-status-title" id="team-status-title">{projectStatus.title}</h2>
        <p className="team-status-intro">{rich(projectStatus.intro)}</p>
        {contact.linkedin && <p className="team-status-intro">{rich(projectStatus.follow(contact.linkedin))}</p>}
      </div>
      <ol className="team-steps" role="list" aria-labelledby="team-status-title">
        {projectStatus.steps.map((step) => (
          <li className={`team-step${step.done ? ' is-done' : ''}`} key={step.when}>
            <span className="team-step-mark" aria-hidden="true">{step.done && <Icon name="check" size={14} />}</span>
            <p className="team-step-meta">
              <span className="team-step-when">{step.when}</span>
              <span className="team-step-state">{step.done ? projectStatus.doneLabel : projectStatus.plannedLabel}</span>
            </p>
            <p className="team-step-text">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Parkett-2 section, the body of /ueber-uns/ (its title and intro are the page head band: InfoPage → PageBand; the
    names are H2 styled as H3, "Stand des Projekts" a small display H2): the four founders with their provisional
    focus, then the project status. No motion. */
export function Team() {
  return (
    <section className="section surface-parkett-2 team" id="team" aria-labelledby="team-title">
      <div className="container">
        <ul className="team-grid" role="list">
          {team.members.map((member) => (
            <li className="team-member" key={member.name}>
              <Portrait member={member} />
              <h2 className="pg-h3 team-name">{member.name}</h2>
              <p className="team-focus">{member.focus}</p>
            </li>
          ))}
        </ul>
        <ProjectStatus />
      </div>
    </section>
  );
}
