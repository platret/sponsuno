import type { GuideId, LegalPageId } from '../content';
import { GuidePage } from './GuidePage';
import { LegalPage } from './LegalPage';

export type StaticPageId = LegalPageId | GuideId;

/** True for the legal pages (Impressum, Datenschutz), false for the guides. */
export const isLegalPage = (id: StaticPageId): id is LegalPageId => id === 'impressum' || id === 'datenschutz';

/** One static page (legal page or guide), for the prerender and the dev render. */
export function StaticPage({ id }: { id: StaticPageId }) {
  return isLegalPage(id) ? <LegalPage page={id} /> : <GuidePage id={id} />;
}
