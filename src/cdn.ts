/**
 * CDN entry: the drop-in-a-script build.
 *
 * Attaches `window.Summit` and starts automatically once the DOM is ready, so a
 * single <script> tag is all you need. No build step, no manual start.
 */

import Summit from "./summit.js";

declare global {
  interface Window {
    Summit: typeof Summit;
  }
}

window.Summit = Summit;

let booted = false;

function boot(): void {
  if (booted) return;
  booted = true;
  Summit.start();
}

// Wait for DOMContentLoaded even when readyState has already advanced to
// "interactive": deferred scripts run one after another while the document is
// "interactive", so starting here would race with any later <script defer>
// that registers data providers, directives, or stores. DOMContentLoaded fires
// only after every deferred script has executed, which is the correct signal.
// A dynamically imported build after full page load starts immediately.
if (document.readyState === "complete") {
  boot();
} else {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
}

export default Summit;
