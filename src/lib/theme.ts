// Light/dark theme (DESIGN.md -> Theme). Plain data, imported by vite.config.ts (no DOM, no React).
//
// THEME_SCRIPT is the one inline script that runs the theme on every page except the demo. vite.config.ts puts it in
// place of the <!--theme--> marker in the <head> of each HTML entry (dev and build, before the stylesheets), and
// scripts/prerender.mjs fails if a built page lacks it. It
// - sets html[data-theme] to the visitor's saved choice (localStorage 'sponsuno-theme': 'light' | 'dark') or, without
//   one, to the system setting, before the first paint (no flash), and follows a system change while nothing is saved;
// - handles every theme switch on the page with one delegated click listener on [data-theme-toggle] (ThemeToggle.tsx),
//   so it works on the static pages, which ship no JavaScript module, and on the landing page without React state;
// - keeps aria-pressed of the switches in step, and re-reads the choice when a page comes back from the back/forward
//   cache or another tab changes it;
// - switches without transitions: while it changes the theme on an open page it sets html.theme-switching (site.css
//   turns every transition off), forces a style flush and removes the class in the next frame, so the header and the
//   buttons change together with the page surface instead of fading over it.
// Without JavaScript there is no data-theme: tokens.css then follows prefers-color-scheme and the switch stays hidden.
// localStorage can throw (blocked storage, some private modes): the choice then lasts for the page only.

export const THEME_STORAGE_KEY = 'sponsuno-theme';

export const THEME_MARKER = '<!--theme-->';

export const THEME_SCRIPT =
  '<script>(function(d,k){var r=d.documentElement,m=matchMedia("(prefers-color-scheme: dark)");' +
  'function s(){try{var v=localStorage.getItem(k)}catch(e){}return v=="dark"||v=="light"?v:null}' +
  'function a(v){r.setAttribute("data-theme",v);for(var b=d.querySelectorAll("[data-theme-toggle]"),i=0;i<b.length;i++)b[i].setAttribute("aria-pressed",v=="dark")}' +
  'function n(v){r.classList.add("theme-switching");a(v);r.offsetWidth;requestAnimationFrame(function(){r.classList.remove("theme-switching")})}' +
  'function g(){return s()||(m.matches?"dark":"light")}function f(){a(g())}function h(){g()!=r.getAttribute("data-theme")&&n(g())}' +
  'f();m.addEventListener&&m.addEventListener("change",function(){s()||h()});' +
  'addEventListener("pageshow",h);addEventListener("storage",function(e){e.key==k&&h()});d.addEventListener("DOMContentLoaded",f);' +
  'd.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-theme-toggle]");' +
  'if(b){var v=r.getAttribute("data-theme")=="dark"?"light":"dark";n(v);try{localStorage.setItem(k,v)}catch(x){}}})' +
  `})(document,"${THEME_STORAGE_KEY}")</script>`;
