import type { GuideId, InfoPageId, LegalPageId } from '../content';
import { pageMeta } from '../pages';
import { GuidePage } from './GuidePage';
import { InfoPage } from './InfoPage';
import { LegalPage } from './LegalPage';
import { NotFoundPage } from './NotFoundPage';

export type StaticPageId = LegalPageId | GuideId | InfoPageId | 'notfound';

/** One static page (legal page, guide, topic page or the 404 page), for the prerender and the dev render. Picked by its kind in pages.ts. */
export function StaticPage({ id }: { id: StaticPageId }) {
  const { kind } = pageMeta(id);
  if (kind === 'legal') return <LegalPage page={id as LegalPageId} />;
  if (kind === 'info') return <InfoPage id={id as InfoPageId} />;
  if (kind === 'notfound') return <NotFoundPage />;
  return <GuidePage id={id as GuideId} />;
}
