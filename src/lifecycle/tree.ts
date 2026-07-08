/**
 * initTree / destroyTree: the DOM engine.
 *
 * initTree walks an element and its descendants, establishing s-data scopes and
 * running directives in priority order. Structural directives (s-if, s-for,
 * s-teleport) take over their own subtree. destroyTree runs every teardown
 * callback so effects stop, listeners detach, and component `destroy()` fires.
 */

import { addCleanup, meta, nextMarker, resolveScopes, runCleanups, type Scope } from "../dom.js";
import { attachMagics, createScope, makeEnv } from "../scope/index.js";
import { domEffect } from "../reactivity/index.js";
import { getData, getDirective, directiveNames, DEFAULT_PRIORITY } from "../registry/registry.js";
import type { DirectiveMeta, DirectiveUtils, SummitGlobalLike } from "../types.js";
import { parseAttribute } from "./attributes.js";
import { warnOnce, fail, suggest } from "../errors.js";
import { isPersistMarker } from "../magics/persist.js";

const STRUCTURAL = new Set(["if", "for", "teleport"]);
// Valid directive names that are not in the directive registry: s-data creates
// scope, s-ignore is read directly off the element.
const SPECIAL = new Set(["data", "ignore"]);

let summitGlobal: SummitGlobalLike;
export function setSummitGlobal(g: SummitGlobalLike): void {
  summitGlobal = g;
}

// --- Observer suppression -------------------------------------------------

let suppressDepth = 0;
export function isSuppressed(): boolean {
  return suppressDepth > 0;
}
/** Run a DOM mutation that Summit itself performs, hidden from the observer. */
export function mutateDom<T>(fn: () => T): T {
  suppressDepth++;
  try {
    return fn();
  } finally {
    suppressDepth--;
  }
}

// --- Directive collection -------------------------------------------------

function collectDirectives(el: Element): DirectiveMeta[] {
  const out: DirectiveMeta[] = [];
  for (const attr of Array.from(el.attributes)) {
    const parsed = parseAttribute(attr.name, attr.value);
    if (!parsed) continue;
    if (SPECIAL.has(parsed.name) || getDirective(parsed.name)) {
      out.push(parsed);
    } else {
      // Looks like a directive (s-*, @*, :*) but nothing handles it. A typo like
      // s-clik or s-modle is a common first-try mistake; point at the right one.
      const hit = suggest(parsed.name, [...directiveNames(), ...SPECIAL]);
      warnOnce(
        `dir:${parsed.name}`,
        "E201",
        `unknown directive "${attr.name}".`,
        {
          el,
          doc: hit ? `s-${hit}` : "start",
          hint: hit ? `Did you mean "s-${hit}"?` : "See the directive reference.",
        },
      );
    }
  }
  return out;
}

function priorityOf(name: string): number {
  return getDirective(name)?.priority ?? DEFAULT_PRIORITY;
}

// --- Utilities handed to directives --------------------------------------

function makeUtils(el: Element, scopes: Scope[]): DirectiveUtils {
  const handle = makeEnv(el);
  return {
    evaluate: (expression: string) => handle.evaluate(expression),
    evaluateAction: (expression: string, locals?: Scope) => handle.evaluateAction(expression, locals),
    effect: (fn: () => void) => {
      const dispose = domEffect(fn);
      addCleanup(el, dispose);
    },
    cleanup: (fn: () => void) => addCleanup(el, fn),
    initTree,
    destroyTree,
    scopes,
    makeEnv: (e: Element, locals?: Scope) => makeEnv(e, locals).env,
    Summit: summitGlobal,
  };
}

function runDirective(el: Element, dmeta: DirectiveMeta, scopes: Scope[]): void {
  const entry = getDirective(dmeta.name);
  if (!entry) return;
  try {
    entry.handler(el, dmeta, makeUtils(el, scopes));
  } catch (err) {
    fail("E301", `s-${dmeta.name} failed while evaluating its expression.`, {
      el,
      expression: dmeta.expression,
      doc: `s-${dmeta.name}`,
      hint: "Every name in the expression must be state from an enclosing s-data, or an allowed global.",
      cause: err,
    });
  }
}

// --- s-data ---------------------------------------------------------------

const DATA_PROVIDER_RE = /^([A-Za-z_$][\w$]*)\s*(\(([\s\S]*)\))?$/;

