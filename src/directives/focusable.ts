/** Shared helpers for focus management (s-trap and $focus). */

const SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable]",
].join(",");

function visible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  // In a real browser a hidden element has zero boxes; treat zero-size (as in
  // headless DOM) as visible so tests and SSR do not silently drop everything.
  if (r.width === 0 && r.height === 0) {
    return (el as HTMLElement).offsetParent !== null || typeof (el as HTMLElement).offsetParent === "undefined";
  }
  return true;
}

/** The focusable descendants of `root`, in DOM order. */
export function focusable(root: Element): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)).filter(visible);
}
