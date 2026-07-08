# Summit.js for AI agents

Summit is an HTML-first reactive framework. You add behavior to markup with
`s-` attributes and `$` magics. There is no build step and no virtual DOM. A
small, CSP-safe interpreter evaluates the expressions, so only a fixed,
predictable vocabulary is allowed. This file tells you how to write Summit that
runs correctly the first time.

Full docs as one file: https://velofy.github.io/summit/llms-full.txt
Index: https://velofy.github.io/summit/llms.txt
Any page as markdown: append `index.md` to its URL.

## Load it

```html
<script src="//cdn.jsdelivr.net/npm/summitjs" defer></script>
```

## The model

- `s-data` declares reactive state on an element. Its descendants can read and
  write that state in expressions.
- State is signal-backed: reads track, writes notify, and only the affected DOM
  updates. You never call render.
- Expressions are a safe subset of JavaScript. You cannot reach arbitrary
  globals. Allowed globals include `Math`, `JSON`, `Date`, `Object`, `Array`,
  `Number`, `String`, `Boolean`, `console`, `window`, `document`, `location`,
  `localStorage`, `setTimeout`, `fetch`, and other common read-only builtins.

```html
<div s-data="{ count: 0 }">
  <button @click="count++">Add</button>
  <span s-text="count"></span>
</div>
```

## Directives

| Directive | Shorthand | Purpose |
| --- | --- | --- |
| `s-data` | | declare reactive state |
| `s-text` | | set textContent |
| `s-html` | | set innerHTML (trusted content only) |
| `s-bind:attr` | `:attr` | bind an attribute; `:class` and `:style` accept objects |
| `s-on:event` | `@event` | run an expression on an event |
| `s-model` | | two-way bind a form control |
| `s-show` | | toggle visibility with `display` |
| `s-if` | | add or remove from the DOM; a `<template s-if>` may hold multiple roots |
| `s-for` | | render a list; use `:key` |
| `s-ref` | | name an element, read it via `$refs` |
| `s-init` | | run an expression once on init |
| `s-effect` | | re-run an expression when its dependencies change |
| `s-transition` | | animate enter and leave |
| `s-teleport` | | move an element elsewhere in the DOM (dialogs, toasts) |
| `s-intersect` | `s-intersect:leave` | run an expression when the element enters or leaves the viewport (`.once`, `.half`, `.full`) |
| `s-trap` | | keep keyboard focus inside an element while an expression is truthy |
| `s-anchor` | | position next to a reference element, flipping to stay in view (`.top`, `.end`, `.offset.N`) |
| `s-collapse` | | animate an element open and closed by height |
| `s-mask` | | format an input as you type (`9` digit, `a` letter, `*` either) |
| `s-cloak` | | hide until initialized; pair with `[s-cloak]{display:none}` |
| `s-ignore` | | skip a subtree |

## Magics

`$el`, `$refs`, `$root`, `$id`, `$store`, `$watch`, `$nextTick`, `$dispatch`,
`$data`, `$persist`, `$focus`. Example: `@click="$dispatch('saved', { id: 3 })"`
fires a custom event that a `@saved.window` handler can catch. Use
`$persist(0)` in `s-data` for localStorage-backed state, and `$focus` to move
keyboard focus.

## Modifiers

- Events: `.prevent`, `.stop`, `.self`, `.once`, `.window`, `.outside`,
  `.capture`, `.passive`, `.debounce`, `.throttle`, and keys such as `.enter`,
  `.escape`, `.cmd`, `.ctrl`, `.meta`, `.alt`, `.shift`.
- Model: `.number`, `.trim`, `.lazy`.

```html
<input @keydown.enter="submit()" s-model.trim="query">
<div @keydown.window.cmd.k.prevent="openPalette()"></div>
<button @click.outside="open = false"></button>
```

## Rules that keep it correct

- Every reactive expression must resolve against `s-data` state in scope. Do not
  reference variables that are not declared in state or the allowed globals.
- `s-for` needs a `:key` for stable, correct reconciliation.
- Reach across components with events (`$dispatch`) or a shared `$store`, not by
  reading another component's private state.
- `s-html` is not sanitized. Use it only with content you trust.
- Prefer `s-show` for frequent toggles and `s-if` to add or remove real DOM.

## UI library

Summit ships a copy-in component library. Load one stylesheet and use `s-`
prefixed classes (`s-btn`, `s-input`, `s-card`, `s-alert`, `s-tabs`, `s-dialog`,
and more). Theme everything by overriding CSS variables like `--accent`.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/summitjs/dist/components.css">
```

See https://velofy.github.io/summit/components/ for every component with live
demos and copy-paste markup.
