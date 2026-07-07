# Getting Started

> Summit is a rugged, signal-powered JavaScript framework for composing behavior directly in your HTML. Learn what it is and write your first component.

Summit is a small JavaScript framework for composing behavior directly in your
markup. You sprinkle a handful of `s-` attributes onto plain HTML and Summit
brings it to life. No build step, no components to import, no JSX. If you know
HTML, you already know most of Summit.

Under the hood it runs on a fine-grained signal engine, so when a value changes
Summit updates only the exact piece of DOM that depends on it. Expressions are
parsed and interpreted rather than handed to `eval`, so Summit works under a
strict Content-Security-Policy with nothing extra to configure.

## Your first component

Here is a complete, working counter. There is no setup around it: this snippet
is running live on the page right now.

```summit
<div s-data="{ count: 0 }">
  <button @click="count--">-</button>
  <output s-text="count">0</output>
  <button @click="count++">+</button>
</div>
```

`s-data` declares a piece of state. `@click` (shorthand for `s-on:click`) runs
an expression when the button is clicked. `s-text` keeps the `<output>` in sync
with `count`. When you click, only that one number re-renders.

## Why Summit

- **Fine-grained reactivity.** A real signal engine tracks exactly which
  expressions read which values, so updates are surgical rather than
  re-rendering whole subtrees.
- **CSP-safe by default.** Expressions run through a hand-written interpreter.
  No `eval`, no `new Function`, no `unsafe-eval` in your policy.
- **Tiny and buildless.** The whole runtime is roughly 13KB gzipped. Drop in one
  script tag and it starts on its own.
- **Familiar.** Fifteen directives, nine magic properties, and the `@` and `:`
  shorthands. If you have used an HTML-first framework before, this will feel
  like home, with the rough edges filed off.

## Where to go next

- [Installation](../installation/) covers the script tag, npm, and bundlers.
- [Reactivity and State](../reactivity-state/) explains `s-data`, computed
  values, and methods.
- The [Directives](../s-data/) and [Magic Properties](../magic-el/) sections are
  a complete reference for every attribute and helper.
