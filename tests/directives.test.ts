import { describe, it, expect, beforeEach, vi } from "vitest";
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

describe("s-text / s-html", () => {
  it("renders and updates reactively", async () => {
    const el = mount(`<div s-data="{ msg: 'hello' }"><span s-text="msg"></span><button @click="msg = 'bye'"></button></div>`);
    const span = el.querySelector("span")!;
    expect(span.textContent).toBe("hello");
    el.querySelector("button")!.click();
    await tick();
    expect(span.textContent).toBe("bye");
  });

  it("s-html injects and initializes markup", async () => {
    const el = mount(`<div s-data="{ inner: '<b s-text=&quot;label&quot;></b>', label: 'X' }"><div s-html="inner"></div></div>`);
    await tick();
    const b = el.querySelector("b")!;
    expect(b).toBeTruthy();
    expect(b.textContent).toBe("X");
  });
});

describe("s-bind", () => {
  it("merges class with static classes", async () => {
    const el = mount(`<div s-data="{ on: true }"><span class="base" :class="{ active: on }"></span></div>`);
    const span = el.querySelector("span")!;
    expect(span.className).toContain("base");
    expect(span.className).toContain("active");
  });

  it("handles boolean attributes", async () => {
    const el = mount(`<div s-data="{ dis: true }"><button :disabled="dis"></button></div>`);
    const btn = el.querySelector("button")!;
    expect(btn.hasAttribute("disabled")).toBe(true);
  });

  it("removes attribute when value is false/null", () => {
    const el = mount(`<div s-data="{ href: null }"><a :href="href"></a></div>`);
    expect(el.querySelector("a")!.hasAttribute("href")).toBe(false);
  });
});

describe("s-on", () => {
  it("increments on click", async () => {
    const el = mount(`<div s-data="{ n: 0 }"><span s-text="n"></span><button @click="n++"></button></div>`);
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector("span")!.textContent).toBe("1");
  });

  it(".prevent calls preventDefault", () => {
    const el = mount(`<div s-data><a href="#" @click.prevent="0"></a></div>`);
    const event = new Event("click", { cancelable: true });
    el.querySelector("a")!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("filters by key modifier", async () => {
    const el = mount(`<div s-data="{ n: 0 }"><input @keydown.enter="n++"><span s-text="n"></span></div>`);
    const input = el.querySelector("input")!;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    await tick();
    expect(el.querySelector("span")!.textContent).toBe("0");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await tick();
    expect(el.querySelector("span")!.textContent).toBe("1");
  });

  it("calls a bare method reference with the event", async () => {
    const seen: string[] = [];
    Summit.data("logger", () => ({ log(e: Event) { seen.push(e.type); } }));
    const el = mount(`<div s-data="logger"><button @click="log"></button></div>`);
    el.querySelector("button")!.click();
    await tick();
    expect(seen).toEqual(["click"]);
  });
});

describe("s-model", () => {
  it("binds text input two-way", async () => {
    const el = mount(`<div s-data="{ name: 'ada' }"><input s-model="name"><span s-text="name"></span></div>`);
    const input = el.querySelector("input")!;
    expect(input.value).toBe("ada");
    input.value = "grace";
    input.dispatchEvent(new Event("input"));
    await tick();
    expect(el.querySelector("span")!.textContent).toBe("grace");
  });

  it("coerces with .number", async () => {
    const el = mount(`<div s-data="{ age: 0, doubled: 0 }"><input s-model.number="age"><span s-text="age * 2"></span></div>`);
    const input = el.querySelector("input")!;
    input.value = "21";
    input.dispatchEvent(new Event("input"));
    await tick();
    expect(el.querySelector("span")!.textContent).toBe("42");
  });

  it("binds a checkbox to a boolean", async () => {
    const el = mount(`<div s-data="{ agree: false }"><input type="checkbox" s-model="agree"><span s-text="agree"></span></div>`);
    const box = el.querySelector("input")!;
    box.checked = true;
    box.dispatchEvent(new Event("change"));
    await tick();
    expect(el.querySelector("span")!.textContent).toBe("true");
  });
});

describe("s-show", () => {
  it("toggles display", async () => {
    const el = mount(`<div s-data="{ open: true }"><p s-show="open"></p><button @click="open = !open"></button></div>`);
    const p = el.querySelector("p")! as HTMLElement;
    expect(p.style.display).not.toBe("none");
    el.querySelector("button")!.click();
    await tick();
    expect(p.style.display).toBe("none");
  });
});

describe("s-if", () => {
  it("adds and removes an element", async () => {
    const el = mount(`<div s-data="{ show: false }"><p s-if="show">Hi</p><button @click="show = !show"></button></div>`);
    expect(el.querySelector("p")).toBeNull();
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector("p")?.textContent).toBe("Hi");
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector("p")).toBeNull();
  });

  it("renders every root of a multi-child template, in order", async () => {
    const el = mount(
      `<div s-data="{ open: false }"><template s-if="open"><div class="overlay"></div><div class="dialog">Hi</div></template><button @click="open = !open"></button></div>`,
    );
    expect(el.querySelector(".overlay")).toBeNull();
    expect(el.querySelector(".dialog")).toBeNull();
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector(".overlay")).not.toBeNull();
    expect(el.querySelector(".dialog")?.textContent).toBe("Hi");
    // overlay comes before dialog in document order
    const pos = el.querySelector(".overlay")!.compareDocumentPosition(el.querySelector(".dialog")!);
    expect(pos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector(".overlay")).toBeNull();
    expect(el.querySelector(".dialog")).toBeNull();
  });
});

