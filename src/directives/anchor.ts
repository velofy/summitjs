/**
 * s-anchor: position this element next to a reference element, flipping and
 * shifting to stay in the viewport. For menus, popovers, and tooltips.
 *
 *   <div class="s-menu" s-anchor="$refs.trigger">        below, left-aligned
 *   <div s-anchor.top.end="$refs.trigger">               above, right-aligned
 *   <div s-anchor.offset.12="$refs.trigger">             12px gap
 *
 * The expression must resolve to the reference Element (usually via $refs).
 */

import type { DirectiveHandler } from "../types.js";

export const anchor: DirectiveHandler = (el, meta, utils) => {
  const mods = meta.modifiers;
  const placement = mods.includes("top") ? "top" : "bottom";
  const align = mods.includes("end") ? "end" : mods.includes("center") ? "center" : "start";
  const oi = mods.indexOf("offset");
  const gap = oi >= 0 && /^\d+$/.test(mods[oi + 1] ?? "") ? Number(mods[oi + 1]) : 8;

  const node = el as HTMLElement;
  node.style.position = "fixed";
  if (!node.style.zIndex) node.style.zIndex = "50";
  node.style.margin = "0";

  let ref: Element | null = null;

  const place = (): void => {
    if (!ref || typeof window === "undefined") return;
    const r = ref.getBoundingClientRect();
    const ew = node.offsetWidth;
    const eh = node.offsetHeight;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    let top = placement === "top" ? r.top - eh - gap : r.bottom + gap;
    if (placement === "bottom" && top + eh > vh && r.top - eh - gap >= 0) top = r.top - eh - gap;
    if (placement === "top" && top < 0 && r.bottom + gap + eh <= vh) top = r.bottom + gap;

    let left = align === "end" ? r.right - ew : align === "center" ? r.left + r.width / 2 - ew / 2 : r.left;
    left = Math.max(8, Math.min(left, vw - ew - 8));

    node.style.top = `${Math.round(top)}px`;
    node.style.left = `${Math.round(left)}px`;
  };

  utils.effect(() => {
    const value = utils.evaluate(meta.expression);
    // Duck-type rather than `instanceof Element`: the reference just needs a
    // bounding box, and Element is not a global in every host (e.g. SSR).
    ref = value && typeof (value as Element).getBoundingClientRect === "function" ? (value as Element) : null;
    if (ref) place();
  });

  if (typeof window !== "undefined") {
    const on = (): void => place();
    window.addEventListener("scroll", on, true);
    window.addEventListener("resize", on);
    utils.cleanup(() => {
      window.removeEventListener("scroll", on, true);
      window.removeEventListener("resize", on);
    });
  }
};
