// Sponsuno kit: the flat tag. A small, quiet label (launch signal, «Beispieldaten», a score) that replaces the tilted
// text sticker of the first «Turnhalle» pass. Real, selectable text; never rotated, no white sticker edge.
import type { HTMLAttributes, ReactNode } from 'react';
import '../../styles/kit.css';

export type TagTone = 'gelb' | 'blau' | 'rot' | 'gruen' | 'tinte' | 'parkett' | 'linie';

export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  /** Fill colour; the text colour follows (at least 4.5:1 on every tone). `linie` is the outlined, unfilled tag. Default gelb. */
  tone?: TagTone;
  /** A small round dot before the text (the launch signal uses it). */
  dot?: boolean;
  children: ReactNode;
};

/** Flat tag. Scale it with the custom property --tag-fs (default 13px). */
export function Tag({ tone = 'gelb', dot = false, className, children, ...rest }: TagProps) {
  return (
    <span className={className ? `tag ${className}` : 'tag'} data-tone={tone} {...rest}>
      {dot && <span className="tag-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
