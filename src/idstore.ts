/**
 * Scoped unique-id generation for accessible label/input pairing.
 *
 * `s-id="['name']"` opens an id group on an element; every `$id('name')` within
 * that subtree returns the same id, so a label and its input agree even when
 * the component is rendered many times. Without a group, each `$id` call gets a
 * fresh page-unique id.
 */

let counter = 0;
const groups = new WeakMap<Element, Map<string, number>>();

/** Open id groups on an element for the given names. */
export function allocGroup(el: Element, names: string[]): void {
  let map = groups.get(el);
  if (!map) groups.set(el, (map = new Map()));
  for (const name of names) map.set(name, ++counter);
}

/** Resolve an id for `name` at `el`, climbing to the nearest enclosing group. */
export function resolveId(el: Element, name: string, key?: string | number): string {
  let cur: Element | null = el;
  while (cur) {
    const map = groups.get(cur);
    if (map && map.has(name)) {
      const base = `${name}-${map.get(name)}`;
      return key != null ? `${base}-${key}` : base;
    }
    cur = cur.parentElement;
  }
  const base = `${name}-${++counter}`;
  return key != null ? `${base}-${key}` : base;
}
