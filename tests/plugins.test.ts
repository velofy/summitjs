import { describe, it, expect, beforeEach, vi } from "vitest";
import Summit from "../src/index.js";
import { applyMask } from "../src/directives/mask.js";

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
  // happy-dom's localStorage is unreliable here; use a clean in-memory one.
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  });
});

describe("$persist", () => {
  it("seeds from the default and writes back on change", async () => {
    const el = mount(`<div s-data="{ n: $persist(1) }"><button @click="n++"></button><span s-text="n"></span></div>`);
    expect(el.querySelector("span")!.textContent).toBe("1");
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector("span")!.textContent).toBe("2");
    expect(JSON.parse(localStorage.getItem("n")!)).toBe(2);
  });

  it("seeds from existing storage over the default", () => {
    localStorage.setItem("n", "5");
    const el = mount(`<div s-data="{ n: $persist(1) }"><span s-text="n"></span></div>`);
    expect(el.querySelector("span")!.textContent).toBe("5");
  });

  it("honors .as() for a custom key", async () => {
    const el = mount(`<div s-data="{ n: $persist(0).as('count') }"><button @click="n++"></button></div>`);
    el.querySelector("button")!.click();
    await tick();
    expect(localStorage.getItem("count")).toBe("1");
  });
});

describe("s-mask", () => {
  it("formats against a pattern", () => {
    expect(applyMask("1234567890", "(999) 999-9999")).toBe("(123) 456-7890");
    expect(applyMask("abc123", "aa-99")).toBe("ab-12");
  });

  it("formats an input on typing", () => {
    const el = mount(`<div s-data><input s-mask="'(999) 999-9999'"></div>`);
    const input = el.querySelector("input")!;
    input.value = "1234567890";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(input.value).toBe("(123) 456-7890");
  });
});

describe("focus / anchor / collapse / intersect boot cleanly", () => {
  it("register and run without directive errors", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const el = mount(`<div s-data="{ open: false }">
      <button s-ref="t" @click="open = !open"></button>
      <div s-trap="open" s-anchor="$refs.t" s-collapse="open" s-intersect="open = true"><input></div>
    </div>`);
    el.querySelector("button")!.click();
    await tick();
    el.querySelector("button")!.click();
    await tick();
    const msg = spy.mock.calls.map((c) => c.join(" ")).join("\n");
    spy.mockRestore();
    expect(msg).not.toContain("[summit]");
  });
});
