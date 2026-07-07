/**
 * s-bind and its `:` shorthand.
 *
 *   :class  merges an object/array/string with the static class attribute
 *   :style  merges an object/string with the static style attribute
 *   :attr   sets any attribute; boolean attrs add/remove, false/null remove
 *   s-bind="obj"  applies a whole object of attributes/handlers at once
 */

import type { DirectiveHandler, DirectiveUtils } from "../types.js";
import { applyAttribute, camelCase, mergeClass, mergeStyle } from "./shared.js";

export const bind: DirectiveHandler = (el, meta, utils) => {
  if (meta.value === null) {
    applyBindObject(el, meta.expression, utils);
    return;
  }

  const name = meta.modifiers.includes("camel") ? camelCase(meta.value) : meta.value;

  if (name === "class") {
    const base = el.getAttribute("class") ?? "";
    utils.effect(() => {
      el.setAttribute("class", mergeClass(base, utils.evaluate(meta.expression)));
    });
    return;
  }

  if (name === "style") {
    const base = el.getAttribute("style") ?? "";
    utils.effect(() => {
      const merged = mergeStyle(base, utils.evaluate(meta.expression));
      if (merged) el.setAttribute("style", merged);
      else el.removeAttribute("style");
    });
    return;
  }

  utils.effect(() => {
    applyAttribute(el, name, utils.evaluate(meta.expression));
  });
};

/**
 * Apply a bind object: `{ type: 'button', '@click'() {...}, ':disabled'() {...} }`.
 * Plain values become attributes, `@`/`:` keys become handlers/dynamic binds.
 */
function applyBindObject(el: Element, expression: string, utils: DirectiveUtils): void {
  const obj = utils.evaluate(expression) as Record<string, unknown> | null;
  if (!obj || typeof obj !== "object") return;

  for (const [key, raw] of Object.entries(obj)) {
    if (key[0] === "@") {
      const event = key.slice(1);
      const handler = raw as EventListener;
      el.addEventListener(event, handler);
      utils.cleanup(() => el.removeEventListener(event, handler));
    } else if (key[0] === ":") {
      const attr = key.slice(1);
      const getter = raw as () => unknown;
      utils.effect(() => applyAttribute(el, attr, typeof getter === "function" ? getter() : getter));
    } else {
      applyAttribute(el, key, raw);
    }
  }
}
