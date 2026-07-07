# Reactivity and State

> Declare state with s-data, derive values with getters, and add behavior with methods. Summit tracks reads and updates only what changed.

State in Summit lives in a component, declared with `s-data`. Everything inside
that element can read and write the state, and every expression that reads a
value is re-run automatically when that value changes.

## Declaring state

Pass `s-data` an object literal. Its properties become reactive state.

```summit
<div s-data="{ name: 'Ada', count: 0 }">
  <p>Hello, <span s-text="name"></span>.</p>
  <button @click="count++">Clicked <span s-text="count"></span> times</button>
</div>
```

When you click, Summit knows the button's text read `count`, so it updates just
that text node. Nothing else on the page is touched.

## Derived values

A getter is a value computed from other state. Summit caches it and only
recomputes when something it depends on changes.

```summit
<div s-data="{ first: 'Ada', last: 'Lovelace', get full() { return this.first + ' ' + this.last } }">
  <input s-model="first" />
  <input s-model="last" />
  <p>Full name: <strong s-text="full"></strong></p>
</div>
```

`full` re-evaluates only when `first` or `last` change, and reading it twice in
the same render does the work once.

## Methods

Functions on the object are methods. Inside them, `this` is the component state,
so you can read and mutate freely.

```summit
<div s-data="{ count: 0, double() { this.count *= 2 } }">
  <output s-text="count">0</output>
  <button @click="count++">+1</button>
  <button @click="double()">Double</button>
</div>
```

## Reusable components

For anything beyond a small inline object, register a named provider with
[Summit.data](../globals-data/) and reference it by name. The provider is a
function that returns the state object, so each use gets its own copy.

```js
Summit.data("counter", (start = 0) => ({
  count: start,
  increment() {
    this.count++;
  },
}));
```

```html
<div s-data="counter(10)">
  <button @click="increment()">
    Count: <span s-text="count"></span>
  </button>
</div>
```

## Nested components

Components nest. An inner `s-data` can read its own state and everything from
its ancestors, with the nearest name winning on a conflict.

```summit
<div s-data="{ theme: 'teal' }">
  <p>Outer theme: <span s-text="theme"></span></p>
  <div s-data="{ label: 'inner' }">
    <p><span s-text="label"></span> can still see <span s-text="theme"></span></p>
  </div>
</div>
```

## Shared state

State that many components need lives in a store, not in `s-data`. Reach it from
any expression with the [$store](../magic-store/) magic. See
[Summit.store](../globals-store/) to create one.
