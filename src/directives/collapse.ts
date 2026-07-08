/**
 * s-collapse: animate an element's height open and closed as an expression
 * toggles. A drop-in, smoother alternative to s-show for accordions and menus.
 *
 *   <div s-collapse="open"> ... </div>
 */

import type { DirectiveHandler } from "../types.js";

const DURATION = 250;

export const collapse: DirectiveHandler = (el, meta, utils) => {
  const node = el as HTMLElement;
  node.style.overflow = "hidden";
  let first = true;

  utils.effect(() => {
    const open = !!utils.evaluate(meta.expression);

    if (first) {
      first = false;
      node.style.height = open ? "auto" : "0px";
      if (!open) node.setAttribute("hidden", "until-found");
      return;
    }

    node.removeAttribute("hidden");
    const start = node.getBoundingClientRect().height;
    node.style.height = `${start}px`;
    const end = open ? node.scrollHeight : 0;

    const animate = (): void => {
      node.style.transition = `height ${DURATION}ms ease`;
      node.style.height = `${end}px`;
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(animate);
    else animate();

    const done = (): void => {
      node.style.transition = "";
      if (open) node.style.height = "auto";
      node.removeEventListener("transitionend", done);
    };
    node.addEventListener("transitionend", done);
  });
};
