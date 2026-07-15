<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/velofy/summitjs/main/docs/assets/logo-dark.svg">
    <img alt="Summit.js" src="https://raw.githubusercontent.com/velofy/summitjs/main/docs/assets/logo-light.svg" width="104">
  </picture>
</p>

<h1 align="center">Summit.js</h1>

<p align="center">The open source, AI Agent Native JavaScript framework for composing behavior directly in your HTML.<br>Drop in one script and go. No build step, no virtual DOM, no <code>eval</code>.</p>

<p align="center"><strong>Open Source. by Nature.</strong></p>

Started by [anishfyi](https://github.com/anishfyi), so that AI agents can make beautiful frontends.

Summit is built in the spirit of Alpine's HTML-first ergonomics, then pushed further where it counts: a fine-grained signal engine, a CSP-safe expression evaluator, keyed list rendering, cached computed getters, a copy-in UI library, and full TypeScript types, all in about 16KB gzipped.

<h3 align="center">Sponsors</h3>

<p align="center">
  <a href="https://go.nodemaven.com/summitjsGitHub" title="NodeMaven - residential and mobile proxies">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/velofy/summitjs/main/docs/assets/sponsors/nodemaven-dark.svg">
      <img src="https://raw.githubusercontent.com/velofy/summitjs/main/docs/assets/sponsors/nodemaven-light.svg" alt="NodeMaven" height="34">
    </picture>
  </a>
</p>

## AI Agent Native

Summit is designed so that an AI agent can write a working, good-looking frontend on the first try:

- **HTML-first and local.** Behavior lives on the element it affects, so an agent edits one place and sees the result. No file graph to hold in context.
- **Predictable vocabulary.** A small, closed set of `s-` directives and `$` magics. There is one obvious way to do most things, which is exactly what a model does best.
- **Safe by construction.** Expressions are interpreted, never `eval`ed, so generated markup runs under a strict CSP and cannot reach outside its allowlist.
- **A UI library, included.** Accessible, token-themed components an agent (or a person) drops in and themes with CSS variables. See the [UI Library](https://velofy.github.io/summitjs/components/).
- **Built to be read by machines.** The whole framework is discoverable in one fetch: [`llms.txt`](https://velofy.github.io/summitjs/llms.txt) indexes every page, [`llms-full.txt`](https://velofy.github.io/summitjs/llms-full.txt) is the entire corpus as markdown, any page is available as markdown (append `index.md` to its URL) with a one-click "Copy for AI" button, and [`AGENTS.md`](./AGENTS.md) is a drop-in brief you can hand to your own agent.

```html
<script src="https://velofy.github.io/summitjs/summit.min.js" defer></script>

<div s-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <p s-show="open">Hello from Summit</p>
</div>
```

## Why Summit

| Capability | Summit | Classic HTML-sprinkle runtimes |
| --- | --- | --- |
| Reactivity | Fine-grained signals, surgical DOM updates | Effect re-runs, coarser |
| Strict CSP (no `unsafe-eval`) | Default | Needs a separate, limited build |
| Keyed list reconciliation | Built in | Limited |
| Cached computed getters | Yes | Recomputed on every read |
| `s-if` on any element | Yes | `<template>` only |
| TypeScript types shipped | Yes | Partial |
| Focus trap, floating menus, persisted state, input masking | Built in | Separate plugins |
| Bundle size (gzip) | ~16KB, batteries included | ~16KB core, plugins extra |
| Build step required | Never | Never |

The headline difference is the engine. Summit owns a real signal core, so a change updates only the DOM that read the value that changed. And because expressions run through a hand-written interpreter rather than `new Function`, a strict Content-Security-Policy works out of the box.

## Install

Zero-build, drop in a script (auto-starts, exposes `window.Summit`):

```html
<script src="https://velofy.github.io/summitjs/summit.min.js" defer></script>
```

With a bundler:

```bash
npm install summitjs
```

```js
import Summit from "summitjs";
// register custom data, directives, magics, stores, or plugins here
Summit.start();
```

## Directives

Prefix `s-`, with `@` shorthand for `s-on:` and `:` for `s-bind:`.

| Directive | Purpose |
| --- | --- |
| `s-data` | Declare a reactive component scope |
| `s-text` / `s-html` | Set text or HTML content |
| `s-bind` / `:` | Bind attributes, with class object and style object merging |
| `s-on` / `@` | Listen for events, with a full modifier set |
| `s-model` | Two-way form binding |
| `s-show` | Toggle visibility via `display` |
| `s-if` | Add or remove an element (works on any element, not just `<template>`) |
| `s-for` | Keyed list rendering on a `<template>` |
| `s-effect` | Run an expression reactively |
| `s-transition` | Enter and leave animations, paired with `s-show` |
| `s-teleport` | Render a `<template>` elsewhere while keeping its scope |
| `s-ref` | Register an element into `$refs` (dynamic names supported) |
| `s-init` | Run an expression once on init |
| `s-id` | Open an id group for accessible `$id()` pairing |
| `s-cloak` | Hide until initialized; pair with `[s-cloak]{display:none}` |

### Event modifiers

`.prevent .stop .self .outside .once .capture .passive .window .document .debounce .throttle`, key filters (`.enter .escape .arrow-up ...`), system keys (`.shift .ctrl .alt .cmd`), and name transforms (`.camel .dot`).

### `s-model` modifiers

`.lazy .change .blur .number .boolean .debounce .fill`.

## Magics

`$el`, `$refs`, `$root`, `$store`, `$data`, `$watch`, `$dispatch`, `$nextTick`, `$id`. They are available in expressions and as `this.$watch`, `this.$refs`, and so on inside component methods.

`$watch` improves on the usual behavior: it returns an unwatch function and only fires on an actual change, so mutating the watched value inside its own callback cannot spin into an infinite loop.

## Registration API

```js
Summit.data("dropdown", (open = false) => ({
  open,
  toggle() { this.open = !this.open },
  init() { /* runs before the component renders */ },
}));

Summit.store("theme", { dark: false, toggle() { this.dark = !this.dark } });

Summit.directive("uppercase", (el, meta, utils) => {
  utils.effect(() => { el.textContent = String(utils.evaluate(meta.expression)).toUpperCase(); });
});

Summit.magic("now", () => () => new Date().toLocaleTimeString());

Summit.plugin((s) => { /* register a bundle of the above */ });
```

Registration is timing-safe. Built-ins register at import, your registrations override them, and `Summit.start()` can be called whenever the DOM is ready. There is no load-order event to miss.

## Reactivity primitives

Summit's signal core is also usable standalone:

```js
import { signal, computed, effect, batch } from "summitjs";

const count = signal(0);
const doubled = computed(() => count() * 2);
effect(() => console.log(doubled()));
count.set(5); // logs 10
```

## Data fetching

Summit ships an optional reactive data layer in `summitjs/net` (about 2.5KB gzip, separate from the core, so the base bundle stays lean). It is axios's essential parts, but a resource's `data`, `error`, `loading`, and `status` are signals, so the DOM updates itself. It also closes fetch's real-world footguns: non-2xx **throws**, out-of-order responses are discarded (latest wins), and in-flight requests **abort on unmount**.

With a bundler:

```js
import Summit from "summitjs";
import { net } from "summitjs/net";
Summit.plugin(net); // adds the $fetch magic and s-resource directive
Summit.start();
```

Or drop in a second script, no build step (it registers itself on the global):

```html
<script src="https://velofy.github.io/summitjs/summit.min.js" defer></script>
<script src="https://velofy.github.io/summitjs/summit-net.min.js" defer></script>
```

```html
<div s-data="{ users: $fetch.resource('/api/users', { immediate: true }) }">
  <p s-show="users.loading">Loading…</p>
  <p s-show="users.error" s-text="users.error.message"></p>
  <template s-for="u in users.data || []" :key="u.id"><li s-text="u.name"></li></template>
</div>
```

For a configured client (base URL, auth headers, cross-cutting error handling), register `createNet`:

```js
import { createNet } from "summitjs/net";
Summit.plugin(createNet({
  baseURL: "/api",
  headers: () => ({ authorization: "Bearer " + token }),
  onError(e) { if (e.status === 401) location.href = "/login"; },
}));
```

Or use it imperatively, no Summit required:

```js
import { createClient } from "summitjs/net";
const api = createClient({ baseURL: "/api" });
const todo = await api.post("/todos", { title: "Ship it" }); // JSON in/out, throws on non-2xx
```

## Development

```bash
npm install
npm run check   # typecheck + unit tests + build + size budget + bundle smoke + page verification
```

- `npm test` runs the Vitest suites (reactivity, evaluator, directives).
- `npm run build` produces ESM, CJS, IIFE, and `.d.ts` in `dist/`, and syncs `docs/`.
- `npm run smoke` drives the shipped bundle end to end.
- `npm run verify` boots the real docs page under Summit and checks every demo.

The documentation site in `docs/` dogfoods Summit and deploys to GitHub Pages.

## License

MIT
