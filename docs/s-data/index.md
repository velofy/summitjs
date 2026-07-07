# s-data

> Declare a reactive component and its state.

`s-data` marks an element as a component and gives it state. Everything inside
that element, its own directives and every descendant, can read and write that
state, and Summit re-runs the expressions that depend on a value whenever the
value changes.

## Inline state

Pass `s-data` an object literal. Its properties become reactive state that the
whole subtree can use.

```summit
<div s-data="{ name: 'Ada', count: 0 }">
  <p>Hello, <span s-text="name"></span>.</p>
  <button @click="count++">Clicked <span s-text="count"></span> times</button>
</div>
```

An empty component is fine too. `s-data` on its own (or `s-data=""`) starts with
an empty object, which is handy when the element only needs an [s-init](../s-init/)
or a place to hang [$refs](../magic-refs/).

## Getters

A getter defines a value derived from other state. Summit turns each getter into
a cached computed, so it recomputes only when something it read changes and
returns the cached result the rest of the time.

```summit
<div s-data="{ first: 'Ada', last: 'Lovelace', get full() { return this.first + ' ' + this.last } }">
  <input s-model="first" />
  <input s-model="last" />
  <p>Full name: <strong s-text="full"></strong></p>
</div>
```

Read `full` in ten places and it still runs once per change to `first` or
`last`.

## Methods

A function property is a method. Summit binds it to the component, so `this` is
always the state whether you call it as `double()` or `this.double()`, and
assigning to `this.count` triggers reactivity.

```summit
<div s-data="{ count: 0, double() { this.count *= 2 } }">
  <output s-text="count">0</output>
  <button @click="count++">+1</button>
  <button @click="double()">Double</button>
</div>
```

## init()

If the state object has an `init()` method, Summit calls it once as the
component is set up, before its children initialize. Use it to seed values,
start a timer, or kick off a fetch. A matching `destroy()` method, if present,
runs when the component is torn down.

```summit
<div s-data="{ now: '', init() { this.now = new Date().toLocaleTimeString() } }">
  <p>Loaded at <span s-text="now"></span>.</p>
</div>
```

Inside `init()`, and inside any method, the `$`-magics are reachable through
`this`, so `this.$refs`, `this.$watch`, and `this.$el` all work.

## Named providers

For anything past a small inline object, register the state once with
[Summit.data](../globals-data/) and reference it by name. The provider is a
function that returns the state object, so every element that uses it gets a
fresh copy.

```js
Summit.data("counter", (start = 0) => ({
  count: start,
  increment() {
    this.count++;
  },
}));
```

Call it with arguments right in the attribute. The name is matched first against
your registered providers, and the arguments are evaluated in the surrounding
scope.

```html
<div s-data="counter(10)">
  <button @click="increment()">
    Count: <span s-text="count"></span>
  </button>
</div>
```

## Nesting and scope

Components nest freely. An inner `s-data` sees its own state plus everything from
its ancestors, and the nearest name wins when two scopes define the same key.

```summit
<div s-data="{ theme: 'teal' }">
  <p>Outer theme: <span s-text="theme"></span></p>
  <div s-data="{ label: 'inner' }">
    <p><span s-text="label"></span> can still read <span s-text="theme"></span></p>
  </div>
</div>
```

State that many unrelated components share belongs in a store rather than
`s-data`. Create one with [Summit.store](../globals-store/) and reach it from any
expression with [$store](../magic-store/).
