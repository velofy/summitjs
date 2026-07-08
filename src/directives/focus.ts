/**
 * s-trap: keep keyboard focus inside an element while an expression is truthy.
 *
 *   <div class="s-dialog" s-trap="open"> ... </div>
 *
 * When the expression flips true, focus moves to the first focusable child and
 * Tab cycles within the element. When it flips false, focus returns to whatever
 * was focused before. This is what makes modal dialogs and menus accessible.
 */

import type { DirectiveHandler } from "../types.js";
import { focusable } from "./focusable.js";

export const trap: DirectiveHandler = (el, meta, utils) => {
  let active = false;
  let released: HTMLElement | null = null;

  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key !== "Tab") return;
    const items = focusable(el);
    if (!items.length) {
      e.preventDefault();
      return;
    }
    const first = items[0]!;
    const last = items[items.length - 1]!;
    const current = document.activeElement;
    if (e.shiftKey && (current === first || !el.contains(current))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const enable = (): void => {
    if (active) return;
    active = true;
    released = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", onKeydown, true);
    const focusFirst = (): void => {
      const items = focusable(el);
      (items[0] ?? (el as HTMLElement)).focus?.();
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(focusFirst);
    else focusFirst();
  };

  const disable = (): void => {
    if (!active) return;
    active = false;
    document.removeEventListener("keydown", onKeydown, true);
    released?.focus?.();
  };

  utils.effect(() => {
    if (utils.evaluate(meta.expression)) enable();
    else disable();
  });
  utils.cleanup(disable);
};
