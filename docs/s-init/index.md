# s-init

> Run an expression when the element initializes.

`s-init` runs an expression once, at the moment its element is set up. It is the
quick, inline way to do a bit of startup work without writing an `init()` method
on your data.

## Running once at startup

Put the expression right on the element. It runs a single time as Summit
initializes the element, before any children below it are set up.

```summit
<div s-data="{ ready: false, at: '' }"
     s-init="ready = true; at = new Date().toLocaleTimeString()">
  <p s-show="ready">Ready at <span s-text="at"></span>.</p>
</div>
```

Unlike [s-effect](../s-effect/), which re-runs whenever the state it reads
changes, `s-init` fires exactly once and never again. Reach for it when you want
a one-time action, not a reactive one.

## It works on any element

`s-init` is an ordinary directive, so it is not limited to a component root. You
can attach it to any element inside a component, and each one runs as that
element initializes.

```html
<ul s-data="{ items: [] }">
  <li s-init="items.push('first row')">Loading...</li>
</ul>
```

## Relationship to a component's init() method

A component defined with [s-data](../s-data/) can expose an `init()` method,
which Summit calls when the component is created (see
[Lifecycle](../lifecycle/)). The two are complementary:

- Use `init()` for setup that is substantial or belongs alongside the
  component's data, such as fetching, reading storage, or starting a timer.
- Use `s-init` for a short expression on a single element, including elements
  that do not own any data of their own.

When one element carries both an `s-data` `init()` method and an `s-init`
directive, the `init()` method runs first, then the `s-init` expression.