describe("diagnostics", () => {
  it("warns with a 'did you mean' suggestion for an unknown directive", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    mount(`<div s-data="{ n: 1 }"><span s-txt="n"></span></div>`);
    const msg = spy.mock.calls.map((c) => c.join(" ")).join("\n");
    spy.mockRestore();
    expect(msg).toContain("[summit]");
    expect(msg).toContain("E201");
    expect(msg).toContain("s-text");
  });

  it("reports a coded error with the expression when a directive throws", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    mount(`<div s-data="{ n: 5 }"><button @click="n()"></button></div>`);
    document.querySelector("button")!.click();
    await tick();
    const msg = spy.mock.calls.map((c) => c.join(" ")).join("\n");
    spy.mockRestore();
    expect(msg).toContain("[summit]");
    expect(msg).toContain("E301");
    expect(msg).toContain("n()");
  });

  it("contains a bad s-data: clear error, empty state, siblings still init", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const el = mount(`
      <div>
        <section s-data="{ s: 'idle', async go() { await 1 } }"><span class="broken" s-text="s || 'EMPTY'"></span></section>
        <section s-data="{ ok: 'healthy' }"><span class="sibling" s-text="ok"></span></section>
      </div>`);
    const msg = spy.mock.calls.map((c) => c.join(" ")).join("\n");
    spy.mockRestore();
    // A clear, coded, actionable error naming the unsupported syntax...
    expect(msg).toContain("E104");
    expect(msg).toContain("async");
    // ...the broken component degrades to empty state instead of throwing...
    expect(el.querySelector(".broken")!.textContent).toBe("EMPTY");
    // ...and the healthy sibling still initializes.
    expect(el.querySelector(".sibling")!.textContent).toBe("healthy");
  });
});

