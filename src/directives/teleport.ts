/**
 * s-teleport: render a <template>'s content at another place in the DOM while
 * keeping it bound to the current component's scope. Useful for modals and
 * popovers that must escape overflow/stacking contexts.
 *
 *   <template s-teleport="body"> ... </template>
 *   modifiers: .prepend / .append place relative to the target instead of inside it.
 */

import type { DirectiveHandler } from "../types.js";

export const teleport: DirectiveHandler = (el, meta, utils) => {
  if (el.tagName !== "TEMPLATE") {
    console.warn("[summit] s-teleport requires a <template> element");
    return;
  }
  const selector = meta.expression || meta.value || "";
  const target = selector ? document.querySelector(selector) : null;
  if (!target) {
    console.warn(`[summit] s-teleport target not found: ${selector}`);
    return;
  }

  const content = (el as HTMLTemplateElement).content;
  const clones = Array.from(content.children).map((n) => n.cloneNode(true) as Element);

  const frag = document.createDocumentFragment();
  for (const c of clones) frag.appendChild(c);

  if (meta.modifiers.includes("prepend")) target.parentNode?.insertBefore(frag, target);
  else if (meta.modifiers.includes("append")) target.parentNode?.insertBefore(frag, target.nextSibling);
  else target.appendChild(frag);

  // Initialize with the component's scope so teleported content stays bound.
  for (const c of clones) utils.initTree(c, utils.scopes);

  utils.cleanup(() => {
    for (const c of clones) {
      utils.destroyTree(c);
      c.remove();
    }
  });
};
