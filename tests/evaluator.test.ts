import { describe, it, expect, vi } from "vitest";
import { evaluateExpression, evaluateAction, type RootEnv } from "../src/evaluator/index.js";

function env(data: Record<string, unknown> = {}): RootEnv & { data: Record<string, unknown> } {
  return {
    data,
    has: (n) => n in data,
    get: (n) => data[n],
    set: (n, v) => {
      data[n] = v;
    },
  };
}

const ev = (src: string, data?: Record<string, unknown>, thisVal?: unknown) => evaluateExpression(src, env(data), thisVal);

describe("literals + arithmetic", () => {
  it("numbers, strings, booleans", () => {
    expect(ev("1 + 2 * 3")).toBe(7);
    expect(ev("(1 + 2) * 3")).toBe(9);
    expect(ev("2 ** 3 ** 2")).toBe(512); // right associative
    expect(ev("'a' + 'b'")).toBe("ab");
    expect(ev("true && false")).toBe(false);
    expect(ev("10 % 3")).toBe(1);
    expect(ev("0x1F")).toBe(31);
  });

  it("comparison + equality", () => {
    expect(ev("1 < 2")).toBe(true);
    expect(ev("2 <= 2")).toBe(true);
    expect(ev("1 === 1")).toBe(true);
    expect(ev("1 !== '1'")).toBe(true);
    expect(ev("null == undefined")).toBe(true);
  });

  it("logical + nullish + ternary", () => {
    expect(ev("false || 'fallback'")).toBe("fallback");
    expect(ev("null ?? 'x'")).toBe("x");
    expect(ev("0 ?? 'x'")).toBe(0);
    expect(ev("1 ? 'yes' : 'no'")).toBe("yes");
  });

  it("unary", () => {
    expect(ev("!true")).toBe(false);
    expect(ev("-5")).toBe(-5);
    expect(ev("typeof 'hi'")).toBe("string");
    expect(ev("typeof missing")).toBe("undefined");
  });
});

describe("new operator", () => {
  it("constructs allowlisted built-ins", () => {
    expect(ev("new Date(0).getFullYear()")).toBe(1970);
    expect(ev("new Map([['a', 1]]).get('a')")).toBe(1);
    expect(ev("new Set([1, 2, 2]).size")).toBe(2);
    expect(ev("new Array(3).length")).toBe(3);
    expect(ev("new RegExp('\\\\d').test('5')")).toBe(true);
  });

  it("chains member/call after construction", () => {
    expect(ev("new Date(0).getTime()")).toBe(0);
    expect(ev("new URL('https://a.test/p?x=1').searchParams.get('x')")).toBe("1");
  });

  it("keeps division working (a slash is not a constructor)", () => {
    expect(ev("10 / 2")).toBe(5);
    expect(ev("new Date(2000).getTime() / 1000")).toBe(2);
  });

  it("constructs a user-provided function from state", () => {
    const K = function (this: Record<string, unknown>, n: number) {
      this.n = n;
    };
    expect(ev("new K(5).n", { K })).toBe(5);
  });

  it("throws on a non-constructor", () => {
    expect(() => ev("new nope()")).toThrow();
  });
});

describe("regex literals", () => {
  it("tests, splits, replaces, and matches with flags", () => {
    expect(ev("/\\d+/.test('x5')")).toBe(true);
    expect(ev("/[a-z]+/i.test('ABC')")).toBe(true);
    expect(ev("/.+@.+/.test('a@b')")).toBe(true);
    expect(ev("'a,b,c'.split(/,/).length")).toBe(3);
    expect(ev("'x@y'.replace(/@/, ' at ')")).toBe("x at y");
    expect(ev("'2026-07-08'.match(/\\d{4}/)[0]")).toBe("2026");
  });

  it("handles escaped slashes and character classes", () => {
    expect(ev("/foo\\/bar/.test('foo/bar')")).toBe(true);
    expect(ev("/a[/]b/.test('a/b')")).toBe(true);
  });

  it("still parses division, not a regex, after an operand", () => {
    expect(ev("10 / 2")).toBe(5);
    expect(ev("a / b", { a: 10, b: 2 })).toBe(5);
    expect(ev("10 / 2 / 5")).toBe(1);
    expect(ev("(6) / (2)")).toBe(3);
  });
});

describe("identifiers + scope", () => {
  it("reads data", () => {
    expect(ev("count", { count: 42 })).toBe(42);
  });
  it("reads allowlisted globals", () => {
    expect(ev("Math.max(1, 9, 4)")).toBe(9);
    expect(ev("JSON.stringify({ a: 1 })")).toBe('{"a":1}');
  });
});

