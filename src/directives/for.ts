/**
 * s-for: keyed list rendering on a <template>.
 *
 *   s-for="item in items"
 *   s-for="(item, index) in items"
 *   s-for="(value, key) in object"
 *   s-for="n in 10"           (range 1..10)
 *
 * With :key, blocks are reconciled by key: matching blocks are reused and
 * moved rather than destroyed and recreated, which keeps DOM state (focus,
 * scroll, inputs) stable across reorders. This is the fix for Alpine's weakest
 * area on large or reordering lists.
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

interface Item {
  value: unknown;
  index: number;
  objectKey?: string;
}

function normalize(source: unknown): Item[] {
  if (typeof source === "number") {
    return Array.from({ length: source }, (_, i) => ({ value: i + 1, index: i }));
  }
  if (Array.isArray(source)) {
    return source.map((value, index) => ({ value, index }));
  }
  if (source && typeof source === "object") {
    return Object.entries(source as Record<string, unknown>).map(([k, value], index) => ({
      value,
      index,
      objectKey: k,
    }));
  }
  return [];
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

  // Compile the key expression once instead of re-parsing/re-interpreting it per
  // item on every run.
  const keyEval = keyExpr ? compileExpression(keyExpr) : null;

  const keyFor = (it: Item): unknown => {
    if (!keyEval) return it.objectKey ?? it.index;
    // A plain (non-reactive) scope is enough to read the key; the reactive
    // Proxy is only paid for when a block is actually created.
    const data: Record<string, unknown> = { [itemName]: it.value };
    if (indexName) data[indexName] = it.objectKey ?? it.index;
    try {
      return keyEval(makeEnv(el, data).env);
    } catch {
      return it.index;
    }
  };

  const makeBlockScope = (it: Item): Scope => {
    const data: Record<string, unknown> = { [itemName]: it.value };
    if (indexName) data[indexName] = it.objectKey ?? it.index;
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
    const items = normalize(utils.evaluate(sourceExpr));
    const next = new Map<unknown, Block>();
    const orderedKeys: unknown[] = [];

    for (const it of items) {
      // Reuse an existing block for this key when possible.
      const key = keyFor(it);
      orderedKeys.push(key);

      const existing = blocks.get(key);
      if (existing) {
        // Update the reused block's item and index reactively.
        (existing.scope as Record<string, unknown>)[itemName] = it.value;
        if (indexName) (existing.scope as Record<string, unknown>)[indexName] = it.objectKey ?? it.index;
        next.set(key, existing);
        blocks.delete(key);
      } else {
        const scope = makeBlockScope(it);
        const node = blueprint.cloneNode(true) as Element;
        // Attach before initializing so directives that resolve the component
        // root by walking the DOM (e.g. s-ref into $refs) find it. The ordering
        // pass below still puts every node in its final position.
        parent.insertBefore(node, anchor);
        utils.initTree(node, [...parentScopes, scope]);
        next.set(key, { node, scope });
      }
    }

    // Anything left in the old map was removed.
    for (const block of blocks.values()) {
      utils.destroyTree(block.node);
      block.node.remove();
    }

    // Minimal-move placement: walk keys in reverse, inserting a node only when
    // it is not already immediately before the node that should follow it. An
    // unchanged list does zero DOM moves; append/remove/swap touch only what
    // actually changed, instead of re-inserting all N nodes every run.
    let expected: Node = anchor;
    for (let i = orderedKeys.length - 1; i >= 0; i--) {
      const node = next.get(orderedKeys[i])!.node;
      if (node.nextSibling !== expected) {
        parent.insertBefore(node, expected);
      }
      expected = node;
    }

    blocks = next;
  });

  utils.cleanup(clear);
};
