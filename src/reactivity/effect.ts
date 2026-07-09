/**
 * The reactive effect system.
 *
 * This is the heart of Summit. An `effect` is a function that automatically
 * re-runs whenever any reactive value it read during its last run changes.
 * Dependency tracking is fine-grained: a `dep` is a set of effects that
 * depend on one specific value, so a change only wakes the effects that
 * actually read that value. Nothing else re-runs.
 */

export type Dep = Set<ReactiveEffect>;

export interface EffectOptions {
  /** Skip the initial run. The effect only runs when its scheduler fires. */
  lazy?: boolean;
  /** Called instead of re-running the effect directly when a dep changes. */
  scheduler?: () => void;
  /** Called when the effect is stopped. */
  onStop?: () => void;
}

export interface ReactiveEffect {
  (): void;
  /** The deps this effect is currently subscribed to. */
  deps: Dep[];
  /** Whether the effect is still live. Stopped effects never re-run. */
  active: boolean;
  scheduler?: () => void;
  onStop?: () => void;
  /** The user function this effect wraps. */
  raw: () => unknown;
}

let activeEffect: ReactiveEffect | undefined;
const effectStack: ReactiveEffect[] = [];

// Batching. While a batch is open, triggered effects are collected instead of
// run, then flushed once when the outermost batch closes.
let batchDepth = 0;
let pendingEffects = new Set<ReactiveEffect>();

/**
 * Create a reactive effect. Runs immediately unless `lazy` is set. Returns a
 * runner you can call manually or hand to `stop()`.
 */
export function effect(fn: () => unknown, options: EffectOptions = {}): ReactiveEffect {
  const runner = createReactiveEffect(fn, options);
  if (!options.lazy) runner();
  return runner;
}

function createReactiveEffect(fn: () => unknown, options: EffectOptions): ReactiveEffect {
  const runner = function reactiveEffect(): unknown {
    if (!runner.active) return fn();
    // Guard against an effect that reads a value it also writes: it must not
    // schedule itself into an infinite loop.
    if (effectStack.includes(runner)) return undefined;
    cleanupDeps(runner);
    try {
      effectStack.push(runner);
      activeEffect = runner;
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1];
    }
  } as ReactiveEffect;

  runner.deps = [];
  runner.active = true;
  runner.scheduler = options.scheduler;
  runner.onStop = options.onStop;
  runner.raw = fn;
  return runner;
}

function cleanupDeps(runner: ReactiveEffect): void {
  const { deps } = runner;
  for (const dep of deps) dep.delete(runner);
  deps.length = 0;
}

/** Permanently stop an effect and unsubscribe it from every dep. */
export function stop(runner: ReactiveEffect): void {
  if (runner.active) {
    cleanupDeps(runner);
    runner.onStop?.();
    runner.active = false;
  }
}

/** Record that the currently running effect depends on `dep`. */
export function track(dep: Dep): void {
  if (activeEffect) {
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
}

/** Wake every effect subscribed to `dep`. */
export function trigger(dep: Dep): void {
  if (dep.size === 0) return; // a value with no subscribers: nothing to wake
  // Snapshot first: an effect re-subscribing during its run must not mutate the
  // set we are iterating.
  const effects = [...dep];
  for (const eff of effects) {
    // Never re-trigger the effect that is currently running (self-write guard).
    if (eff === activeEffect) continue;
    if (batchDepth > 0) {
      pendingEffects.add(eff);
      continue;
    }
    runEffect(eff);
  }
}

function runEffect(eff: ReactiveEffect): void {
  if (eff.scheduler) eff.scheduler();
  else eff();
}

/** Run `fn` without subscribing the active effect to anything read inside it. */
export function untrack<T>(fn: () => T): T {
  const prev = activeEffect;
  activeEffect = undefined;
  try {
    return fn();
  } finally {
    activeEffect = prev;
  }
}

/**
 * Group multiple writes so dependent effects run once at the end instead of
 * after each write. Batches nest; only the outermost flush runs effects.
 */
export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    if (--batchDepth === 0) flushBatch();
  }
}

function flushBatch(): void {
  if (pendingEffects.size === 0) return;
  // Drain by swapping rather than copying: the flush runs with batchDepth 0, so
  // any further triggers run synchronously instead of refilling this set.
  const effects = pendingEffects;
  pendingEffects = new Set();
  for (const eff of effects) {
    if (eff.active) runEffect(eff);
  }
}

/** The effect that is currently executing, or undefined. For internal use. */
export function getActiveEffect(): ReactiveEffect | undefined {
  return activeEffect;
}
