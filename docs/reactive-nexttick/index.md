# nextTick()

> Wait for pending reactive updates to flush.

Reactive DOM updates do not happen synchronously on every write. Directives queue
their work and flush once on the next microtask, so a burst of state changes
produces a single coalesced update. `nextTick()` resolves after that flush, which
is how you read the DOM once it reflects your latest changes.

## Awaiting updates

Call `nextTick()` with no argument to get a promise that resolves after the
pending flush.

```js
import { signal, nextTick } from "summitjs";

const count = signal(0);

count.set(1);
await nextTick();
// pending effects have run and the DOM reflects count === 1
```

## With a callback

Pass a function and `nextTick()` runs it after the flush, then resolves.

```js
nextTick(() => {
  // runs after pending updates have applied
  console.log("flushed");
});
```

Either form returns a `Promise<void>`, so you can `await` it or chain `.then()`.

## The $nextTick magic

Inside markup, the same capability is available as the
[$nextTick](../magic-nextTick/) magic. It is this function bound into the
expression scope, so you can wait for the DOM from an `s-` attribute:

```html
<button @click="count++; $nextTick(() => console.log('updated'))">+1</button>
```

Use `nextTick` from JavaScript and `$nextTick` from an expression.

## How the flush works

The batched, DOM-facing effects that directives are built on schedule themselves
onto this same microtask queue, so awaiting `nextTick` after a state change is the
reliable way to observe the resulting DOM. To collapse several synchronous writes
into one effect run before the flush, see [batch()](../reactive-batch/). For the
queue and effect machinery underneath, see
[How reactivity works](../advanced-reactivity/). `nextTick` is also available on
the global as `Summit.nextTick`.
