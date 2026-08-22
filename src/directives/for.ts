/**
 * s-for: keyed list rendering on a <template>.
 *
 *   s-for="item in items"
 *   s-for="(item, index) in items"
 *   s-for="(value, key) in object"
 *   s-for="n in 10"           (range 1..10)
 *
 * With :key, blocks are reconciled by key. Pro diffing: an O(n log n) longest
 * increasing subsequence over old positions marks the nodes that are already
 * in relative order; only the rest move. That is the theoretical minimum number
 * of DOM moves for any reorder (shuffle, reverse, sort), which keeps large
 * catalogs and tables smooth.
 */

import type { DirectiveHandler } from "../types.js";
import { reactive } from "../reactivity/index.js";
import { makeEnv } from "../scope/index.js";
import { compileExpression } from "../evaluator/index.js";
import type { Scope } from "../dom.js";
import { warn } from "../errors.js";

interface Block {
  node: Element;
  scope: Scope;
}

const FOR_RE = /^\s*(.+?)\s+(?:in|of)\s+([\s\S]+)$/;

function parseIterator(raw: string): { item: string; index: string | null } {
  const trimmed = raw.trim();
  if (trimmed.startsWith("(")) {
    const inner = trimmed.slice(1, -1);
    const parts = inner.split(",").map((s) => s.trim());
    return { item: parts[0]!, index: parts[1] ?? null };
  }
  return { item: trimmed, index: null };
}

/**
 * Longest strictly increasing subsequence of `arr`, returned as a list of
 * indices into `arr`. O(n log n). Used to find the largest set of list blocks
 * that are already in their final relative order and therefore need no move.
 */
function lisIndices(arr: number[]): number[] {
  const n = arr.length;
  if (n === 0) return [];
  const tails: number[] = [];
  const tailIdx: number[] = [];
  const prev: number[] = new Array(n).fill(-1);
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < v) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) prev[i] = tailIdx[lo - 1]!;
    tails[lo] = v;
    tailIdx[lo] = i;
  }
  const out: number[] = [];
  for (let i = tailIdx[tails.length - 1]!; i !== -1; i = prev[i]!) out.push(i);
  return out.reverse();
}

