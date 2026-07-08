/**
 * s-intersect and s-resize: run an action when the element enters or leaves the
 * viewport, or when it changes size.
 *
 *   <div s-intersect="load()">                 runs once visible
 *   <div s-intersect.once="seen = true">        then stops observing
 *   <div s-intersect:leave="pause()">           runs when it leaves
 *   <div s-intersect.full="play()">             requires full visibility
 *   <div s-resize="w = $width">                 $width / $height locals
 */

import type { DirectiveHandler } from "../types.js";

export const intersect: DirectiveHandler = (el, meta, utils) => {
  if (typeof IntersectionObserver === "undefined") return;
  const onLeave = meta.value === "leave";
  const threshold = meta.modifiers.includes("full") ? 0.99 : meta.modifiers.includes("half") ? 0.5 : 0;
  const once = meta.modifiers.includes("once");

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const active = onLeave ? !entry.isIntersecting : entry.isIntersecting;
        if (!active) continue;
        utils.evaluateAction(meta.expression);
        if (once) io.disconnect();
      }
    },
    { threshold },
  );
  io.observe(el);
  utils.cleanup(() => io.disconnect());
};

export const resize: DirectiveHandler = (el, meta, utils) => {
  if (typeof ResizeObserver === "undefined") return;
  const ro = new ResizeObserver((entries) => {
    const box = entries[0]?.contentRect;
    utils.evaluateAction(meta.expression, { $width: box?.width ?? 0, $height: box?.height ?? 0 });
  });
  ro.observe(el);
  utils.cleanup(() => ro.disconnect());
};
