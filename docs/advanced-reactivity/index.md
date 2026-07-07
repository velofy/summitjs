# How reactivity works

> How Summit tracks dependencies and updates the DOM.

Everything reactive in Summit rests on one small engine. A handful of primitives,
a few hundred lines, decide what re-runs when a value changes. This page walks
that engine end to end so you can reason about updates, write your own effects,
and understand exactly why a directive fires when it does.

If you just want to use signals, computeds, and effects, the
[Reactivity](../reactive-signal/) reference pages cover the public API. This page
is about the machinery underneath them.

## The signal, the atom of state

A signal holds one value. Reading it subscribes whoever is currently watching.
Writing it wakes those watchers, but only if the value actually changed.

```js
const count = Summit.signal(0);

count();        // read: returns 0 and subscribes the active effect
count.set(1);   // write: notifies subscribers
count.peek();   // read the value WITHOUT subscribing
```

Internally each signal owns a `dep`, a set of the effects that read it. A read
calls `track(dep)`, which adds the active effect to that set. A write compares
the new value to the old one with `Object.is` and, only if they differ, calls
`trigger(dep)` to wake every effect in the set. Setting a signal to its current
value does nothing, so no downstream work happens for a no-op write. `.peek()`
skips `track`, so you can read a value without becoming dependent on it.

## Effects and dependency tracking

An effect is a function that re-runs whenever any value it read last time
changes. It is the other half of the signal: signals are read inside effects,
and effects are what signals wake.

```js
const name = Summit.signal("Ada");
Summit.effect(() => {
  console.log("name is", name());
});
name.set("Grace"); // logs "name is Grace"
```

The link is built by running the function. Before an effect runs, Summit sets it
as the current active effect. Any signal read during that run calls `track`,
which records the dependency in both directions: the effect is added to the
signal's dep set, and the dep is pushed onto the effect's own `deps` list.

Dependencies are re-collected on every run. The first thing an effect does when
it re-runs is `cleanupDeps`, which unsubscribes it from every dep it currently
holds. It then runs the function and re-subscribes only to what it reads this
time. That is why tracking is fine-grained and dynamic: if an effect takes a
different branch and stops reading a value, it stops depending on it. Nothing
you no longer read can wake you.

Because a dep is one set per value, a change wakes only the effects that read
that exact value. When you click a button that increments `count`, the only
effects that re-run are the ones that read `count`. Every other text node,
attribute, and list on the page is untouched.

## The active-effect stack

Only one effect can be "active" at a time, but effects nest: an effect can run
code that creates or runs another effect. Summit tracks this with a stack. When
an effect starts it is pushed on and becomes active; when it finishes it is
popped and the previous effect on the stack becomes active again. Reads always
attribute to the effect at the top of the stack, so a nested effect captures its
own dependencies without stealing the outer effect's.

The stack also powers the self-write guard. An effect that both reads and writes
the same value could otherwise trigger itself forever. Two checks prevent that.
First, if an effect is already on the stack when it is asked to run again, the
re-entrant call returns immediately. Second, `trigger` never re-runs the effect
that is currently active. So an effect can safely write a value it also reads
without spinning into an infinite loop.

## Computed values are cached

A computed is a derived value that memoizes its result. Unlike a plain getter,
which recomputes on every read, a computed recomputes only when one of its own
dependencies changes, and it stays lazy: the getter does not run until something
reads the computed.

```js
const first = Summit.signal("Ada");
const last = Summit.signal("Lovelace");
const full = Summit.computed(() => first() + " " + last());

full(); // runs the getter once, caches "Ada Lovelace"
full(); // returns the cached value, no recompute
last.set("Byron"); // marks full stale, but does not recompute yet
full(); // now recomputes and caches "Ada Byron"
```