export const sFor: DirectiveHandler = (el, meta, utils) => {
  if (el.tagName !== "TEMPLATE") {
    warn("E401", "s-for must be used on a <template> element.", {
      el,
      doc: "s-for",
      hint: `Wrap the repeated markup: <template s-for="${meta.expression}"><li>...</li></template>`,
    });
    return;
  }
  const parent = el.parentNode;
  if (!parent) return;

  const blueprint = (el as HTMLTemplateElement).content.firstElementChild;
  if (!blueprint) {
    warn("E402", "s-for <template> needs exactly one root element.", { el, doc: "s-for" });
    return;
  }

  const { item: itemName, index: indexName } = parseIterator(meta.expression.replace(FOR_RE, "$1"));
  const sourceExpr = meta.expression.replace(FOR_RE, "$2");
  const keyExpr = el.getAttribute(":key") ?? el.getAttribute("s-bind:key");

  const anchor = document.createComment("s-for");
  parent.insertBefore(anchor, el);
  el.remove();

  const parentScopes = utils.scopes;
  let blocks = new Map<unknown, Block>();
  let prevKeys: unknown[] = [];

  // Compile the key expression once instead of re-parsing/re-interpreting it per
  // item on every run.
  const keyEval = keyExpr ? compileExpression(keyExpr) : null;
  // One reusable locals object for key evaluation: avoids allocating a fresh
  // record per item per run on large lists.
  const keyLocals: Record<string, unknown> = {};

  const keyFor = (value: unknown, index: number, objectKey?: string): unknown => {
    if (!keyEval) return objectKey ?? index;
    // A plain (non-reactive) scope is enough to read the key; the reactive
    // Proxy is only paid for when a block is actually created.
    keyLocals[itemName] = value;
    if (indexName) keyLocals[indexName] = objectKey ?? index;
    try {
      return keyEval(makeEnv(el, keyLocals).env);
    } catch {
      return index;
    }
  };

  const makeBlockScope = (value: unknown, index: number, objectKey?: string): Scope => {
    const data: Record<string, unknown> = { [itemName]: value };
    if (indexName) data[indexName] = objectKey ?? index;
    return reactive(data);
  };

  const clear = (): void => {
    for (const block of blocks.values()) {
      utils.destroyTree(block.node);
      block.node.remove();
    }
    blocks.clear();
  };

  utils.effect(() => {
    const source = utils.evaluate(sourceExpr);

    // Flatten the source into parallel value/key arrays without allocating an
    // intermediate Item wrapper per entry.
    const values: unknown[] = [];
    const keys: unknown[] = [];
    let objKeys: string[] | null = null;
    if (typeof source === "number") {
      for (let i = 0; i < source; i++) values.push(i + 1);
    } else if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) values.push(source[i]);
    } else if (source && typeof source === "object") {
      objKeys = Object.keys(source as Record<string, unknown>);
      for (const k of objKeys) values.push((source as Record<string, unknown>)[k]);
    }

    const next = new Map<unknown, Block>();
    const created: boolean[] = new Array(values.length).fill(false);

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const objectKey = objKeys ? objKeys[i] : undefined;
      const key = keyFor(value, i, objectKey);
      keys.push(key);

      // Reuse an existing block for this key when possible.
      const existing = blocks.get(key);
      if (existing) {
        // Update the reused block's item and index reactively.
        (existing.scope as Record<string, unknown>)[itemName] = value;
        if (indexName)
          (existing.scope as Record<string, unknown>)[indexName] = objectKey ?? i;
        next.set(key, existing);
        blocks.delete(key);
      } else {
        const scope = makeBlockScope(value, i, objectKey);
        const node = blueprint.cloneNode(true) as Element;
        // Attach before initializing so directives that resolve the component
        // root by walking the DOM (e.g. s-ref into $refs) find it. The ordering
        // pass below still puts every node in its final position.
        parent.insertBefore(node, anchor);
        utils.initTree(node, [...parentScopes, scope]);
        next.set(key, { node, scope });
        created[i] = true;
      }
    }

    // Anything left in the old map was removed.
    for (const block of blocks.values()) {
      utils.destroyTree(block.node);
      block.node.remove();
    }

    // Minimal-move placement via LIS. Map each surviving key to its previous
    // position; the longest increasing subsequence of those positions is the
    // set of nodes already in relative order. Everything else gets moved, and
    // only those get moved.
    if (prevKeys.length > 0 && keys.length > 0) {
      const prevPos = new Map<unknown, number>();
      for (let i = 0; i < prevKeys.length; i++) prevPos.set(prevKeys[i], i);
      const stable: number[] = [];
      const seq: number[] = [];
      for (let i = 0; i < keys.length; i++) {
        if (created[i]) continue;
        const pos = prevPos.get(keys[i]);
        if (pos === undefined) continue;
        stable.push(i);
        seq.push(pos);
      }
      const keep = new Set(lisIndices(seq));
      let expected: Node = anchor;
      for (let i = keys.length - 1; i >= 0; i--) {
        const node = next.get(keys[i])!.node;
        if (!keep.has(i)) {
          if (node.nextSibling !== expected) parent.insertBefore(node, expected);
          expected = node;
        } else {
          expected = node;
        }
      }
    } else {
      // First run (or empty-to-populated): nodes were appended sequentially, so
      // they are already in order; just verify cheaply like before.
      let expected: Node = anchor;
      for (let i = keys.length - 1; i >= 0; i--) {
        const node = next.get(keys[i])!.node;
        if (node.nextSibling !== expected) parent.insertBefore(node, expected);
        expected = node;
      }
    }

    blocks = next;
    prevKeys = keys;
  });

  utils.cleanup(clear);
};
