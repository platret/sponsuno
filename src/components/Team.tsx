import { projectStatus, team, type TeamMember } from '../content';
import { rich } from './rich';
import '../styles/sections/team.css';

/** "Aurel Eugster" -> "AE": first letter of the first and the last name. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Real photo when content.ts provides one, otherwise a monogram in the CD (decorative: the name follows). */
function Portrait({ member }: { member: TeamMember }) {
  if (member.photo) {
    return (
      <img
        className="team-portrait team-photo"
        data-scroll="zoom-in"
        src={member.photo.src}
        alt={member.photo.alt}
        width={120}
        height={120}
        loading="lazy"
        decoding="async"
      />
    );
  }
  return <span className="team-portrait team-mono" data-scroll="zoom-in" aria-hidden="true">{initials(member.name)}</span>;
}

/** "Stand des Projekts": the programme with a link, then the steps so far and the planned ones as a short
    vertical sequence. The state is written out (Erledigt / Geplant); the marker on the line only echoes it. */
function ProjectStatus() {
  return (
    <div className="team-status">
      <div className="team-status-head" data-reveal="" data-scroll="rise">
        <h3 id="team-status-title">{projectStatus.title}</h3>
        <p className="team-status-intro">{rich(projectStatus.intro)}</p>
      </div>
      <ol className="team-steps" role="list" aria-labelledby="team-status-title" data-reveal="" data-scroll="rise">
        {projectStatus.steps.map((step) => (
          <li className={`team-step${step.done ? ' is-done' : ''}`} key={step.when}>
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

/** Ivory section between FAQ and waitlist: the four founders with their provisional focus. */
export function Team() {
  return (
    <section className="section surface-ivory team" id="team" aria-labelledby="team-title">
      <div className="container">
        <div className="section-head team-head" data-reveal="" data-scroll="rise">
          <h2 id="team-title">{team.title}</h2>
          <p className="section-intro">{team.intro}</p>
        </div>
        <ul className="team-grid" role="list" data-scroll-stagger="">
          {team.members.map((member) => (
            <li className="team-member" data-reveal="" data-scroll="rise" key={member.name}>
              <Portrait member={member} />
              <h3 className="team-name">{member.name}</h3>
              <p className="team-focus">{member.focus}</p>
            </li>
          ))}
        </ul>
        <ProjectStatus />
      </div>
    </section>
  );
}
