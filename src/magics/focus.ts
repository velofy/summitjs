/**
 * $focus: a small focus helper for moving keyboard focus around.
 *
 *   $focus.focus($refs.field)   focus a specific element
 *   $focus.first()              focus the first focusable inside $el
 *   $focus.next()               focus the next one, wrapping
 *   $focus.within(el).first()   change the root
 */

import { focusable } from "../directives/focusable.js";

export interface FocusHelper {
  focus(target: Element | null): void;
  first(): void;
  last(): void;
  next(): void;
  previous(): void;
  within(root: Element): FocusHelper;
}

export function makeFocus(root: Element): FocusHelper {
  const items = (): HTMLElement[] => focusable(root);
  const at = (delta: number): void => {
    const f = items();
    if (!f.length) return;
    const i = f.indexOf(document.activeElement as HTMLElement);
    const next = i === -1 ? 0 : (i + delta + f.length) % f.length;
    f[next]?.focus();
  };
  return {
    focus(target) {
      (target as HTMLElement | null)?.focus?.();
    },
    first() {
      items()[0]?.focus();
    },
    last() {
      const f = items();
      f[f.length - 1]?.focus();
    },
    next() {
      at(1);
    },
    previous() {
      at(-1);
    },
    within(el) {
      return makeFocus(el);
    },
  };
}
