/**
 * Deep reactive objects.
 *
 * `reactive(obj)` returns a Proxy that tracks property reads and triggers on
 * writes, so `this.open = true` inside a component method just works. Nested
 * objects and arrays are wrapped lazily on access. This is what backs a
 * component's `s-data` scope, giving Alpine-style ergonomics on top of
 * Summit's fine-grained effect system.
 */

import { type Dep, track, trigger } from "./effect.js";

const RAW = Symbol("summit.raw");
const ITERATE_KEY = Symbol("summit.iterate");

const targetMap = new WeakMap<object, Map<PropertyKey, Dep>>();
const proxyMap = new WeakMap<object, object>();

function getDep(target: object, key: PropertyKey): Dep {
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  return dep;
}

function trackProp(target: object, key: PropertyKey): void {
  track(getDep(target, key));
}

function triggerProp(target: object, key: PropertyKey): void {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) trigger(dep);
}

function isObject(x: unknown): x is object {
  return x !== null && typeof x === "object";
}

/**
 * Only plain objects and arrays are deeply reactive. Class instances (DOM
 * nodes, Date, Map, RegExp, ...) are returned untouched, so storing a DOM
 * element or other host object in reactive data never breaks it.
 */
function isPlainObject(o: object): boolean {
  const proto = Object.getPrototypeOf(o);
  return proto === Object.prototype || proto === null;
}
function shouldWrap(o: unknown): o is object {
  return isObject(o) && (Array.isArray(o) || isPlainObject(o));
}

const handlers: ProxyHandler<Record<PropertyKey, unknown>> = {
  get(target, key, receiver) {
    if (key === RAW) return target;
    const result = Reflect.get(target, key, receiver);
    // Symbol keys and built-in prototype methods are not tracked as data.
    if (typeof key === "symbol") return result;
    trackProp(target, key);
    if (shouldWrap(result)) return reactive(result);
    return result;
  },

  set(target, key, value, receiver) {
    const raw = isObject(value) ? toRaw(value) : value;
    const isArray = Array.isArray(target);
    const hadKey = isArray
      ? Number(key) < target.length
      : Object.prototype.hasOwnProperty.call(target, key);
    const oldValue = (target as Record<PropertyKey, unknown>)[key as string];
    const result = Reflect.set(target, key, raw, receiver);

    if (!hadKey) {
      // A brand new key: notify iteration watchers (s-for over objects) too.
      triggerProp(target, key);
      triggerProp(target, isArray ? "length" : ITERATE_KEY);
    } else if (!Object.is(oldValue, raw)) {
      triggerProp(target, key);
    }
    return result;
  },

  has(target, key) {
    trackProp(target, key);
    return Reflect.has(target, key);
  },

  deleteProperty(target, key) {
    const had = Object.prototype.hasOwnProperty.call(target, key);
    const result = Reflect.deleteProperty(target, key);
    if (had && result) {
      triggerProp(target, key);
      triggerProp(target, ITERATE_KEY);
    }
    return result;
  },

  ownKeys(target) {
    trackProp(target, Array.isArray(target) ? "length" : ITERATE_KEY);
    return Reflect.ownKeys(target);
  },
};

/** Wrap an object in a deep reactive proxy. Idempotent and cached per object. */
export function reactive<T extends object>(target: T): T {
  if (!shouldWrap(target)) return target;
  // Already a proxy.
  if ((target as { [RAW]?: unknown })[RAW]) return target;
  const existing = proxyMap.get(target);
  if (existing) return existing as T;
  const proxy = new Proxy(target as Record<PropertyKey, unknown>, handlers) as T;
  proxyMap.set(target, proxy);
  return proxy;
}

/** Unwrap a reactive proxy back to its plain object. Safe on non-proxies. */
export function toRaw<T>(observed: T): T {
  const raw = observed && (observed as { [RAW]?: T })[RAW];
  return raw ? toRaw(raw) : observed;
}

/** True if `x` is a reactive proxy. */
export function isReactive(x: unknown): boolean {
  return isObject(x) && Boolean((x as { [RAW]?: unknown })[RAW]);
}
