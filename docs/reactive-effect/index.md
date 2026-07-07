# effect()

> Run a function reactively whenever its dependencies change.

An effect runs a function and re-runs it whenever any reactive value it read
during its last run changes. This is the heart of Summit: every reactive
directive is a kind of effect. Tracking is fine-grained, so a change wakes only
the effects that actually read the value that changed.

## Running an effect

`effect(fn)` runs `fn` once immediately, recording which signals, computeds, and
reactive properties it reads. When any of those change, `fn` runs again.

```js
import { signal, effect } from "summitjs";

const name = signal("Ada");

effect(() => {
  console.log("Hello,", name());
});
// logs "Hello, Ada" right away

name.set("Grace");
// logs "Hello, Grace"
```

Dependencies are recomputed on every run, so an effect that reads different
values on different runs subscribes to exactly what it read the last time.

## Stopping an effect

`effect()` returns a runner. Pass it to `stop()` to dispose the effect
permanently: it unsubscribes from every dependency and never runs again.

```js
import { signal, effect, stop } from "summitjs";

const count = signal(0);
const runner = effect(() => console.log(count()));

count.set(1); // logs 1
stop(runner);
count.set(2); // nothing logs
```

You can also call the returned runner yourself to force a re-run.

## Reading without subscribing

Wrap a read in `untrack()` to use a value without depending on it. The effect
still runs, but a later change to an untracked value will not trigger it.

```js
import { signal, effect, untrack } from "summitjs";

const a = signal(1);
const b = signal(10);

effect(() => {
  // Re-runs when a changes, but not when b changes.
  console.log(a() + untrack(() => b()));
});
```

## Writing a value the effect also reads

An effect that writes a signal it also reads will not trigger itself into a loop.
The system skips re-running the effect that is currently executing, so this is
safe.

```js
const n = signal(0);
effect(() => {
  if (n() < 3) n.set(n() + 1); // does not recurse infinitely
});
```

## Timing

By default an effect re-runs synchronously, the moment a dependency changes. The
DOM-facing effects behind directives instead batch onto the microtask queue so a
burst of writes produces a single update, which is why you await
[nextTick()](../reactive-nexttick/) to read the updated DOM. To coalesce several
synchronous writes into one effect run yourself, use
[batch()](../reactive-batch/).

`effect` is also available on the global as `Summit.effect`; `stop` and
`untrack` ship as named exports of `summitjs`. For the full tracking model, see
[How reactivity works](../advanced-reactivity/).
