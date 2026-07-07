/**
 * The MutationObserver.
 *
 * One observer watches the whole subtree for node additions and removals so
 * content added or removed after start (by fetch/HTMX/hand-written JS) is
 * initialized or torn down automatically. Idempotency guards make this safe:
 * an already-initialized node is skipped (which also handles moves, where a
 * node is removed and re-added in one batch), and a still-connected removed
 * node is treated as a move rather than a teardown.
 */

import { meta } from "../dom.js";
import { destroyTree, initTree } from "./tree.js";

let observer: MutationObserver | null = null;

export function startObserver(root: Node): void {
  if (observer) return;
  observer = new MutationObserver(handleMutations);
  observer.observe(root, { childList: true, subtree: true });
}

export function stopObserver(): void {
  observer?.disconnect();
  observer = null;
}

function handleMutations(records: MutationRecord[]): void {
  const removed: Element[] = [];
  const added: Element[] = [];

  for (const rec of records) {
    if (rec.type !== "childList") continue;
    rec.removedNodes.forEach((n) => {
      if (n.nodeType === 1) removed.push(n as Element);
    });
    rec.addedNodes.forEach((n) => {
      if (n.nodeType === 1) added.push(n as Element);
    });
  }

  // Tear down nodes that are genuinely gone (a moved node stays connected).
  for (const el of removed) {
    if (!el.isConnected) destroyTree(el);
  }

  // Initialize freshly added, not-yet-initialized nodes.
  for (const el of added) {
    if (el.isConnected && !meta(el).initialized) initTree(el);
  }
}
