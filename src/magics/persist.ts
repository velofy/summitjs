/**
 * $persist: reactive state backed by localStorage.
 *
 *   x = { count: $persist(0) }            persists under key "count"
 *   x = { count: $persist(0).as('c') }    persists under key "c"
 *
 * $persist returns a marker that s-data resolves after the scope is reactive:
 * it seeds the value from storage (or the default) and writes back on change.
 */

const MARK = "__summitPersist";

export interface PersistMarker {
  [MARK]: true;
  initial: unknown;
  key: string | null;
  as(key: string | number): PersistMarker;
}

export function createPersist(initial: unknown): PersistMarker {
  return {
    [MARK]: true,
    initial,
    key: null,
    as(key: string | number): PersistMarker {
      this.key = String(key);
      return this;
    },
  };
}

export function isPersistMarker(value: unknown): value is PersistMarker {
  return !!value && typeof value === "object" && (value as Record<string, unknown>)[MARK] === true;
}
