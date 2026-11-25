import { Fragment, type ReactNode } from 'react';
import { newTabHint, type LegalText } from '../content';
import { isExternal, NEW_TAB, siteHref } from '../lib/links';

/**
 * Renders LegalText (legal pages, guides, the project status on the landing page): plain strings, or strings mixed
 * with links. Link hrefs are external URLs, page paths ('demo/') or landing page sections ('#ablauf'), resolved by
 * siteHref() as on a sub-page, so use it on the landing page only for external links and page paths. External links
 * (https://…) open in a new tab.
 */
export function rich(text: LegalText): ReactNode {
  if (typeof text === 'string') return text;
  return text.map((part, i) =>
    typeof part === 'string'
      ? <Fragment key={i}>{part}</Fragment>
      : isExternal(part.href)
        ? <a key={i} href={part.href} {...NEW_TAB}>{part.label}<span className="visually-hidden">{newTabHint}</span></a>
        : <a key={i} href={siteHref(part.href, false)}>{part.label}</a>,
  );
}
