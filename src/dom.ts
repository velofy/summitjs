/**
 * Per-element bookkeeping.
 *
 * Summit attaches a small metadata record to every element it touches: the
 * scope stack in effect there, teardown callbacks, a move-detection marker, and
 * whether the element is a component root. Kept in a WeakMap so nothing leaks
 * onto the DOM and everything is collected when a node is dropped.
 */

import { fail } from "./errors.js";

export type Scope = Record<PropertyKey, unknown>;

export interface SummitMeta {
  /** The s-data scope stack visible at this element, outermost first. */
  scopes?: Scope[];
  /** Teardown callbacks: stop effects, remove listeners, clear timers. */
  cleanups?: (() => void)[];
  /** Callbacks from a component's data `destroy()` method. */
  destroyCallbacks?: (() => void)[];
  /** Unique id used to recognize a moved (not removed) node. */
  marker?: number;
  /** True if this element carries its own s-data (a component root). */
  isRoot?: boolean;
  /** The $refs registry for a component root. */
  refs?: Record<string, Element>;
  /** Skip this element and its subtree entirely. */
  ignore?: boolean;
  /** Guard against initializing the same element twice. */
  initialized?: boolean;
}

const metaMap = new WeakMap<Node, SummitMeta>();

export function meta(node: Node): SummitMeta {
  let m = metaMap.get(node);
  if (!m) metaMap.set(node, (m = {}));
  return m;
}

export function hasMeta(node: Node): boolean {
  return metaMap.has(node);
}

let markerCount = 0;
export function nextMarker(): number {
  return ++markerCount;
}

/** Register a teardown callback for an element. */
export function addCleanup(el: Node, fn: () => void): void {
  const m = meta(el);
  (m.cleanups ??= []).push(fn);
}

/** Run and clear all teardown callbacks for an element. */
export function runCleanups(el: Node): void {
  const m = metaMap.get(el);
  if (!m) return;
  if (m.cleanups) {
    for (const fn of m.cleanups) {
      try {
        fn();
      } catch (err) {
        fail("E601", "a cleanup callback threw during teardown.", { doc: "lifecycle", cause: err });
      }
    }
    m.cleanups = [];
  }
  if (m.destroyCallbacks) {
    for (const fn of m.destroyCallbacks) {
      try {
        fn();
      } catch (err) {
        fail("E602", "a destroy() callback threw during teardown.", { doc: "lifecycle", cause: err });
      }
    }
    m.destroyCallbacks = [];
  }
}

/**
 * The scope stack visible at an element. Uses the stored stack if present,
 * otherwise climbs to the nearest ancestor that has one. Empty array if the
 * element is outside any Summit region.
 */
export function resolveScopes(el: Element): Scope[] {
  const own = metaMap.get(el)?.scopes;
  if (own) return own;
  let parent = el.parentElement;
  while (parent) {
    const s = metaMap.get(parent)?.scopes;
    if (s) return s;
    parent = parent.parentElement;
  }
  return [];
}

/** The nearest ancestor element (or self) that is a component root. */
export function closestRoot(el: Element): Element | null {
  let cur: Element | null = el;
  while (cur) {
    if (metaMap.get(cur)?.isRoot) return cur;
    cur = cur.parentElement;
  }
  return null;
}

/** The $refs registry for the component `el` belongs to, creating it lazily. */
export function refsFor(el: Element): Record<string, Element> {
  const root = closestRoot(el) ?? el;
  const m = meta(root);
  return (m.refs ??= {});
}
