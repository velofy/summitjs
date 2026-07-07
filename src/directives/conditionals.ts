/**
 * s-if: add or remove an element from the DOM based on a condition.
 *
 * Unlike Alpine, s-if works on ANY element, not just <template>. A comment
 * anchor marks the insertion point; the element (minus its s-if attribute) is
 * the blueprint cloned in when the condition is true and torn down when false.
 */

import type { DirectiveHandler } from "../types.js";

export const sIf: DirectiveHandler = (el, meta, utils) => {
  const parent = el.parentNode;
  if (!parent) return;

  const anchor = document.createComment("s-if");
  parent.insertBefore(anchor, el);

  let blueprint: Element | null;
  if (el.tagName === "TEMPLATE") {
    const first = (el as HTMLTemplateElement).content.firstElementChild;
    blueprint = first ? (first.cloneNode(true) as Element) : null;
  } else {
    const clone = el.cloneNode(true) as Element;
    clone.removeAttribute(meta.raw);
    blueprint = clone;
  }
  el.remove();
  if (!blueprint) return;

  const scopes = utils.scopes;
  let current: Element | null = null;

  const remove = (): void => {
    if (current) {
      utils.destroyTree(current);
      current.remove();
      current = null;
    }
  };

  utils.effect(() => {
    const condition = !!utils.evaluate(meta.expression);
    if (condition && !current) {
      const node = blueprint!.cloneNode(true) as Element;
      anchor.parentNode?.insertBefore(node, anchor.nextSibling);
      utils.initTree(node, scopes);
      current = node;
    } else if (!condition && current) {
      remove();
    }
  });

  utils.cleanup(remove);
};