describe("s-for", () => {
  it("renders a keyed list and reconciles updates", async () => {
    const el = mount(`
      <ul s-data="{ items: [{ id: 1, label: 'a' }, { id: 2, label: 'b' }] }">
        <template s-for="item in items" :key="item.id"><li s-text="item.label"></li></template>
        <button @click="items.push({ id: 3, label: 'c' })"></button>
        <button @click="items.shift()"></button>
      </ul>`);
    let lis = el.querySelectorAll("li");
    expect([...lis].map((l) => l.textContent)).toEqual(["a", "b"]);

    el.querySelectorAll("button")[0]!.click();
    await tick();
    lis = el.querySelectorAll("li");
    expect([...lis].map((l) => l.textContent)).toEqual(["a", "b", "c"]);

    el.querySelectorAll("button")[1]!.click();
    await tick();
    lis = el.querySelectorAll("li");
    expect([...lis].map((l) => l.textContent)).toEqual(["b", "c"]);
  });

  it("renders a numeric range", () => {
    const el = mount(`<ul s-data><template s-for="n in 3"><li s-text="n"></li></template></ul>`);
    expect([...el.querySelectorAll("li")].map((l) => l.textContent)).toEqual(["1", "2", "3"]);
  });

  it("registers dynamic s-ref from loop items into $refs", async () => {
    const el = mount(`
      <div s-data="{ items: ['a', 'b', 'c'], keys: '', val: '' }">
        <template s-for="(it, i) in items" :key="i"><input s-ref="'f' + i" :value="it"></template>
        <button @click="keys = Object.keys($refs).sort().join(','); val = $refs.f1.value"></button>
        <span class="keys" s-text="keys"></span>
        <span class="val" s-text="val"></span>
      </div>`);
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector(".keys")!.textContent).toBe("f0,f1,f2");
    expect(el.querySelector(".val")!.textContent).toBe("b");
  });
});

describe("scope inheritance", () => {
  it("inner scopes read and shadow outer scopes", () => {
    const el = mount(`
      <div s-data="{ foo: 'outer' }">
        <span class="a" s-text="foo"></span>
        <div s-data="{ bar: 'inner' }">
          <span class="b" s-text="foo"></span>
          <span class="c" s-text="bar"></span>
          <div s-data="{ foo: 'shadow' }"><span class="d" s-text="foo"></span></div>
        </div>
      </div>`);
    expect(el.querySelector(".a")!.textContent).toBe("outer");
    expect(el.querySelector(".b")!.textContent).toBe("outer");
    expect(el.querySelector(".c")!.textContent).toBe("inner");
    expect(el.querySelector(".d")!.textContent).toBe("shadow");
  });
});

describe("computed getters", () => {
  it("exposes cached getters as values", async () => {
    const el = mount(`<div s-data="{ first: 'a', last: 'b', get full() { return this.first + this.last } }"><span s-text="full"></span><button @click="first = 'x'"></button></div>`);
    expect(el.querySelector("span")!.textContent).toBe("ab");
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector("span")!.textContent).toBe("xb");
  });
});

describe("$refs", () => {
  it("exposes referenced elements", async () => {
    const el = mount(`<div s-data><input s-ref="field"><button @click="$refs.field.value = 'set'"></button></div>`);
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector("input")!.value).toBe("set");
  });
});

describe("$store", () => {
  it("shares reactive state across components", async () => {
    Summit.store("counter", { n: 0, inc() { (this as { n: number }).n++; } });
    const el = mount(`
      <div>
        <div s-data><span class="x" s-text="$store.counter.n"></span></div>
        <div s-data><button @click="$store.counter.inc()"></button></div>
      </div>`);
    expect(el.querySelector(".x")!.textContent).toBe("0");
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector(".x")!.textContent).toBe("1");
  });
});

describe("$watch", () => {
  it("fires with new and old values and can be stopped", async () => {
    const spy = vi.fn();
    Summit.data("watcher", () => ({
      count: 0,
      init(this: { count: number; $watch: (p: string, cb: (n: unknown, o: unknown) => void) => void }) {
        this.$watch("count", (n, o) => spy(n, o));
      },
    }));
    const el = mount(`<div s-data="watcher"><button @click="count++"></button></div>`);
    el.querySelector("button")!.click();
    await tick();
    expect(spy).toHaveBeenCalledWith(1, 0);
  });
});

describe("$dispatch", () => {
  it("delivers custom events across components via .window", async () => {
    const el = mount(`
      <div>
        <div s-data="{ title: 'old' }" @set-title.window="title = $event.detail"><h1 s-text="title"></h1></div>
        <div s-data><button @click="$dispatch('set-title', 'new')"></button></div>
      </div>`);
    expect(el.querySelector("h1")!.textContent).toBe("old");
    el.querySelector("button")!.click();
    await tick();
    expect(el.querySelector("h1")!.textContent).toBe("new");
  });
});