A computed is built on a lazy effect plus a `dirty` flag. Reading the computed
runs the getter only when `dirty` is set, stores the result, and clears the
flag. When a dependency changes, the computed's scheduler marks it dirty again
and notifies the computed's own subscribers so they re-read on demand. This is
why a computed is both a consumer (it subscribes to whatever its getter reads)
and a producer (it has its own dep that effects can subscribe to). The getters
you write in `s-data` are backed by this, so reading a derived value twice in one
render does the work at most once.

## Batching writes

Sometimes you change several values at once and want dependent effects to run a
single time at the end, not once per write. That is what `batch` does.

```js
Summit.batch(() => {
  first.set("Grace");
  last.set("Hopper");
}); // effects that read first or last run once, after both writes
```

While a batch is open, triggered effects are collected into a pending set
instead of running. When the outermost batch closes, that set is flushed once.
Batches nest, and only the outermost flush runs anything, so helper functions
that each open a batch compose cleanly.

## The scheduler and the DOM

Batching groups writes you make yourself. The scheduler solves a different
problem: keeping DOM updates cheap regardless of how the writes arrive.

Plain effects run synchronously the moment a dependency changes. DOM-facing
effects do not. They are created with a scheduler, so instead of re-running
inline they queue themselves onto a microtask. The queue is a set, so an effect
that is triggered many times in one tick is only queued once, and the whole
queue flushes together on the next microtask. A burst of state changes therefore
produces a single coalesced DOM update, even without an explicit `batch`.

`nextTick` sits on top of this queue. It resolves after the current flush, which
is how you read the freshly updated DOM.

```js
count.set(count.peek() + 1);
await Summit.nextTick();
// the DOM reflecting the new count has now been painted
```

The primitive that ties effects to this scheduler is `domEffect`. It creates a
lazy effect whose scheduler enqueues it, runs it once immediately to establish
its dependencies and paint the first result, and returns a disposer. Run once
now, re-run on a microtask forever after, until stopped.

## How directives sit on top

Every reactive directive is a `domEffect`. When a directive calls
`utils.effect(fn)`, Summit wraps `fn` in a `domEffect` and registers its disposer
as element cleanup. That single mechanism explains the whole system:

- `s-text` runs an effect that sets `textContent` from an expression. The effect
  reads whatever the expression reads, so it re-runs when any of those values
  change, and updates only that one text node.
- `s-show`, `:bind`, and `s-model` are the same shape: an effect that reads state
  and writes one piece of the DOM.
- `s-if` and `s-for` run effects that read a condition or a list and add or
  remove nodes in response.

The component scope itself, the object you pass to `s-data`, is wrapped in a
reactive proxy. Reading `count` inside a directive expression goes through that
proxy, which calls `track` for the `count` property, subscribing the directive's
effect to exactly that property. Writing `count` calls `trigger` for that
property, waking exactly the directives that read it. When the element is
removed, Summit runs its cleanups, which stop those effects and unsubscribe them
from every dep.

## Reactive objects

The bridge between the low-level signal API and the object ergonomics of
`s-data` is `reactive`. It wraps a plain object or array in a proxy that tracks
property reads and triggers on writes, so `this.open = true` inside a method just
works.

```js
const state = Summit.reactive({ open: false, items: [] });
Summit.effect(() => console.log("open?", state.open));
state.open = true; // logs "open? true"
```

Reactivity is deep and lazy: nested plain objects and arrays are wrapped the
first time you access them. Only plain objects and arrays are wrapped, though.
Class instances, DOM nodes, `Date`, `Map`, `RegExp`, and other host objects are
returned untouched, so storing a DOM element in reactive data never breaks it.
The proxy is cached per object and idempotent, so wrapping the same object twice
returns the same proxy, and `toRaw` unwraps it again when you need the plain
value.

## Where to go next

- [signal](../reactive-signal/) and [computed](../reactive-computed/) for the
  value primitives.
- [effect](../reactive-effect/) for the tracking primitive, and
  [reactive](../reactive-reactive/) for deep reactive objects.
- [batch](../reactive-batch/) and [nextTick](../reactive-nexttick/) for
  controlling when work runs.
