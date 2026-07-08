/**
 * The built-in magics: `$`-prefixed helpers available in every expression.
 *
 *   $el $refs $root $store $data      values
 *   $watch $dispatch $nextTick $id     functions
 *
 * $watch improves on Alpine: it returns an unwatch function and only fires on
 * an actual change, so mutating the watched value in its own callback cannot
 * spin into an infinite loop.
 */

import { registerMagic, getStoreRoot } from "../registry/registry.js";
import { closestRoot, refsFor } from "../dom.js";
import { resolveId } from "../idstore.js";
import { domEffect, nextTick } from "../reactivity/index.js";
import { createPersist } from "./persist.js";
import { makeFocus } from "./focus.js";

export function registerBuiltinMagics(): void {
  registerMagic("el", (ctx) => ctx.el);

  registerMagic("refs", (ctx) => refsFor(ctx.el));

  registerMagic("root", (ctx) => closestRoot(ctx.el));

  registerMagic("data", (ctx) => (ctx.scopes.length ? ctx.scopes[ctx.scopes.length - 1] : {}));

  // The reactive store root: reads track, writes trigger, so
  // `$store.darkMode = !$store.darkMode` is reactive out of the box.
  registerMagic("store", () => getStoreRoot());

  registerMagic("watch", (ctx) => (path: string, callback: (n: unknown, o: unknown) => void) => {
    let oldValue: unknown;
    let first = true;
    const dispose = domEffect(() => {
      const newValue = ctx.evaluate(path);
      if (first) {
        oldValue = newValue;
        first = false;
        return;
      }
      if (Object.is(newValue, oldValue)) return;
      const previous = oldValue;
      oldValue = newValue;
      callback(newValue, previous);
    });
    ctx.cleanup(dispose);
    return dispose;
  });

  registerMagic(
    "dispatch",
    (ctx) =>
      (name: string, detail?: unknown, options: CustomEventInit = {}) => {
        const event = new CustomEvent(name, {
          detail,
          bubbles: true,
          composed: true,
          cancelable: true,
          ...options,
        });
        return ctx.el.dispatchEvent(event);
      },
  );

  registerMagic("nextTick", () => (callback?: () => void) => nextTick(callback));

  registerMagic("id", (ctx) => (name: string, key?: string | number) => resolveId(ctx.el, name, key));

  // localStorage-backed reactive state; resolved by s-data after the scope is reactive.
  registerMagic("persist", () => (initial: unknown) => createPersist(initial));

  // Keyboard focus helper, rooted at the element it is used on.
  registerMagic("focus", (ctx) => makeFocus(ctx.el));
}
