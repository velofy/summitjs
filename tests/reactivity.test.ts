import { describe, it, expect, vi } from "vitest";
import {
  signal,
  computed,
  reactive,
  effect,
  batch,
  untrack,
  stop,
  nextTick,
  domEffect,
} from "../src/reactivity/index.js";

describe("signal", () => {
  it("reads and writes", () => {
    const count = signal(0);
    expect(count()).toBe(0);
    count.set(5);
    expect(count()).toBe(5);
  });

  it("supports updater functions", () => {
    const count = signal(1);
    count.set((c) => c + 1);
    expect(count()).toBe(2);
  });

  it("peek does not subscribe", () => {
    const count = signal(0);
    const spy = vi.fn();
    effect(() => {
      spy(count.peek());
    });
    expect(spy).toHaveBeenCalledTimes(1);
    count.set(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("does not trigger when the value is unchanged", () => {
    const count = signal(0);
    const spy = vi.fn();
    effect(() => spy(count()));
    count.set(0);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("effect", () => {
  it("runs immediately and re-runs on change", () => {
    const count = signal(0);
    const spy = vi.fn();
    effect(() => spy(count()));
    expect(spy).toHaveBeenCalledTimes(1);
    count.set(1);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(1);
  });

  it("is fine-grained: unrelated signals do not re-run it", () => {
    const a = signal(0);
    const b = signal(0);
    const spy = vi.fn();
    effect(() => spy(a()));
    b.set(10); // b is never read by the effect
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("re-tracks conditional dependencies", () => {
    const toggle = signal(true);
    const a = signal("a");
    const b = signal("b");
    const spy = vi.fn();
    effect(() => spy(toggle() ? a() : b()));
    expect(spy).toHaveBeenLastCalledWith("a");
    // While reading a, changing b must not re-run.
    b.set("b2");
    expect(spy).toHaveBeenCalledTimes(1);
    toggle.set(false);
    expect(spy).toHaveBeenLastCalledWith("b2");
    // Now a is no longer a dependency.
    a.set("a2");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("stop() halts re-runs", () => {
    const count = signal(0);
    const spy = vi.fn();
    const runner = effect(() => spy(count()));
    stop(runner);
    count.set(1);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("guards against self-write infinite loops", () => {
    const count = signal(0);
    // Reading and writing the same signal must not recurse forever.
    effect(() => {
      if (count() < 3) count.set(count() + 1);
    });
    expect(count()).toBe(1);
  });
});

describe("computed", () => {
  it("derives and updates", () => {
    const count = signal(2);
    const double = computed(() => count() * 2);
    expect(double()).toBe(4);
    count.set(5);
    expect(double()).toBe(10);
  });

  it("caches: getter runs only when a dependency changes", () => {
    const count = signal(1);
    const getter = vi.fn(() => count() * 2);
    const double = computed(getter);
    double();
    double();
    double();
    expect(getter).toHaveBeenCalledTimes(1); // cached across reads
    count.set(2);
    double();
    expect(getter).toHaveBeenCalledTimes(2); // recomputed once after change
  });

  it("propagates to effects", () => {
    const count = signal(1);
    const double = computed(() => count() * 2);
    const spy = vi.fn();
    effect(() => spy(double()));
    expect(spy).toHaveBeenLastCalledWith(2);
    count.set(3);
    expect(spy).toHaveBeenLastCalledWith(6);
  });
});

describe("reactive", () => {
  it("tracks property reads and writes", () => {
    const state = reactive({ open: false });
    const spy = vi.fn();
    effect(() => spy(state.open));
    state.open = true;
    expect(spy).toHaveBeenLastCalledWith(true);
  });

  it("is fine-grained across properties", () => {
    const state = reactive({ a: 1, b: 2 });
    const spy = vi.fn();
    effect(() => spy(state.a));
    state.b = 20;
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("tracks nested objects", () => {
    const state = reactive({ user: { name: "ada" } });
    const spy = vi.fn();
    effect(() => spy(state.user.name));
    state.user.name = "grace";
    expect(spy).toHaveBeenLastCalledWith("grace");
  });

  it("tracks array mutation for iteration", () => {
    const state = reactive({ items: [1, 2] });
    const spy = vi.fn();
    effect(() => spy(state.items.length));
    state.items.push(3);
    expect(spy).toHaveBeenLastCalledWith(3);
  });

  it("binds `this` in methods", () => {
    const state = reactive({
      count: 0,
      inc(this: { count: number }) {
        this.count++;
      },
    });
    const spy = vi.fn();
    effect(() => spy(state.count));
    state.inc();
    expect(spy).toHaveBeenLastCalledWith(1);
  });
});

describe("batch", () => {
  it("coalesces multiple writes into one effect run", () => {
    const a = signal(0);
    const b = signal(0);
    const spy = vi.fn();
    effect(() => spy(a() + b()));
    batch(() => {
      a.set(1);
      b.set(2);
    });
    // Once for the initial run, once for the batch.
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(3);
  });
});

describe("untrack", () => {
  it("reads without subscribing", () => {
    const a = signal(0);
    const b = signal(0);
    const spy = vi.fn();
    effect(() => spy(a() + untrack(() => b())));
    b.set(10);
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("domEffect + nextTick", () => {
  it("batches DOM effects onto the microtask queue", async () => {
    const count = signal(0);
    const spy = vi.fn();
    const dispose = domEffect(() => spy(count()));
    expect(spy).toHaveBeenCalledTimes(1);
    count.set(1);
    count.set(2);
    count.set(3);
    // Still not run again synchronously.
    expect(spy).toHaveBeenCalledTimes(1);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(3);
    dispose();
    count.set(4);
    await nextTick();
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
