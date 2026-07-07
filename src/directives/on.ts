/**
 * s-on and its `@` shorthand.
 *
 * Supports the full modifier vocabulary: .prevent .stop .self .outside .once
 * .capture .passive .window .document .debounce .throttle, key filters
 * (.enter .escape .arrow-up ...), system-key combos (.shift .ctrl .alt .cmd),
 * and event-name transforms (.camel .dot). A bare method reference
 * (`@click="handler"`) is called with the event.
 */

import type { DirectiveHandler } from "../types.js";
import { camelCase, kebabCase } from "./shared.js";
import { fail } from "../errors.js";

const SYSTEM = new Set(["shift", "ctrl", "alt", "cmd", "meta"]);
const BEHAVIOR = new Set([
  "prevent",
  "stop",
  "self",
  "outside",
  "once",
  "capture",
  "passive",
  "window",
  "document",
  "camel",
  "dot",
  "debounce",
  "throttle",
]);

const KEY_ALIASES: Record<string, string> = {
  enter: "Enter",
  tab: "Tab",
  space: " ",
  esc: "Escape",
  escape: "Escape",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  "arrow-up": "ArrowUp",
  "arrow-down": "ArrowDown",
  "arrow-left": "ArrowLeft",
  "arrow-right": "ArrowRight",
  "page-up": "PageUp",
  "page-down": "PageDown",
  home: "Home",
  end: "End",
  delete: "Delete",
  backspace: "Backspace",
};

function isDuration(m: string): boolean {
  return /^\d+(ms|s)?$/.test(m);
}

function parseDuration(m: string): number {
  if (m.endsWith("ms")) return parseInt(m, 10);
  if (m.endsWith("s")) return parseInt(m, 10) * 1000;
  return parseInt(m, 10);
}

function durationFor(mods: string[], name: string): number | null {
  const i = mods.indexOf(name);
  if (i === -1) return null;
  const next = mods[i + 1];
  return next && isDuration(next) ? parseDuration(next) : 250;
}

function matchKey(e: KeyboardEvent, mod: string): boolean {
  const key = e.key;
  if (!key) return false;
  const alias = KEY_ALIASES[mod];
  if (alias) return key === alias;
  return kebabCase(key).toLowerCase() === mod.toLowerCase() || key.toLowerCase() === mod.toLowerCase();
}

function passesSystem(e: Event, mods: string[]): boolean {
  const k = e as KeyboardEvent;
  if (mods.includes("shift") && !k.shiftKey) return false;
  if (mods.includes("ctrl") && !k.ctrlKey) return false;
  if (mods.includes("alt") && !k.altKey) return false;
  if ((mods.includes("cmd") || mods.includes("meta")) && !k.metaKey) return false;
  return true;
}

function debounce(fn: (e: Event) => void, ms: number): (e: Event) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (e: Event) => {
    clearTimeout(t);
    t = setTimeout(() => fn(e), ms);
  };
}

function throttle(fn: (e: Event) => void, ms: number): (e: Event) => void {
  let last = 0;
  let scheduled: ReturnType<typeof setTimeout> | undefined;
  return (e: Event) => {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      last = now;
      fn(e);
    } else if (!scheduled) {
      scheduled = setTimeout(() => {
        last = Date.now();
        scheduled = undefined;
        fn(e);
      }, remaining);
    }
  };
}

export const on: DirectiveHandler = (el, meta, utils) => {
  const mods = meta.modifiers;
  let event = meta.value ?? "";
  if (mods.includes("camel")) event = camelCase(event);
  if (mods.includes("dot")) event = event.replace(/-/g, ".");

  const keyMods = mods.filter((m) => !SYSTEM.has(m) && !BEHAVIOR.has(m) && !isDuration(m));

  const target: EventTarget = mods.includes("window")
    ? window
    : mods.includes("document") || mods.includes("outside")
      ? document
      : el;

  const options: AddEventListenerOptions = {};
  if (mods.includes("capture")) options.capture = true;
  if (mods.includes("passive")) options.passive = true;
  if (mods.includes("once")) options.once = true;

  const invoke = (e: Event): void => {
    if (mods.includes("self") && e.target !== el) return;
    if (mods.includes("outside")) {
      const t = e.target as Node;
      if (el === t || el.contains(t)) return;
      if (!document.documentElement.contains(t)) return; // ignore removed nodes
    }
    if (keyMods.length && !keyMods.some((k) => matchKey(e as KeyboardEvent, k))) return;
    if (!passesSystem(e, mods)) return;
    if (mods.includes("prevent")) e.preventDefault();
    if (mods.includes("stop")) e.stopPropagation();

    try {
      const result = utils.evaluateAction(meta.expression, { $event: e });
      if (typeof result === "function") (result as (e: Event) => void)(e);
    } catch (err) {
      fail("E301", `@${event} handler failed while evaluating its expression.`, {
        el,
        expression: meta.expression,
        doc: "s-on",
        hint: "Names must be state from an enclosing s-data, a $magic, or an allowed global.",
        cause: err,
      });
    }
  };

  const debounceMs = durationFor(mods, "debounce");
  const throttleMs = durationFor(mods, "throttle");
  let handler: (e: Event) => void = invoke;
  if (debounceMs != null) handler = debounce(invoke, debounceMs);
  else if (throttleMs != null) handler = throttle(invoke, throttleMs);

  target.addEventListener(event, handler as EventListener, options);
  utils.cleanup(() => target.removeEventListener(event, handler as EventListener, options));
};