/** Replace $persist() markers with their stored value and wire write-back. */
function resolvePersist(scope: Scope, el: Element): void {
  const hasLS = typeof localStorage !== "undefined";
  for (const key of Object.keys(scope)) {
    const marker = (scope as Record<string, unknown>)[key];
    if (!isPersistMarker(marker)) continue;
    const storeKey = marker.key ?? key;
    let value = marker.initial;
    if (hasLS) {
      try {
        const stored = localStorage.getItem(storeKey);
        if (stored != null) value = JSON.parse(stored);
      } catch {
        /* ignore malformed storage */
      }
    }
    (scope as Record<string, unknown>)[key] = value;
    if (hasLS) {
      const dispose = domEffect(() => {
        try {
          localStorage.setItem(storeKey, JSON.stringify((scope as Record<string, unknown>)[key]));
        } catch {
          /* storage full or unavailable */
        }
      });
      addCleanup(el, dispose);
    }
  }
}

function initData(el: Element, dmeta: DirectiveMeta, parentScopes: Scope[]): Scope[] {
  // The data expression is evaluated in the parent scope.
  const parentEnv = makeEnv(el);
  const expr = dmeta.expression.trim();

  let raw: unknown;
  try {
    const match = expr.match(DATA_PROVIDER_RE);
    if (match && getData(match[1]!)) {
      const provider = getData(match[1]!)!;
      const args = match[2] ? (parentEnv.evaluate("[" + (match[3] ?? "") + "]") as unknown[]) : [];
      raw = provider(...args);
    } else if (expr === "") {
      raw = {};
    } else {
      raw = parentEnv.evaluate("(" + expr + ")");
    }
  } catch (err) {
    // A bad s-data must not take down the rest of the page: report it clearly
    // and start this component with empty state so siblings still initialize.
    fail("E104", "s-data could not be evaluated; the component starts with empty state.", {
      el,
      expression: expr,
      doc: "s-data",
      hint: "Check the object for unsupported syntax, e.g. an async method.",
      cause: err,
    });
    raw = {};
  }
  if (raw === null || typeof raw !== "object") raw = {};

  const scope = createScope(raw as Record<PropertyKey, unknown>);
  resolvePersist(scope, el);
  const newScopes = [...parentScopes, scope];
  const m = meta(el);
  m.scopes = newScopes;
  m.isRoot = true;
  m.refs = {};

  // Make $-magics reachable as this.$watch, this.$refs, etc. inside methods.
  attachMagics(raw as Record<PropertyKey, unknown>, el, newScopes);

  const initFn = (scope as Record<string, unknown>)["init"];
  if (typeof initFn === "function") {
    try {
      (initFn as () => void)();
    } catch (err) {
      fail("E101", "s-data init() threw.", { el, doc: "s-data", cause: err });
    }
  }
  const destroyFn = (scope as Record<string, unknown>)["destroy"];
  if (typeof destroyFn === "function") {
    addCleanup(el, () => {
      try {
        (destroyFn as () => void)();
      } catch (err) {
        fail("E102", "s-data destroy() threw.", { el, doc: "s-data", cause: err });
      }
    });
  }

  return newScopes;
}

// --- initTree / destroyTree ----------------------------------------------

export function initTree(el: Element, scopesArg?: Scope[]): void {
  const m = meta(el);
  if (m.initialized || m.ignore) return;
  if (el.hasAttribute("s-ignore")) {
    m.ignore = true;
    m.initialized = true;
    return;
  }

  let scopes = scopesArg ?? resolveScopes(el);
  m.scopes = scopes;
  m.marker = nextMarker();

  const dirs = collectDirectives(el);

  const dataDir = dirs.find((d) => d.name === "data");
  if (dataDir) scopes = initData(el, dataDir, scopes);

  const structural = dirs.find((d) => STRUCTURAL.has(d.name));
  if (structural) {
    m.initialized = true;
    runDirective(el, structural, scopes);
    return; // structural directives own their subtree
  }

  const rest = dirs.filter((d) => d.name !== "data").sort((a, b) => priorityOf(a.name) - priorityOf(b.name));
  for (const d of rest) runDirective(el, d, scopes);
  m.initialized = true;

  // Descend into element children with the (possibly extended) scope stack.
  // Snapshot the children first: it survives sibling mutations during init
  // (structural directives insert/remove nodes) and sidesteps host quirks
  // where nextElementSibling is unreliable.
  for (const child of Array.from(el.children)) {
    initTree(child, scopes);
  }
}

export function destroyTree(el: Element): void {
  runCleanups(el);
  for (const child of Array.from(el.children)) {
    destroyTree(child);
  }
  meta(el).initialized = false;
}
