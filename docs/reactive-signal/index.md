# signal()

> A single reactive value you read by calling it and update with set().

A signal is the smallest unit of reactive state in Summit: one value that keeps
track of every effect that read it. Computed values, effects, and the deep
`reactive()` proxy are all built on the same tracking core, so once you
understand signals the rest of the system follows.

## Creating a signal

`signal(initial)` returns a signal that holds `initial`.

```js
import { signal } from "summitjs";

const count = signal(0);
```

The signal is a function, not an object with a `.value` property. You read it by
calling it, and you write it with `.set()`.

## Reading

Call the signal to get its current value. When you read a signal inside an
[effect()](../reactive-effect/) or [computed()](../reactive-computed/), that
reader subscribes to the signal and re-runs whenever the value changes.

```js
count(); // 0
```

## Writing

`.set(next)` replaces the value. Pass the next value directly, or a function
that receives the previous value and returns the next one.

```js
count.set(1);
count.set((prev) => prev + 1); // now 2
```

A write only wakes subscribers when the value actually changes, compared with
`Object.is`. Setting a signal to the value it already holds does nothing.

## Peeking without subscribing

`.peek()` returns the current value without subscribing the active effect. Reach
for it when you need the value but do not want a later change to trigger a
re-run.

```js
count.peek(); // 2, and the surrounding effect will not depend on count
```

## Checking for a signal

`isSignal(x)` returns `true` for any value produced by `signal()`, and `false`
otherwise.

```js
import { signal, isSignal } from "summitjs";

isSignal(count); // true
isSignal(() => 0); // false
```

`signal` is also available on the global as `Summit.signal`. `isSignal` ships as
a named export of `summitjs`.

## How signals underpin the framework

Every reactive `s-` directive ultimately reads and writes signals. The state you
declare with `s-data` lives in a [reactive()](../reactive-reactive/) proxy, and
both signals and that proxy feed the one dependency-tracking engine described in
[How reactivity works](../advanced-reactivity/). For the HTML-first way to hold
and update state, see [Reactivity and State](../reactivity-state/). To derive a
cached value from a signal, reach for [computed()](../reactive-computed/); to run
a side effect when it changes, use [effect()](../reactive-effect/).
