/**
 * Public surface of Summit's reactivity system.
 */

export { signal, isSignal, type Signal } from "./signal.js";
export { computed, type Computed } from "./computed.js";
export { reactive, toRaw, isReactive } from "./reactive.js";
export {
  effect,
  stop,
  track,
  trigger,
  untrack,
  batch,
  getActiveEffect,
  type Dep,
  type ReactiveEffect,
  type EffectOptions,
} from "./effect.js";
export { queueJob, nextTick } from "./scheduler.js";

import { effect, stop, type ReactiveEffect } from "./effect.js";
import { queueJob } from "./scheduler.js";

/**
 * A batched, DOM-facing effect. It runs once immediately, then re-runs on the
 * microtask queue whenever a dependency changes. Returns a disposer. This is
 * the primitive every reactive directive is built on.
 */
export function domEffect(fn: () => void): () => void {
  let runner: ReactiveEffect;
  runner = effect(fn, {
    lazy: true,
    scheduler: () => queueJob(runner),
  });
  runner();
  return () => stop(runner);
}