describe("member + call + optional chaining", () => {
  it("member access", () => {
    expect(ev("user.name", { user: { name: "ada" } })).toBe("ada");
    expect(ev("items[1]", { items: [10, 20, 30] })).toBe(20);
  });
  it("tolerant reads do not throw on nullish", () => {
    expect(ev("a.b.c", { a: null })).toBeUndefined();
    expect(ev("a?.b?.c", { a: undefined })).toBeUndefined();
  });
  it("method calls", () => {
    expect(ev("'HELLO'.toLowerCase()")).toBe("hello");
    expect(ev("nums.map(n => n * 2)", { nums: [1, 2, 3] })).toEqual([2, 4, 6]);
    expect(ev("nums.filter(n => n > 1).length", { nums: [1, 2, 3] })).toBe(2);
  });
  it("optional call is a no-op when missing", () => {
    expect(ev("obj.missing?.()", { obj: {} })).toBeUndefined();
  });
});

describe("object + array literals", () => {
  it("object with shorthand, computed, spread", () => {
    expect(ev("{ a: 1, b, [k]: 3, ...rest }", { b: 2, k: "c", rest: { d: 4 } })).toEqual({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    });
  });
  it("array with spread and holes", () => {
    expect(ev("[1, ...more, 5]", { more: [2, 3] })).toEqual([1, 2, 3, 5]);
  });
  it("class-object pattern for :class", () => {
    expect(ev("{ hidden: !show, active: show }", { show: true })).toEqual({ hidden: false, active: true });
  });
});

describe("template literals", () => {
  it("interpolates", () => {
    expect(ev("`Hello ${name}, you are ${age}`", { name: "Ada", age: 30 })).toBe("Hello Ada, you are 30");
  });
  it("nested expressions", () => {
    expect(ev("`sum=${a + b}`", { a: 2, b: 5 })).toBe("sum=7");
  });
});

describe("this + methods", () => {
  it("binds this in methods on object literals", () => {
    const obj = ev("{ n: 2, double() { return this.n * 2 } }") as { n: number; double: () => number };
    expect(obj.double()).toBe(4);
  });
  it("getters work", () => {
    const obj = ev("{ first: 'a', last: 'b', get full() { return this.first + this.last } }") as { full: string };
    expect(obj.full).toBe("ab");
  });
  it("resolves ThisExpression from thisVal", () => {
    expect(ev("this.value", {}, { value: 7 })).toBe(7);
  });
});

describe("actions (statement mode)", () => {
  it("runs assignments and sequences", () => {
    const e = env({ open: false, count: 0 });
    evaluateAction("open = true; count++", e);
    expect(e.data.open).toBe(true);
    expect(e.data.count).toBe(1);
  });

  it("supports if/else", () => {
    const e = env({ x: 5, label: "" });
    evaluateAction("if (x > 3) { label = 'big' } else { label = 'small' }", e);
    expect(e.data.label).toBe("big");
  });

  it("supports let + for-of accumulation", () => {
    const e = env({ items: [1, 2, 3, 4], total: 0 });
    evaluateAction("let sum = 0; for (const n of items) { sum += n } total = sum", e);
    expect(e.data.total).toBe(10);
  });

  it("supports classic for and break", () => {
    const e = env({ result: 0 });
    evaluateAction("let acc = 0; for (let i = 0; i < 10; i++) { if (i === 5) break; acc += i } result = acc", e);
    expect(e.data.result).toBe(0 + 1 + 2 + 3 + 4);
  });

  it("calls a method with $event-style argument", () => {
    const handler = vi.fn();
    const e = env({ handler, payload: { detail: "hi" } });
    evaluateAction("handler(payload.detail)", e);
    expect(handler).toHaveBeenCalledWith("hi");
  });
});

describe("destructuring", () => {
  it("object destructuring params", () => {
    expect(ev("fn({ greeting: 'Hi', name: 'Ada' })", { fn: ({ greeting, name }: { greeting: string; name: string }) => `${greeting} ${name}` })).toBe("Hi Ada");
  });
  it("arrow with object destructuring", () => {
    expect(ev("data.map(({ id }) => id)", { data: [{ id: 1 }, { id: 2 }] })).toEqual([1, 2]);
  });
});

describe("update expressions", () => {
  it("postfix and prefix", () => {
    const e = env({ n: 5 });
    expect(evaluateExpression("n++", e)).toBe(5);
    expect(e.data.n).toBe(6);
    expect(evaluateExpression("++n", e)).toBe(7);
    expect(e.data.n).toBe(7);
  });
});

describe("CSP safety", () => {
  it("does not rely on Function constructor", () => {
    // Prove the evaluator works even if Function constructor is unavailable,
    // which is the case under a strict CSP with no unsafe-eval.
    const OriginalFunction = globalThis.Function;
    try {
      // @ts-expect-error deliberately break the Function constructor
      globalThis.Function = function () {
        throw new Error("eval blocked by CSP");
      };
      expect(ev("1 + count * 2", { count: 3 })).toBe(7);
      expect(ev("items.map(i => i + 1)", { items: [1, 2] })).toEqual([2, 3]);
    } finally {
      globalThis.Function = OriginalFunction;
    }
  });
});
