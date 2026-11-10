import type { GuideId, InfoPageId, LegalPageId } from '../content';
import { pageMeta } from '../pages';
import { GuidePage } from './GuidePage';
import { InfoPage } from './InfoPage';
import { LegalPage } from './LegalPage';
import { NoticePage, type NoticePageId } from './NoticePage';

export type StaticPageId = LegalPageId | GuideId | InfoPageId | NoticePageId;

/** One static page (legal page, guide, topic page, the 404 page or a notice such as /warteliste/bestaetigt/), for the
    prerender and the dev render. Picked by its kind in pages.ts. */
export function StaticPage({ id }: { id: StaticPageId }) {
  const { kind } = pageMeta(id);
  if (kind === 'legal') return <LegalPage page={id as LegalPageId} />;
  if (kind === 'info') return <InfoPage id={id as InfoPageId} />;
  if (kind === 'notfound' || kind === 'notice') return <NoticePage id={id as NoticePageId} />;
  return <GuidePage id={id as GuideId} />;
}
