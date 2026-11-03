import type { Role } from '../content';

// Placeholder: rebuilt in the section workflow.
export function Waitlist({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  void role; void onRoleChange;
  return <section className="section surface-navy" id="warteliste"><div className="container"><h2>Waitlist</h2></div></section>;
}
