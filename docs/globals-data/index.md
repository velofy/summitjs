# Summit.data

> Register a reusable named component.

`Summit.data` registers a named component so you can reference it from any
`s-data` attribute instead of repeating an inline object. It is the tool for
anything beyond a one-off snippet: a counter, a dropdown, a form, a component
you use in ten places.

## Registering a component

Call `Summit.data(name, provider)`. The provider is a factory: a function that
returns the state object. Returning the object from a function (rather than
sharing one object) is what gives every use its own independent copy.

```js
Summit.data("counter", (start = 0) => ({
  count: start,
  increment() {
    this.count++;
  },
}));
```

```html
<div s-data="counter">
  <button @click="increment()">
    Count: <span s-text="count"></span>
  </button>
</div>
```

The returned object becomes reactive state exactly like an inline `s-data`
object: properties are tracked, getters become cached derived values, and
methods are bound so `this` is the component. See
[Reactivity and State](../reactivity-state/) for how that state behaves.

## Passing arguments

Reference the provider like a function call and Summit passes the arguments
through. The argument list is evaluated in the parent scope, so you can hand in
literals or values from an enclosing component.

```html
<div s-data="counter(10)">
  <span s-text="count"></span>
</div>
```

Bare names work too: `s-data="counter"` calls the provider with no arguments,
letting your parameter defaults (`start = 0` above) take over.

## A fresh copy every time

Because the provider is a function, each element that references it runs the
factory again and gets a separate state object. Two `s-data="counter"` blocks on
the same page keep independent counts.

## Lifecycle hooks

If the returned object has an `init()` method, Summit calls it once the
component's state is set up. A `destroy()` method runs when the element is
removed from the DOM. This works for named providers and inline objects alike.

```js
Summit.data("clock", () => ({
  now: "",
  timer: 0,
  init() {
    this.timer = setInterval(() => (this.now = new Date().toLocaleTimeString()), 1000);
  },
  destroy() {
    clearInterval(this.timer);
  },
}));
```

See [Lifecycle](../lifecycle/) for the full order of these hooks.

## Chaining and timing

`Summit.data` returns the `Summit` global, so registrations chain:

```js
Summit
  .data("counter", () => ({ count: 0 }))
  .data("clock", () => ({ now: "" }));
```

Registration is timing-safe. You can register a provider before or after
[Summit.start](../globals-start/), and any matching `s-data` in the page, now or
added later, resolves to it.
