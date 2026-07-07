/**
 * s-transition: enter/leave animations, paired with s-show.
 *
 * Two styles, matching Alpine's surface:
 *   - class style: s-transition:enter / enter-start / enter-end / leave /
 *     leave-start / leave-end each take a class list.
 *   - helper style: bare s-transition with .duration .delay .opacity .scale
 *     modifiers uses inline styles for a default fade + scale.
 */

import type { DirectiveHandler } from "../types.js";

interface TransitionConfig {
  enter?: string;
  enterStart?: string;
  enterEnd?: string;
  leave?: string;
  leaveStart?: string;
  leaveEnd?: string;
  duration?: number;
  delay?: number;
  opacity?: boolean;
  scale?: number;
  classMode: boolean;
}

const configs = new WeakMap<Element, TransitionConfig>();

function config(el: Element): TransitionConfig {
  let c = configs.get(el);
  if (!c) configs.set(el, (c = { classMode: false }));
  return c;
}

export function hasTransition(el: Element): boolean {
  return configs.has(el);
}

function tokens(list?: string): string[] {
  return list ? list.split(/\s+/).filter(Boolean) : [];
}

function durationMod(mods: string[], name: string): number | undefined {
  const i = mods.indexOf(name);
  if (i === -1) return undefined;
  const next = mods[i + 1];
  if (!next) return undefined;
  if (next.endsWith("ms")) return parseInt(next, 10);
  if (next.endsWith("s")) return parseInt(next, 10) * 1000;
  return parseInt(next, 10);
}

export const transition: DirectiveHandler = (el, meta) => {
  const c = config(el);
  const mods = meta.modifiers;

  if (meta.value) {
    // Class style: s-transition:enter="...", etc.
    c.classMode = true;
    const key = meta.value as
      | "enter"
      | "enter-start"
      | "enter-end"
      | "leave"
      | "leave-start"
      | "leave-end";
    const map: Record<string, keyof TransitionConfig> = {
      enter: "enter",
      "enter-start": "enterStart",
      "enter-end": "enterEnd",
      leave: "leave",
      "leave-start": "leaveStart",
      "leave-end": "leaveEnd",
    };
    (c as unknown as Record<string, unknown>)[map[key]!] = meta.expression;
    return;
  }

  // Helper style.
  c.duration = durationMod(mods, "duration") ?? c.duration;
  c.delay = durationMod(mods, "delay") ?? c.delay;
  if (mods.includes("opacity")) c.opacity = true;
  if (mods.includes("scale")) {
    const i = mods.indexOf("scale");
    const next = mods[i + 1];
    c.scale = next && /^\d+$/.test(next) ? parseInt(next, 10) / 100 : 0.95;
  }
  if (!mods.includes("opacity") && c.scale === undefined) {
    c.opacity = true;
    c.scale = 0.95;
  }
};

function afterDuration(el: Element, fallback: number, done: () => void): void {
  const computed = getComputedStyle(el).transitionDuration;
  const ms = computed && computed !== "0s" ? parseFloat(computed) * 1000 : fallback;
  if (ms <= 0) {
    // Run on the next frame so start styles are painted first.
    requestAnimationFrame(() => done());
  } else {
    setTimeout(done, ms);
  }
}

export function transitionIn(el: HTMLElement, done?: () => void): void {
  const c = configs.get(el);
  if (!c) {
    done?.();
    return;
  }
  if (c.classMode) {
    el.classList.add(...tokens(c.enter), ...tokens(c.enterStart));
    requestAnimationFrame(() => {
      el.classList.remove(...tokens(c.enterStart));
      el.classList.add(...tokens(c.enterEnd));
      afterDuration(el, c.duration ?? 150, () => {
        el.classList.remove(...tokens(c.enter), ...tokens(c.enterEnd));
        done?.();
      });
    });
    return;
  }
  // Helper style.
  const dur = c.duration ?? 150;
  el.style.transition = "none";
  if (c.opacity) el.style.opacity = "0";
  if (c.scale !== undefined) el.style.transform = `scale(${c.scale})`;
  requestAnimationFrame(() => {
    el.style.transition = `all ${dur}ms ease-out ${c.delay ?? 0}ms`;
    if (c.opacity) el.style.opacity = "1";
    if (c.scale !== undefined) el.style.transform = "scale(1)";
    setTimeout(() => {
      el.style.removeProperty("transition");
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      done?.();
    }, dur + (c.delay ?? 0));
  });
}

export function transitionOut(el: HTMLElement, done: () => void): void {
  const c = configs.get(el);
  if (!c) {
    done();
    return;
  }
  if (c.classMode) {
    el.classList.add(...tokens(c.leave), ...tokens(c.leaveStart));
    requestAnimationFrame(() => {
      el.classList.remove(...tokens(c.leaveStart));
      el.classList.add(...tokens(c.leaveEnd));
      afterDuration(el, c.duration ?? 150, () => {
        el.classList.remove(...tokens(c.leave), ...tokens(c.leaveEnd));
        done();
      });
    });
    return;
  }
  const dur = c.duration ?? 150;
  el.style.transition = `all ${dur}ms ease-in ${c.delay ?? 0}ms`;
  requestAnimationFrame(() => {
    if (c.opacity) el.style.opacity = "0";
    if (c.scale !== undefined) el.style.transform = `scale(${c.scale})`;
    setTimeout(() => {
      el.style.removeProperty("transition");
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      done();
    }, dur + (c.delay ?? 0));
  });
};
