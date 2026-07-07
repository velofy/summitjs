/**
 * A computed value: a memoized, lazily-evaluated derivation.
 *
 * Unlike a plain getter (which Alpine re-runs on every read), a computed caches
 * its result and only recomputes when one of its own dependencies changes. It
 * stays lazy: the getter does not run until something reads the computed.
 */

import { type Dep, type ReactiveEffect, effect, track, trigger } from "./effect.js";

export interface Computed<T> {
  (): T;
  peek(): T;
}

export function computed<T>(getter: () => T): Computed<T> {
  let value: T;
  let dirty = true;
  const dep: Dep = new Set();

  const runner: ReactiveEffect = effect(getter, {
    lazy: true,
    scheduler: () => {
      // A dependency changed. Mark stale and notify our own subscribers so
      // they re-read (and thereby recompute) on demand.
      if (!dirty) {
        dirty = true;
        trigger(dep);
      }
    },
  });

  const read = function (): T {
    if (dirty) {
      value = runner() as T;
      dirty = false;
    }
    track(dep);
    return value;
  } as Computed<T>;

  read.peek = (): T => {
    if (dirty) {
      value = runner() as T;
      dirty = false;
    }
    return value;
  };

  return read;
}
