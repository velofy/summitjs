# Summit.directive

> Register a custom directive.

`Summit.directive` adds a new `s-` attribute to Summit. Your directive runs when
Summit initializes an element that carries it, with the same utilities the
built-in directives use, so a directive you write is a first-class citizen.

## Registering a directive

Call `Summit.directive(name, handler, priority?)`. The name is used without the
`s-` prefix. This registers `s-tooltip`:

```js
Summit.directive("tooltip", (el, meta, utils) => {
  utils.effect(() => {
    el.setAttribute("title", String(utils.evaluate(meta.expression)));
  });
});
```

```html
<button s-tooltip="'Copied ' + count + ' times'">Copy</button>
```

`Summit.directive` returns the `Summit` global, so registrations chain.

## The handler signature

The handler receives three arguments: `(el, meta, utils)`.

`el` is the element the directive is on.

`meta` describes how the attribute was written:

- `name`, the directive name without `s-` (here, `"tooltip"`).
- `value`, the part after a colon, or `null` if absent (`"click"` in `s-on:click`).
- `modifiers`, the dot-separated modifiers as an array (`["prevent", "stop"]`).
- `expression`, the attribute's value string, ready to pass to `evaluate`.
- `raw`, the original attribute name as written in the DOM.

`utils` is the directive author's toolkit:

- `evaluate(expression)` runs a value expression in the element's scope.
- `evaluateAction(expression, locals?)` runs statements (like an `s-on` handler),
  optionally with extra local variables.
- `effect(fn)` creates a reactive effect that re-runs when its dependencies
  change and is torn down automatically with the element.
- `cleanup(fn)` registers a teardown callback.
- `initTree(el, scopes?)` and `destroyTree(el)` initialize or tear down a subtree,
  used by structural directives that manage their own children.
- `scopes` is the scope stack visible at this element.
- `makeEnv(el, locals?)` builds a fresh evaluation environment for an element.
- `Summit` is the global itself.

Use `effect` for anything that should react to state, and `cleanup` for anything
that must be undone (a listener, a timer). Errors thrown in a handler are caught
and logged, so one broken directive will not stop the rest of the page.

## Priority

The optional third argument sets ordering. When an element has several
directives, lower numbers run earlier. The default is `100`, so pass a smaller
number to run before most directives and a larger one to run after:

```js
Summit.directive("setup", handler, 0); // runs early, before default directives
```

## Timing

Registration is timing-safe: register before or after
[Summit.start](../globals-start/). Built-in directives are registered when
Summit loads, and registering a custom directive with the same name overrides
the built-in.

For a fuller walkthrough, see
[Writing directives and plugins](../advanced-extending/).
