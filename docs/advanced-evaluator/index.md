# The CSP-safe evaluator

> How Summit evaluates expressions without eval, safe under CSP.

Every Summit directive contains a JavaScript expression: `s-text="count"`,
`@click="open = !open"`, `:class="{ active: selected }"`. Most HTML-first
frameworks turn those strings into functions with `new Function` or `eval`. That
requires `unsafe-eval` in your Content-Security-Policy, which is exactly the
thing a strict policy is meant to forbid.

Summit takes a different path. It ships its own small JavaScript engine and never
calls `eval` or `new Function`, so it runs under a strict CSP with the standard
build and nothing to configure.

## Why no eval

A Content-Security-Policy that omits `unsafe-eval` blocks `eval`, `new Function`,
and the string forms of `setTimeout`/`setInterval` at runtime, in the browser.
Any framework that compiles expressions with those APIs simply stops working
under such a policy unless you either loosen the policy or ship a separate,
restricted build.

Because Summit interprets expressions itself, there is nothing for the policy to
block. The same script tag works whether or not your site sets a strict CSP, and
you never maintain two builds.

## The pipeline

An expression string travels through three stages before it produces a value.

1. **Lexer.** `tokenize` scans the string into a flat list of tokens: numbers,
   strings, template literals, identifiers, and a fixed set of operators and
   punctuators.
2. **Parser.** `parse` reads those tokens into an abstract syntax tree, a
   structured description of the expression. The set of node shapes the parser
   can produce is the whole language: anything it cannot build is a parse error.
3. **Interpreter.** `Interpreter.run` walks the tree and computes a value,
   resolving names against your component's scope. It is a plain tree walk, no
   code generation of any kind.

Parsed trees are cached by their source and mode, so an expression that a
directive re-evaluates on every state change is parsed once and interpreted many
times.

There are two parse modes, and the caller chooses based on what it wants:

- **Expression mode** parses a single value expression, used by value directives
  like `s-data`, `s-text`, `:bind`, and `s-show`. Here a leading `{` is an object
  literal.
- **Program mode** parses a list of statements, used by action directives like
  `s-on` handlers and `s-init`. Here a leading `{` is a block.

That split is how Summit resolves the classic ambiguity of `{ }` without
guessing. The directive already knows whether it wants a value or an action.

## What syntax is supported

The parser and interpreter implement a broad, practical subset of JavaScript
expression syntax. All of the following work inside directives:

- **Literals:** numbers (including floats, exponents, and hex like `0xff`),
  single- and double-quoted strings with escapes, template literals with
  `${...}` interpolation, `true`, `false`, `null`, `undefined`, and `this`.
- **Objects and arrays,** including shorthand properties, computed keys, method
  shorthand, getters and setters, array holes, and spread (`{ ...a }`,
  `[ ...xs ]`).
- **Member access** with `.` and `[ ]`, and optional chaining `?.` for property
  reads, computed reads, and calls.
- **Function calls** with spread arguments and optional calls (`fn?.()`).
- **Operators:** `! - +`, `typeof`, `void`, prefix and postfix `++`/`--`,
  arithmetic `+ - * / % **`, comparison `< > <= >=`, equality `== != === !==`,
  `in`, `instanceof`, logical `&& || ??`, the ternary `?:`, and assignment in all
  its forms (`= += -= *= /= %= **= &&= ||= ??=`).
- **Arrow functions,** with expression or block bodies, default parameters,
  destructuring parameters, and rest parameters.

In program mode (action directives) you additionally get statements: `if`/`else`,
`return`, `let`/`const`/`var` with destructuring, `for`, `for...of`, `while`,
`break`, `continue`, and blocks. This is why `@click` handlers can hold real
multi-statement logic.

```html
<button @click="
  let next = count + 1;
  if (next > max) next = 0;
  count = next
">step</button>
```

## What is not supported

The subset stops where an expression language should. If you write any of these
in a directive, you get a parse error, which Summit catches and logs to the
console rather than executing:

- The `new` operator. Constructors are not callable from expressions, so use a
  static method or a global that returns a value. Reach for `Date.now()` rather
  than `new Date()`, and build the object in a `Summit.data` provider if you need
  a constructed instance.
- Bitwise operators (`& | ^ ~ << >> >>>`).
- The `function` keyword and function declarations. Use arrow functions.
- Classes, `try`/`catch`, `throw`, `switch`, `do...while`, `async`/`await`, and
  generators.
- Comments, regex literals (use the `RegExp` global), and tagged template
  literals.

Keeping the surface bounded is not only about safety. It also keeps directive
expressions readable. Anything more involved belongs in a `Summit.data` method,
where you write ordinary JavaScript that your bundler and CSP already trust.

## How names resolve

When the interpreter meets an identifier, it looks in three places, in order:

1. **Interpreter-local bindings:** arrow-function parameters and any `let`/`const`
   declared in the same expression.
2. **The component scope:** the merged `s-data` stack, innermost first, so an
   inner component shadows an outer one, plus the `$`-prefixed magics.
3. **The global allowlist:** a fixed set of safe globals (below). Names in the
   allowlist resolve to the real global; anything else resolves to `undefined`.

Reads are deliberately tolerant. Accessing a property of `null` or `undefined`
yields `undefined` instead of throwing, and calling a method that does not exist
is a no-op that returns `undefined`. This keeps templates resilient to
half-loaded data. Assigning to a property of `null` or calling a value that is
present but not a function still throws, because those are real mistakes.

Arrow functions capture `this` lexically from the surrounding component, while
methods and getters defined in an object literal receive the usual dynamic
`this`, matching how the same code behaves in a normal engine.

## The global allowlist

An expression can only name a global if it is on the allowlist. The default set
covers the common, safe surface:

```text
Math, JSON, Date, Object, Array, Number, String, Boolean,
parseInt, parseFloat, isNaN, isFinite, RegExp,
Map, Set, WeakMap, WeakSet, Promise, Intl, console,
window, document, location, navigator, history,
localStorage, sessionStorage,
setTimeout, clearTimeout, setInterval, clearInterval,
requestAnimationFrame, cancelAnimationFrame,
fetch, alert, confirm, prompt, structuredClone,
URL, URLSearchParams, encodeURIComponent, decodeURIComponent,
NaN, Infinity
```

To let expressions reach a global you provide, add it:

```js
Summit.addGlobals(["gsap", "dayjs"]);
```

Now `dayjs()` resolves inside any directive. The allowlist is a scoping and
ergonomics boundary: it controls which names an expression may mention, and it
keeps a typo from silently reaching an unrelated global. It is not a full
sandbox, because allowlisted globals expose their whole surface. The point that
matters for CSP is narrower and firmer: Summit itself never needs `unsafe-eval`.

## Under a strict CSP

Because the evaluator uses no dynamic code, Summit is happy with a policy that
forbids it entirely:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'
```

Load Summit as a normal script under that header and every directive works.
There is no `unsafe-eval`, no `unsafe-inline` required for the framework, and no
alternate build to swap in. The browser is still the ultimate enforcer: even the
allowlisted `window` cannot be used to smuggle in `window.eval(...)`, because the
browser blocks eval at runtime regardless of who calls it. Summit's contribution
is that it never asks you to open that door in the first place.

## See also

- [Reactivity](../advanced-reactivity/) for how the values these expressions read
  are tracked.
- [Extending Summit](../advanced-extending/) to reach the evaluator from your own
  directives with `utils.evaluate` and `utils.evaluateAction`.
