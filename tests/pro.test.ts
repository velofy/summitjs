import { describe, it, expect, beforeEach } from "vitest";
import Summit from "../src/index.js";

function mount(html: string): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.appendChild(el);
  Summit.initTree(el);
  return el;
}

const tick = () => Summit.nextTick();

beforeEach(() => {
  document.body.innerHTML = "";
});

function rowOrder(el: HTMLElement): string[] {
  return [...el.querySelectorAll(".row")].map((n) => n.getAttribute("data-k") ?? "");
}

describe("s-for pro diffing (LIS)", () => {
  it("renders a keyed list", async () => {
    const el = mount(`
      <div s-data="{ items: [{id:1},{id:2},{id:3}] }">
        <template s-for="it in items" :key="it.id"><div class="row" :data-k="it.id" s-text="it.id"></div></template>
      </div>`);
    expect(rowOrder(el)).toEqual(["1", "2", "3"]);
    await tick();
  });

  it("survives a full shuffle with correct final order", async () => {
    const el = mount(`
      <div s-data="{ items: [1,2,3,4,5,6] }">
        <button class="go" @click="items = [4,1,6,2,5,3]"></button>
        <template s-for="n in items" :key="n"><div class="row" :data-k="n" s-text="n"></div></template>
      </div>`);
    expect(rowOrder(el)).toEqual(["1", "2", "3", "4", "5", "6"]);
    el.querySelector("button")!.click();
    await tick();
    expect(rowOrder(el)).toEqual(["4", "1", "6", "2", "5", "3"]);
    expect(new Set(rowOrder(el)).size).toBe(6);
  });

  it("reverses a large list correctly", async () => {
    const items = Array.from({ length: 50 }, (_, i) => i + 1);
    const el = mount(`
      <div s-data="{ items: ${JSON.stringify(items)} }">
        <button class="go" @click="items = items.slice().reverse()"></button>
        <template s-for="n in items" :key="n"><div class="row" :data-k="n" s-text="n"></div></template>
      </div>`);
    el.querySelector("button")!.click();
    await tick();
    expect(rowOrder(el)).toEqual(items.map(String).reverse());
  });

  it("keeps focus in a moved input", async () => {
    const el = mount(`
      <div s-data="{ items: [1,2,3] }">
        <button class="go" @click="items = [3,1,2]"></button>
        <template s-for="n in items" :key="n">
          <div class="row" :data-k="n"><input></div>
        </template>
      </div>`);
    const inputs = el.querySelectorAll("input");
    (inputs[0] as HTMLInputElement).focus();
    expect(document.activeElement).toBe(inputs[0]);
    el.querySelector("button")!.click();
    await tick();
    const after = el.querySelectorAll("input");
    expect(document.activeElement).toBe(after[1]); // same node, now second
  });

  it("handles object iteration", async () => {
    const el = mount(`<div s-data="{ obj: { b: 2, a: 1 } }">
      <template s-for="(v, k) in obj" :key="k"><span class="row" :data-k="k" s-text="v"></span></template>
    </div>`);
    expect(rowOrder(el)).toEqual(["b", "a"]);
  });
});

describe("s-island lazy hydration", () => {
  it("defers hydration until triggered in idle mode", async () => {
    const el = mount(`<div><section s-island="idle" s-data="{ n: 3 }"><span s-text="n"></span></section></div>`);
    // Not hydrated synchronously.
    expect(el.querySelector("span")!.textContent).toBe("");
    await new Promise((r) => setTimeout(r, 20));
    expect(el.querySelector("span")!.textContent).toBe("3");
  });

  it("hydrates when IntersectionObserver reports visibility", async () => {
    let fire: (() => void) | undefined;
    const FakeIO = class {
      constructor(_cb: IntersectionObserverCallback) {
        fire = () =>
          _cb(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver,
          );
      }
      observe(): void {}
      disconnect(): void {}
      unobserve(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
      root = null;
      rootMargin = "";
      thresholds = [];
    };
    const prev = (globalThis as Record<string, unknown>).IntersectionObserver;
    (globalThis as Record<string, unknown>).IntersectionObserver = FakeIO;
    try {
      const el = mount(`<div><section s-island s-data="{ n: 7 }"><span s-text="n"></span></section></div>`);
      expect(el.querySelector("span")!.textContent).toBe(""); // parked
      fire!();
      await new Promise((r) => setTimeout(r, 20));
      expect(el.querySelector("span")!.textContent).toBe("7");
    } finally {
      (globalThis as Record<string, unknown>).IntersectionObserver = prev;
    }
  });
});
