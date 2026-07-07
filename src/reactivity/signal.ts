/**
 * A signal: a single reactive value with an explicit getter/setter.
 *
 * Reading the signal (calling it) subscribes the active effect. Writing it
 * (`.set`) wakes every subscribed effect, but only if the value actually
 * changed (`Object.is`). `.peek()` reads without subscribing.
 */

import { type Dep, track, trigger } from "./effect.js";

export interface Signal<T> {
  (): T;
  set(next: T | ((prev: T) => T)): void;
  peek(): T;
}

export function signal<T>(initial: T): Signal<T> {
  let value = initial;
  const dep: Dep = new Set();

  const read = function (): T {
    track(dep);
    return value;
  } as Signal<T>;

  read.set = (next: T | ((prev: T) => T)): void => {
    const nextValue = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
    if (!Object.is(nextValue, value)) {
      value = nextValue;
      trigger(dep);
    }
  };

  read.peek = (): T => value;

  return read;
}

/** True if `x` is a signal produced by `signal()`. */
export function isSignal<T = unknown>(x: unknown): x is Signal<T> {
  return typeof x === "function" && typeof (x as Signal<T>).set === "function" && typeof (x as Signal<T>).peek === "function";
}
