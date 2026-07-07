# reactive()

> A deeply reactive object or array.

`reactive(obj)` wraps a plain object or array in a deep proxy that tracks reads
and triggers on writes. It is what backs a component's `s-data` scope, so a plain
assignment like `state.open = true` updates everything that read `open`. Where a
[signal](../reactive-signal/) holds one value, `reactive` gives you an ordinary
object you can read and mutate by property.

## Creating reactive state

```js
import { reactive, effect } from "summitjs";

const state = reactive({ count: 0, user: { name: "Ada" } });

effect(() => console.log(state.count)); // logs 0
state.count++; // logs 1
```

Reading a property subscribes the active effect to that property; writing it
wakes the effects that read it. Adding or deleting a property also notifies code
that iterates the object, for example an `s-for`.

## Deep and lazy

Nested objects and arrays are reactive too. They are wrapped the first time you
access them, not all at once up front.

```js
effect(() => console.log(state.user.name)); // logs "Ada"
state.user.name = "Grace"; // logs "Grace"
```

## What gets wrapped

Only plain objects and arrays become reactive. Class instances, including DOM
nodes, `Date`, `Map`, and `RegExp`, pass through untouched, so you can safely
store a DOM element or other host object in reactive data without breaking it.

```js
const s = reactive({
  el: document.querySelector("#app"), // stored as-is, not proxied
  items: [1, 2, 3], // proxied
});
```

`reactive` is idempotent: wrapping the same object twice returns the same proxy,
and wrapping an existing proxy returns it unchanged.

## Unwrapping and detecting

`toRaw(value)` returns the original plain object behind a proxy. It is safe to
call on a value that was never reactive, in which case it returns the value
as-is.

```js
import { reactive, toRaw, isReactive } from "summitjs";

const raw = { count: 0 };
const state = reactive(raw);

toRaw(state) === raw; // true
isReactive(state); // true
isReactive(raw); // false
```

## How it fits

`reactive` and [signal()](../reactive-signal/) share one dependency-tracking
core, so an [effect()](../reactive-effect/) or [computed()](../reactive-computed/)
can depend on a mix of both. This proxy is exactly what gives `s-data` its
ergonomics; see [Reactivity and State](../reactivity-state/) for the HTML side
and [How reactivity works](../advanced-reactivity/) for the internals.
`reactive` is also available on the global as `Summit.reactive`; `toRaw` and
`isReactive` ship as named exports of `summitjs`.
