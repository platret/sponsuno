import type { Role } from '../content';

// Placeholder: rebuilt in the section workflow.
export function HowItWorks({ onChooseRole }: { onChooseRole: (role: Role) => void }) {
  void onChooseRole;
  return <section className="section surface-paper" id="ablauf"><div className="container"><h2>HowItWorks</h2></div></section>;
}
