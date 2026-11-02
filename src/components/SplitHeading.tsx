import { Fragment, type HTMLAttributes } from 'react';

interface SplitHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2';
  text: string;
  /** Reveal on scroll via useScrollReveals. The hero h1 animates in its own intro instead. */
  reveal?: boolean;
}

/** Heading whose words sit in their own clipped boxes so they can rise into view. */
export function SplitHeading({ as: Tag = 'h2', text, reveal = true, ...rest }: SplitHeadingProps) {
  const words = text.split(/\s+/);
  return (
    <Tag aria-label={text.replace(/\u00AD/g, '')} data-split={reveal ? '' : undefined} {...rest}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="word" aria-hidden="true"><span>{word}</span></span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  );
}
