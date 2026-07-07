/**
 * Builds the RootEnv the evaluator resolves identifiers against.
 *
 * Resolution order for a name:
 *   1. extra locals (e.g. $event in a handler, or the loop item in s-for)
 *   2. the s-data scope stack, innermost first (so inner scopes shadow outer)
 *   3. `$`-prefixed magics
 * Anything else falls through to the evaluator's global allowlist.
 */

import { evaluateExpression, evaluateAction, type RootEnv } from "../evaluator/index.js";
import { resolveScopes, addCleanup, type Scope } from "../dom.js";
import { getMagic, magicNames } from "../registry/registry.js";
import { domEffect } from "../reactivity/index.js";
import type { MagicContext } from "../types.js";

const DOLLAR = 36; // '$'

export interface EnvHandle {
  env: RootEnv;
  thisVal: unknown;
  evaluate(expression: string): unknown;
  evaluateAction(expression: string, extraLocals?: Scope): unknown;
}

export function makeEnv(el: Element, locals?: Scope): EnvHandle {
  const scopes = resolveScopes(el);
  const thisVal = scopes.length ? scopes[scopes.length - 1] : undefined;

  const ctx: MagicContext = {
    el,
    scopes,
    evaluate: (expression: string) => evaluateExpression(expression, env, thisVal),
    effect: (fn: () => void) => {
      const dispose = domEffect(fn);
      addCleanup(el, dispose);
    },
    cleanup: (fn: () => void) => addCleanup(el, fn),
  };

  const env: RootEnv = {
    has(name: string): boolean {
      if (locals && name in locals) return true;
      for (let i = scopes.length - 1; i >= 0; i--) {
        if (name in scopes[i]!) return true;
      }
      if (name.charCodeAt(0) === DOLLAR && getMagic(name.slice(1))) return true;
      return false;
    },
    get(name: string): unknown {
      if (locals && name in locals) return locals[name];
      for (let i = scopes.length - 1; i >= 0; i--) {
        if (name in scopes[i]!) return scopes[i]![name];
      }
      if (name.charCodeAt(0) === DOLLAR) {
        const factory = getMagic(name.slice(1));
        if (factory) return factory(ctx);
      }
      return undefined;
    },
    set(name: string, value: unknown): void {
      for (let i = scopes.length - 1; i >= 0; i--) {
        if (name in scopes[i]!) {
          scopes[i]![name] = value;
          return;
        }
      }
      if (scopes.length) scopes[scopes.length - 1]![name] = value;
    },
  };

  return {
    env,
    thisVal,
    evaluate: (expression: string) => evaluateExpression(expression, env, thisVal),
    evaluateAction: (expression: string, extraLocals?: Scope) => {
      if (!extraLocals) return evaluateAction(expression, env, thisVal);
      // Layer additional locals (e.g. $event) on top for this one evaluation.
      const layered: RootEnv = {
        has: (n) => (n in extraLocals ? true : env.has(n)),
        get: (n) => (n in extraLocals ? extraLocals[n] : env.get(n)),
        set: (n, v) => env.set(n, v),
      };
      return evaluateAction(expression, layered, thisVal);
    },
  };
}

/**
 * Expose `$`-magics on a component's scope object so they are reachable as
 * `this.$watch`, `this.$refs`, `this.$el`, etc. from inside data methods and
 * init(). Defined as non-enumerable getters bound to the component root, so
 * they never leak into iteration or spreads.
 */
export function attachMagics(rawTarget: Record<PropertyKey, unknown>, el: Element, scopes: Scope[]): void {
  const ctx: MagicContext = {
    el,
    scopes,
    evaluate: (expression: string) =>
      evaluateExpression(expression, makeEnv(el).env, scopes.length ? scopes[scopes.length - 1] : undefined),
    effect: (fn: () => void) => addCleanup(el, domEffect(fn)),
    cleanup: (fn: () => void) => addCleanup(el, fn),
  };

  for (const name of magicNames()) {
    Object.defineProperty(rawTarget, "$" + name, {
      get: () => getMagic(name)!(ctx),
      enumerable: false,
      configurable: true,
    });
  }
}
