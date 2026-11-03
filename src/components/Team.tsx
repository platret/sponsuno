import { team, type TeamMember } from '../content';
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

/** Ivory section between FAQ and waitlist: the four founders with their provisional focus. */
export function Team() {
  return (
    <section className="section surface-ivory team" id="team" aria-labelledby="team-title">
      <div className="container">
        <div className="section-head team-head">
          <h2 id="team-title">{team.title}</h2>
          <p className="section-intro">{team.intro}</p>
        </div>
        <ul className="team-grid" role="list">
          {team.members.map((member) => (
            <li className="team-member" data-reveal="" key={member.name}>
              <Portrait member={member} />
              <h3 className="team-name">{member.name}</h3>
              <p className="team-focus">{member.focus}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
