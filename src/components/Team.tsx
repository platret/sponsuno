import { contact, projectStatus, team } from '../content';
import { Portrait } from './Portrait';
import { rich } from './rich';
import '../styles/sections/team.css';

/** "Stand des Projekts": the programme with a link, then the steps so far and the planned ones as a short
    vertical sequence, in a graphit card. The state is written out (Erledigt / Geplant); the marker on the line only echoes it. */
function ProjectStatus() {
  return (
    <div className="team-status">
      <div className="team-status-head" data-reveal="" data-scroll="rise">
        <h2 className="pg-h3" id="team-status-title">{projectStatus.title}</h2>
        <p className="team-status-intro">{rich(projectStatus.intro)}</p>
        {contact.linkedin && <p className="team-status-intro">{rich(projectStatus.follow(contact.linkedin))}</p>}
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

/** Kalk section, the body of /ueber-uns/ (its title and intro are the page head band: InfoPage → PageBand; names
    and "Stand des Projekts" are H2, styled as H3): the four founders (name, and LinkedIn once they sent it), then the project
    status. */
export function Team() {
  return (
    <section className="section surface-kalk team" id="team" aria-labelledby="team-title">
      <div className="container">
        <ul className="team-grid" role="list" data-scroll-stagger="">
          {team.members.map((member) => (
            <li className="team-member" data-reveal="" data-scroll="rise" key={member.name}>
              <Portrait member={member} size={120} photoClass="team-portrait team-photo" monoClass="team-portrait team-mono" scroll="zoom-in" />
              <h2 className="pg-h3 team-name">{member.name}</h2>
              {member.linkedin && (
                <a className="team-link" href={member.linkedin} aria-label={team.linkedinLabel(member.name)}>LinkedIn</a>
              )}
            </li>
          ))}
        </ul>
        <ProjectStatus />
      </div>
    </section>
  );
}
