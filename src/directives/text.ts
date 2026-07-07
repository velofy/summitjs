/**
 * s-text and s-html.
 *
 * s-text sets textContent (safe). s-html sets innerHTML and initializes any
 * Summit directives inside the injected markup, so server- or fetch-supplied
 * fragments become reactive. Only use s-html on trusted content.
 */

import type { DirectiveHandler } from "../types.js";

function toDisplay(value: unknown): string {
  return value == null ? "" : String(value);
}

export const text: DirectiveHandler = (el, meta, utils) => {
  utils.effect(() => {
    el.textContent = toDisplay(utils.evaluate(meta.expression));
  });
};

export const html: DirectiveHandler = (el, meta, utils) => {
  utils.effect(() => {
    el.innerHTML = toDisplay(utils.evaluate(meta.expression));
    let child = el.firstElementChild;
    while (child) {
      utils.initTree(child, utils.scopes);
      child = child.nextElementSibling;
    }
  });
};
