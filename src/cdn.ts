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

function boot(): void {
  Summit.start();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

export default Summit;
