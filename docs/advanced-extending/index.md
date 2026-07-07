# Writing directives and plugins

> Build custom directives, magics, and plugins.

Summit's built-in directives and magics are not privileged. They are registered
through the same public API you use for your own, and they receive the same
utilities. So a directive you write is a first-class citizen: it can evaluate
expressions in the element's scope, create reactive effects, and clean up after
itself, exactly like `s-text` does.

This page shows how to build a custom directive, a custom magic, and how to
bundle both into a reusable plugin.

## A custom directive

Register a directive with [Summit.directive](../globals-directive/). You pass a
name without the `s-` prefix and a handler function. The name becomes the
attribute: registering `"money"` gives you `s-money`.

```js
Summit.directive("money", (el, meta, utils) => {
  utils.effect(() => {
    const amount = Number(utils.evaluate(meta.expression)) || 0;
    el.textContent = amount.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
  });
});
```

```html
<span s-money="price"></span>
```

That is the whole thing, and it is reactive. `utils.effect` runs the callback
once and re-runs it whenever any value the callback read changes. Because the
callback reads `price` through `utils.evaluate`, the text updates the moment
`price` changes, and only that text node updates.

### The handler arguments

Your handler is called with three arguments.

`el` is the element the directive is on.

`meta` describes the parsed attribute:

- `meta.name` is the directive name (`"money"`).
- `meta.value` is the part after a colon, or `null`. For `s-interval:500` it is
  `"500"`.
- `meta.modifiers` is the dot-separated list. For `@click.prevent.once` it is
  `["prevent", "once"]`.
- `meta.expression` is the attribute's value, the expression string.
- `meta.raw` is the original attribute name as written.

`utils` is the directive author's toolkit:

- `utils.evaluate(expression)` evaluates a value expression in this element's
  scope and returns the result.
- `utils.evaluateAction(expression, locals?)` evaluates one or more statements,
  optionally with extra local names (this is how `s-on` injects `$event`).
- `utils.effect(fn)` creates a batched reactive effect that is torn down
  automatically when the element is removed.
- `utils.cleanup(fn)` registers a teardown callback.
- `utils.scopes` is the scope stack visible at this element, and `utils.initTree`
  / `utils.destroyTree` let a directive set up or tear down a subtree it manages.
- `utils.Summit` is the Summit global, and `utils.makeEnv` builds a fresh
  evaluation environment for another element.

### Reading modifiers and cleaning up

A directive that is not purely reactive uses `meta.value`, `evaluateAction`, and
`cleanup`. Here is one that runs an action on an interval and tears the timer
down with the element:

```js
Summit.directive("interval", (el, meta, utils) => {
  const ms = Number(meta.value) || 1000;
  const id = setInterval(() => utils.evaluateAction(meta.expression), ms);
  utils.cleanup(() => clearInterval(id));
});
```

```html
<div s-data="{ seconds: 0 }" s-interval:1000="seconds++">
  <span s-text="seconds"></span>
</div>
```

Anything you register with `utils.cleanup` runs when the element leaves the DOM.
Effects created with `utils.effect` are cleaned up for you, so you only need
`cleanup` for listeners, timers, and observers you create yourself.

### Priority

A third argument sets the directive's priority. Lower numbers run earlier on the
same element, and the default is `100`.

```js
Summit.directive("focus", handler, 5); // runs before most directives
```

For reference, the built-ins run in this order: `s-ref` (10), `s-id` (15), the
structural `s-if`/`s-for`/`s-teleport` (20), `s-bind` (50), `s-model` (60),
`s-on` (70), `s-text`/`s-html` (80), `s-transition` (85), `s-show` (90),
`s-effect` (100), `s-init` (200), and `s-cloak` (1000). The structural directives
are a fixed internal group that take over their own subtree; a custom directive
runs in priority order after the scope and any structural directive are set up,
and Summit still descends into the element's children afterward.

## A custom magic

A magic is a `$`-prefixed helper available in every expression. Register one with
[Summit.magic](../globals-magic/). The factory receives a context object and
returns either a value or a function.

```js
Summit.magic("copy", () => (text) => navigator.clipboard.writeText(text));
```

```html
<button @click="$copy(title)">Copy title</button>
```

The factory's context gives you the element and scope plus the same evaluation
and lifecycle helpers directives get:

```js
Summit.magic("logged", (ctx) => {
  // ctx.el, ctx.scopes, ctx.evaluate, ctx.effect, ctx.cleanup
  return (label) => console.log(label, ctx.el);
});
```

Return a plain value for a property-style magic, or a function for a callable
one. Magics are also exposed on the component scope, so inside a `Summit.data`
method you can reach them as `this.$copy`, `this.$refs`, and so on.

## Bundling a plugin

A plugin is just a function that receives the Summit global. Use
[Summit.plugin](../globals-plugin/) to run it. Everything a plugin registers,
directives, magics, data providers, stores, and extra globals, lives together in
one installable unit.

```js
function commercePlugin(Summit) {
  Summit.addGlobals(["Intl"]);

  Summit.directive("money", (el, meta, utils) => {
    utils.effect(() => {
      const amount = Number(utils.evaluate(meta.expression)) || 0;
      el.textContent = amount.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
      });
    });
  });

  Summit.magic("copy", () => (text) => navigator.clipboard.writeText(text));

  Summit.data("cart", () => ({
    items: [],
    get total() {
      return this.items.reduce((sum, i) => sum + i.price, 0);
    },
  }));
}

Summit.plugin(commercePlugin);
```

`Summit.plugin` calls your function immediately with the global and returns the
global, so registration methods chain:

```js
Summit.plugin(commercePlugin).plugin(analyticsPlugin).start();
```

### When to register

Register your directives, magics, and plugins before Summit starts, so they are
in place when the page is first initialized. With the CDN build, which starts on
its own once the DOM is ready, put your registrations in a script that runs
before that, or register them inside a `summit:init` listener:

```js
document.addEventListener("summit:init", () => {
  Summit.plugin(commercePlugin);
});
```

Registration itself is timing-safe: the order of your registrations does not
matter, and registering a name that already exists overrides the previous
handler, which is how you can replace a built-in directive with your own.

## See also

- [Summit.directive](../globals-directive/), [Summit.magic](../globals-magic/),
  and [Summit.plugin](../globals-plugin/) for the reference details.
- [How reactivity works](../advanced-reactivity/) for what `utils.effect` does
  under the hood.
- [The CSP-safe evaluator](../advanced-evaluator/) for what `utils.evaluate`
  accepts.
