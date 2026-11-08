// Second entry of the topic pages (/ki-manager/, /kosten/, /fragen/, /ueber-uns/; not /fuer-firmen/, which needs only
// the guide styles), loaded next to
// main.ts: the stylesheets of the former landing page sections they show. Kept apart from main.ts so the guides and
// legal pages do not load them. CSS only: in production the empty module's <script> is dropped by
// scripts/prerender.mjs, so these pages ship no JavaScript module either (/ki-manager/ has one inline head script
// that sets html.scroll-fx, see SCROLL_FX_SCRIPT in entry-server.tsx). page.css first, so section rules win a tie.
import '../styles/sections/page.css';
import '../styles/sections/ai.css';
import '../styles/sections/pricing.css';
import '../styles/sections/support.css';
import '../styles/sections/faq.css';
import '../styles/sections/team.css';
