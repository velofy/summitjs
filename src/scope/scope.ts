/**
 * Turns a plain data object into a reactive component scope.
 *
 * Two ergonomics fixes over Alpine happen here:
 *   - Methods are bound to the scope, so `toggle()` and `this.toggle()` both
 *     work and `this.open = x` triggers reactivity.
 *   - Getters become cached computeds, so a getter used in ten places runs
 *     once per dependency change instead of ten times per render.
 */

import { reactive, computed } from "../reactivity/index.js";
import type { Scope } from "../dom.js";

export function createScope(raw: Record<PropertyKey, unknown>): Scope {
  const proxy = reactive(raw);

  const descriptors = Object.getOwnPropertyDescriptors(raw);
  for (const key of Object.keys(descriptors)) {
    const desc = descriptors[key]!;
    if (typeof desc.get === "function") {
      // Cache the getter as a computed keyed to the reactive scope.
      const getter = desc.get;
      const setter = desc.set;
      const cached = computed(() => getter.call(proxy));
      Object.defineProperty(raw, key, {
        get: () => cached(),
        set: setter ? (v: unknown) => setter.call(proxy, v) : undefined,
        enumerable: desc.enumerable,
        configurable: true,
      });
    } else if (typeof desc.value === "function") {
      // Bind methods to the scope so `this` is always the component.
      raw[key] = (desc.value as (...a: unknown[]) => unknown).bind(proxy);
    }
  }

  return proxy;
}
