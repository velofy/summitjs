/**
 * The Summit global.
 *
 * This is the object users interact with: register data, directives, magics,
 * stores, and plugins, then start. Registration is timing-safe. Built-ins are
 * registered at import, custom registrations override them, and start() can be
 * called whenever the DOM is ready. There is no load-order event to miss.
 */

import {
  registerData,
  registerBind,
  registerDirective,
  registerMagic,
  setStore,
  getStore,
  getBind,
} from "./registry/registry.js";
import { createScope } from "./scope/index.js";
import { initTree, destroyTree, startObserver, setSummitGlobal } from "./lifecycle/index.js";
import { registerBuiltinDirectives } from "./directives/index.js";
import { registerBuiltinMagics } from "./magics/index.js";
import { signal, computed, effect, reactive, batch, nextTick } from "./reactivity/index.js";
import { addGlobals } from "./evaluator/index.js";
import { fail } from "./errors.js";
import type { DataProvider, BindProvider, DirectiveHandler, MagicFactory } from "./types.js";

export const version = "0.1.0";

let started = false;

function dispatch(name: string): void {
  if (typeof document !== "undefined") document.dispatchEvent(new CustomEvent(name));
}

function start(root?: Element): void {
  if (started) return;
  started = true;
  const el = root ?? (typeof document !== "undefined" ? document.body : undefined);
  if (!el) return;
  dispatch("summit:init");
  initTree(el);
  startObserver(el.ownerDocument?.body ?? el);
  dispatch("summit:initialized");
}

export interface SummitGlobal {
  version: string;
  started: () => boolean;
  start(root?: Element): void;
  data(name: string, provider: DataProvider): SummitGlobal;
  directive(name: string, handler: DirectiveHandler, priority?: number): SummitGlobal;
  magic(name: string, factory: MagicFactory): SummitGlobal;
  bind(name: string, provider: BindProvider): SummitGlobal;
  store(name: string, value?: unknown): unknown;
  plugin(fn: (summit: SummitGlobal) => void): SummitGlobal;
  addGlobals(names: string[]): SummitGlobal;
  getBind: typeof getBind;
  // Reactivity primitives, exposed for advanced use.
  signal: typeof signal;
  computed: typeof computed;
  effect: typeof effect;
  reactive: typeof reactive;
  batch: typeof batch;
  nextTick: typeof nextTick;
  initTree: typeof initTree;
  destroyTree: typeof destroyTree;
}

export const Summit: SummitGlobal = {
  version,
  started: () => started,
  start,

  data(name, provider) {
    registerData(name, provider);
    return this;
  },

  directive(name, handler, priority) {
    registerDirective(name, handler, priority);
    return this;
  },

  magic(name, factory) {
    registerMagic(name, factory);
    return this;
  },

  bind(name, provider) {
    registerBind(name, provider);
    return this;
  },

  store(name, value) {
    if (value === undefined) return getStore(name);
    if (value !== null && typeof value === "object") {
      const scoped = createScope(value as Record<PropertyKey, unknown>);
      setStore(name, scoped);
      const initFn = (scoped as Record<string, unknown>)["init"];
      if (typeof initFn === "function") {
        try {
          (initFn as () => void)();
        } catch (err) {
          fail("E103", `store "${name}" init() threw.`, { doc: "globals-store", cause: err });
        }
      }
      return scoped;
    }
    setStore(name, value);
    return getStore(name);
  },

  plugin(fn) {
    fn(this);
    return this;
  },

  addGlobals(names) {
    addGlobals(names);
    return this;
  },

  getBind,
  signal,
  computed,
  effect,
  reactive,
  batch,
  nextTick,
  initTree,
  destroyTree,
};

// Register built-ins at import so they are always available. User registrations
// made afterward override them.
registerBuiltinDirectives();
registerBuiltinMagics();

// Let directives reach the global (utils.Summit).
setSummitGlobal(Summit as unknown as import("./types.js").SummitGlobalLike);

export default Summit;
