/**
 * The smaller directives:
 *   s-init    run an action once when the element initializes
 *   s-effect  run an action reactively, re-running when its data changes
 *   s-ref     register the element into the component's $refs (dynamic names ok)
 *   s-id      open an id group for accessible $id() pairing
 *   s-cloak   removed after init; pair with `[s-cloak]{display:none}` CSS
 */

import type { DirectiveHandler } from "../types.js";
import { refsFor } from "../dom.js";
import { allocGroup } from "../idstore.js";

export const init: DirectiveHandler = (_el, meta, utils) => {
  utils.evaluateAction(meta.expression);
};

export const effect: DirectiveHandler = (_el, meta, utils) => {
  utils.effect(() => {
    utils.evaluateAction(meta.expression);
  });
};

export const ref: DirectiveHandler = (el, meta, utils) => {
  // A resolvable string name means a dynamic ref (e.g. inside s-for); otherwise
  // the literal attribute value is the name (Alpine-compatible).
  const evaluated = utils.evaluate(meta.expression);
  const name = typeof evaluated === "string" && evaluated ? evaluated : meta.expression.trim();
  const refs = refsFor(el);
  refs[name] = el;
  utils.cleanup(() => {
    if (refs[name] === el) delete refs[name];
  });
};

export const id: DirectiveHandler = (el, meta, utils) => {
  const names = utils.evaluate(meta.expression);
  if (Array.isArray(names)) allocGroup(el, names.map(String));
};

export const cloak: DirectiveHandler = (el) => {
  el.removeAttribute("s-cloak");
};
