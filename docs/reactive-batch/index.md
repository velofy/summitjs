# batch()

> Group writes so effects run once.

Without batching, each write to a [signal](../reactive-signal/) or reactive
property triggers its dependent effects right away. When you make several related
writes, that can run the same effect more than once. `batch()` defers those
triggers until the whole function has run, then flushes each affected effect a
single time.

## Grouping writes

```js
import { signal, effect, batch } from "summitjs";

const first = signal("Ada");
const last = signal("Lovelace");

effect(() => console.log(first(), last())); // logs "Ada Lovelace"

batch(() => {
  first.set("Grace");
  last.set("Hopper");
});
// effect runs once, logging "Grace Hopper"
```

Outside a batch, the two writes would run the effect twice. Inside one, the
effect is queued once and runs after the batch closes. Duplicate triggers of the
same effect are collapsed.

## Return value

`batch()` returns whatever its function returns, so you can compute and commit in
one step.

```js
const label = batch(() => {
  first.set("Alan");
  last.set("Turing");
  return `${first()} ${last()}`;
});
```

## Nesting

Batches nest. Only the outermost batch flushes effects, so wrapping
already-batched code adds no extra runs.

```js
batch(() => {
  first.set("Ada");
  batch(() => {
    last.set("Lovelace");
  });
  // nothing has flushed yet
});
// effects flush once here
```

## Batch versus the scheduler

`batch()` coalesces synchronous writes within one function. It is different from
the microtask scheduling that DOM-facing directives use, where updates are
already deferred to the next tick. When you need to read the DOM after updates
apply, await [nextTick()](../reactive-nexttick/) instead.

`batch` is also available on the global as `Summit.batch`. For the trigger and
flush mechanism underneath, see [How reactivity works](../advanced-reactivity/).
