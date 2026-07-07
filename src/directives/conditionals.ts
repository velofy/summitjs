/**
 * s-if: add or remove an element from the DOM based on a condition.
 *
 * Unlike Alpine, s-if works on ANY element, not just <template>. A comment
 * anchor marks the insertion point; the blueprint is cloned in when the
 * condition is true and torn down when false. Also unlike Alpine, a <template>
 * s-if may hold more than one root element (e.g. an overlay plus a dialog):
 * every top-level child is rendered, in order.
 */

import type { DirectiveHandler } from "../types.js";

export const sIf: DirectiveHandler = (el, meta, utils) => {
  const parent = el.parentNode;
  if (!parent) return;

  const anchor = document.createComment("s-if");
  parent.insertBefore(anchor, el);

  let blueprints: Element[];
  if (el.tagName === "TEMPLATE") {
    blueprints = Array.from((el as HTMLTemplateElement).content.children).map(
      (child) => child.cloneNode(true) as Element,
    );
  } else {
    const clone = el.cloneNode(true) as Element;
    clone.removeAttribute(meta.raw);
    blueprints = [clone];
  }
  el.remove();
  if (!blueprints.length) return;

  const scopes = utils.scopes;
  let current: Element[] = [];

  const remove = (): void => {
    for (const node of current) {
      utils.destroyTree(node);
      node.remove();
    }
    current = [];
  };

  utils.effect(() => {
    const condition = !!utils.evaluate(meta.expression);
    if (condition && !current.length) {
      const nodes = blueprints.map((b) => b.cloneNode(true) as Element);
      const frag = document.createDocumentFragment();
      for (const node of nodes) frag.appendChild(node);
      anchor.parentNode?.insertBefore(frag, anchor.nextSibling);
      for (const node of nodes) utils.initTree(node, scopes);
      current = nodes;
    } else if (!condition && current.length) {
      remove();
    }
  });

  utils.cleanup(remove);
};
