/**
 * s-show: toggle visibility via `display`, keeping the element in the DOM.
 *
 * Cheap to toggle (unlike s-if), integrates with s-transition for enter/leave
 * animations, and supports the .important modifier to beat stubborn CSS.
 */

import type { DirectiveHandler } from "../types.js";
import { hasTransition, transitionIn, transitionOut } from "./transition.js";

export const show: DirectiveHandler = (el, meta, utils) => {
  const element = el as HTMLElement;
  const important = meta.modifiers.includes("important");
  const originalDisplay = element.style.display === "none" ? "" : element.style.display;

  const reveal = (): void => {
    if (originalDisplay) element.style.display = originalDisplay;
    else element.style.removeProperty("display");
  };
  const conceal = (): void => {
    if (important) element.style.setProperty("display", "none", "important");
    else element.style.setProperty("display", "none");
  };

  let first = true;
  utils.effect(() => {
    const visible = !!utils.evaluate(meta.expression);
    const animate = hasTransition(el) && !first;
    first = false;

    if (!animate) {
      if (visible) reveal();
      else conceal();
      return;
    }

    if (visible) {
      reveal();
      transitionIn(element);
    } else {
      transitionOut(element, conceal);
    }
  });
};
