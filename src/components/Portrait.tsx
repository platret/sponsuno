import type { TeamMember } from '../content';

/** "Aurel Eugster" -> "AE": first letter of the first and the last name. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** A founder's portrait for /ueber-uns/ (Team) and the landing page team row (TeamStrip): the real photo (AVIF in a
    <picture>, the JPEG as fallback) when content.ts provides one, otherwise a monogram (decorative: the name follows).
    `photoClass` / `monoClass` come from the caller's stylesheet. */
export function Portrait({ member, size, photoClass, monoClass, scroll }: {
  member: TeamMember;
  size: number;
  photoClass: string;
  monoClass: string;
  scroll?: string;
}) {
  if (member.photo) {
    return (
      <picture>
        <source srcSet={member.photo.avif} type="image/avif" />
        <img
          className={photoClass}
          data-scroll={scroll}
          src={member.photo.src}
          alt={member.photo.alt}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
        />
      </picture>
    );
  }
  return <span className={monoClass} data-scroll={scroll} aria-hidden="true">{initials(member.name)}</span>;
}
