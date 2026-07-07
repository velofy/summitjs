# Migrating from Alpine

> A guide for developers coming from Alpine.js.

If you know Alpine, you already know Summit. The mental model is the same: state
declared on an element, expressions in attributes, `@` for events and `:` for
bindings. Most of a migration is a find-and-replace of the directive prefix.
This page covers that rename and then the handful of places where Summit behaves
differently on purpose.

## The prefix rename

Alpine's directives start with `x-`. Summit's start with `s-`. The two
shorthands are identical: `@click` is still `@click`, and `:class` is still
`:class`, because those are just short forms of `s-on:` and `s-bind:`.

```html
<!-- Alpine -->
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <p x-show="open">Hello</p>
</div>

<!-- Summit -->
<div s-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <p s-show="open">Hello</p>
</div>
```

## Directive mapping

Every Alpine directive has a same-named Summit counterpart. Rename the prefix and
you are done.

| Alpine        | Summit        | Notes                                          |
| ------------- | ------------- | ---------------------------------------------- |
| `x-data`      | `s-data`      | Same object-or-provider form.                  |
| `x-bind` / `:`| `s-bind` / `:`| Shorthand unchanged.                           |
| `x-on` / `@`  | `s-on` / `@`  | Shorthand unchanged.                           |
| `x-text`      | `s-text`      |                                                |
| `x-html`      | `s-html`      |                                                |
| `x-model`     | `s-model`     | Extra modifiers, see below.                    |
| `x-show`      | `s-show`      |                                                |
| `x-if`        | `s-if`        | Works on any element, not just `<template>`.   |
| `x-for`       | `s-for`       | Keyed reconciliation, see below.               |
| `x-effect`    | `s-effect`    |                                                |
| `x-init`      | `s-init`      |                                                |
| `x-ref`       | `s-ref`       |                                                |
| `x-cloak`     | `s-cloak`     |                                                |
| `x-ignore`    | `s-ignore`    |                                                |
| `x-teleport`  | `s-teleport`  |                                                |
| `x-transition`| `s-transition`|                                                |
| `x-id`        | `s-id`        | Pairs with the `$id` magic.                    |

The magics keep their names too: `$el`, `$refs`, `$store`, `$watch`, `$dispatch`,
`$nextTick`, `$root`, and `$id` all work as you expect. Summit adds one,
[$data](../magic-data/), which returns the nearest scope object.

The global API maps one for one as well: `Alpine.data`, `Alpine.store`,
`Alpine.bind`, `Alpine.directive`, `Alpine.magic`, `Alpine.plugin`, and
`Alpine.start` become [Summit.data](../globals-data/),
[Summit.store](../globals-store/), [Summit.bind](../globals-bind/),
[Summit.directive](../globals-directive/), [Summit.magic](../globals-magic/),
[Summit.plugin](../globals-plugin/), and [Summit.start](../globals-start/).

## What is genuinely different

The rename gets you a working page. These differences are where Summit is worth
understanding, because they change what you can rely on.

### Fine-grained signals

Alpine re-runs an element's effects when the data it touched changes. Summit runs
on a signal engine that tracks reads at the level of individual values. When you
update one property, the only expressions that re-run are the ones that actually
read that property, and each updates just its own text node or attribute. There
is no subtree to re-evaluate.

One practical upshot is getters. A getter you define in `s-data` is a cached
computed: it recomputes only when one of its own dependencies changes, and
reading it several times in one render does the work once. The same getter in
Alpine re-runs on every read. See [How reactivity works](../advanced-reactivity/)
for the full picture.

### CSP-safe with the standard build

Alpine's default build compiles expressions with `new Function`, so a strict
Content-Security-Policy needs Alpine's separate CSP build (which restricts what
expressions may do). Summit interprets expressions with its own engine and never
calls `eval` or `new Function`, so a policy like `script-src 'self'` works with
the one and only build, and directive expressions still support a broad slice of
JavaScript. The details, including the exact supported syntax and the global
allowlist, are in [The CSP-safe evaluator](../advanced-evaluator/).

### $watch returns an unwatch function and will not loop

In Summit, `$watch` returns a function that stops the watcher, and the callback
fires only on an actual change (compared with `Object.is`), skipping the initial
value. That means mutating the watched value inside its own callback cannot spin
into an infinite loop, and you can tear a watcher down when you no longer need
it.

```html
<div s-data="{ query: '', stop: null }"
     s-init="stop = $watch('query', (value) => console.log('now', value))">
  <input s-model="query" />
  <button @click="stop && stop()">Stop watching</button>
</div>
```

### Keyed s-for reconciliation

Give `s-for` a `:key` and Summit reconciles the list by key. Matching rows are
reused and moved rather than destroyed and recreated, so focus, scroll position,
input values, and any per-row state survive reordering and insertion. This is the
area where Alpine struggles most on large or reordering lists.

```html
<template s-for="item in items" :key="item.id">
  <li s-text="item.label"></li>
</template>
```

### s-if works on any element

Alpine's `x-if` must wrap a `<template>`. Summit's `s-if` works directly on any
element. Summit drops a comment anchor where the element was and uses the element
itself, minus its `s-if` attribute, as the blueprint it clones in and out.

```summit
<div s-data="{ open: false }">
  <button @click="open = !open" s-text="open ? 'Hide' : 'Show'">Show</button>
  <p s-if="open">No template element required.</p>
</div>
```

You can still use a `<template>` if you prefer, and you should when the content
is more than a single root element.

### The s-model modifier set

`s-model` handles text, number, range, checkbox (boolean or array), radio, and
single or multiple selects, with these modifiers: `.lazy`, `.change`, `.blur`,
`.number`, `.boolean`, `.debounce`, `.throttle`, and `.fill`. A few are worth
calling out for Alpine users:

- `.fill` seeds the model from the control's own initial value when the model is
  empty, so server-rendered form values become the starting state.
- `.boolean` coerces the input to a real boolean.
- `.debounce` and `.throttle` accept a duration, for example `s-model.debounce.500ms`.

The bound value is also exposed on the element as `el._summitModel = { get, set }`,
which makes it straightforward to build custom input components that participate
in `s-model`.

## A note on load order

Alpine is sensitive to when you register directives and plugins relative to
`alpine:init`. Summit's registries are timing-safe: registration order does not
matter and a later registration overrides an earlier one of the same name.
Summit dispatches `summit:init` on `document` just before it initializes the page
and `summit:initialized` when it is done, so register your plugins before start,
or inside a `summit:init` listener. See
[Extending Summit](../advanced-extending/) for the full pattern.
