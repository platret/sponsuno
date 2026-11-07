import { Fragment, type ReactNode } from 'react';
import type { LegalText } from '../content';
import { siteHref } from '../lib/links';

/**
 * Renders LegalText (legal pages, guides, the project status on the landing page): plain strings, or strings mixed
 * with links. Link hrefs are external URLs, page paths ('demo/') or landing page sections ('#ablauf'), resolved by
 * siteHref() as on a sub-page, so use it on the landing page only for external links and page paths.
 */
export function rich(text: LegalText): ReactNode {
  if (typeof text === 'string') return text;
  return text.map((part, i) =>
    typeof part === 'string'
      ? <Fragment key={i}>{part}</Fragment>
      : <a key={i} href={siteHref(part.href, false)}>{part.label}</a>,
  );
}
