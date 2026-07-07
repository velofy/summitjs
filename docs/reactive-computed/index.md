# computed()

> A cached value derived from other reactive state.

A computed value is derived from other reactive state and cached. It runs its
getter once, remembers the result, and only recomputes when one of the values it
read has changed. That makes it cheaper than a plain function you call
repeatedly, which would redo the work on every call.

## Creating a computed

Pass `computed` a getter function. It returns a computed you read the same way as
a [signal](../reactive-signal/), by calling it.

```js
import { signal, computed } from "summitjs";

const price = signal(10);
const qty = signal(2);
const total = computed(() => price() * qty());

total(); // 20
```

Like a signal, a computed is a function, not an object with a `.value`. Read it
by calling it.

## Caching and laziness

A computed is lazy: the getter does not run until something reads the computed
for the first time. After that, the cached result is returned on every read until
a dependency changes.

```js
const doubled = computed(() => {
  console.log("recomputing");
  return price() * 2;
});

doubled(); // logs "recomputing", returns 20
doubled(); // returns 20, no log: served from cache

price.set(15);
doubled(); // logs "recomputing", returns 30
```

Reading a computed twice in a row does the work once. Only a change to a
dependency such as `price` invalidates the cache.

## Composition

Because a computed both reads dependencies and is itself readable, computeds
chain. Reading one computed inside another subscribes to it, and reading a
computed inside an [effect()](../reactive-effect/) re-runs the effect when the
computed's result changes.

```js
const withTax = computed(() => total() * 1.2);

withTax(); // computes total once, then applies tax
```

## Peeking

`.peek()` returns the current result, recomputing first if it is stale, without
subscribing the active effect.

```js
total.peek(); // current total, without creating a dependency
```

## Where computeds show up

The getters you define in `s-data` are cached the same way a computed is, which
is why a derived value like a full name recomputes only when its parts change.
See [Derived values](../reactivity-state/) for the HTML-first form, and
[How reactivity works](../advanced-reactivity/) for the tracking model
underneath. `computed` is also available on the global as `Summit.computed`.
