# Summit.magic

> Register a custom magic property.

`Summit.magic` adds a `$`-prefixed helper that every expression can reach, the
same way the built-ins [$el](../magic-el/), [$refs](../magic-refs/), and
[$store](../magic-store/) work. Use it to expose a value or a small function to
your markup without threading it through component state.

## Registering a magic

Call `Summit.magic(name, factory)`. The name is used with a `$` prefix in
expressions. The factory receives a context object and returns whatever `$name`
should be:

```js
Summit.magic("clipboard", () => (text) => navigator.clipboard.writeText(text));
```

```html
<button @click="$clipboard(label)">Copy</button>
```

Return a function and `$name(...)` calls it. Return a value and `$name` is that
value:

```js
Summit.magic("now", () => new Date());
```

`Summit.magic` returns the `Summit` global, so registrations chain.

## The magic context

The factory is called with a context object for the element where the magic is
used:

- `el` is the element the expression is running on.
- `scopes` is the scope stack visible at that element.
- `evaluate(expression)` evaluates an expression in that scope.
- `effect(fn)` creates a reactive effect torn down with the element.
- `cleanup(fn)` registers a teardown callback.

Because the factory runs per use, a magic can be element-aware. This one reads
the current element's id:

```js
Summit.magic("myId", (ctx) => ctx.el.id);
```

Use `effect` and `cleanup` when your magic sets up something reactive or
disposable, so it is cleaned up when the element goes away.

## Timing

Registration is timing-safe: register before or after
[Summit.start](../globals-start/). Registering a magic with the name of a
built-in overrides it. For a broader guide, see
[Writing directives and plugins](../advanced-extending/).
