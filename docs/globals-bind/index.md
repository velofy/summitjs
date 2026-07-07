# Summit.bind

> Register a reusable set of bindings.

`Summit.bind` registers a named bundle of attributes, event handlers, and
dynamic bindings so you can apply the whole set at once instead of repeating the
same `:class`, `@click`, and `aria-*` attributes on every element that needs
them. It is the reusable form of an object passed to
[s-bind](../s-bind/).

## Registering a bundle

Call `Summit.bind(name, provider)`. The provider is a function that takes no
arguments and returns an object of bindings:

```js
Summit.bind("menuButton", () => ({
  type: "button",
  "aria-haspopup": "true",
  "@click"() {
    Summit.store("menu").open = !Summit.store("menu").open;
  },
  ":aria-expanded"() {
    return Summit.store("menu").open;
  },
}));
```

`Summit.bind` returns the `Summit` global, so it chains with your other
registrations.

## What a bind provider returns

The object uses the same shape [s-bind](../s-bind/) accepts, and each kind of key
is handled differently:

- A plain key sets an attribute. Boolean attributes such as `disabled` are added
  or removed based on truthiness; a value of `false` or `null` removes the
  attribute.
- An `@event` key adds an event listener. Its value is the handler, called with
  the event. The listener is removed automatically when the element is torn down.
- A `:attr` key is a dynamic binding. Its value is a getter function that Summit
  runs inside a reactive effect, so the attribute re-applies whenever the
  reactive state the getter reads changes. Read that state from a store or other
  reactive source, since a bind provider has no component scope of its own.

## Applying a bundle

Retrieve a registered provider with `Summit.getBind(name)`, which returns the
provider function (or `undefined` if none is registered). Calling it produces the
bindings object, which you hand to [s-bind](../s-bind/). Add `Summit` to the
expression globals once so markup can reach it:

```js
Summit.addGlobals(["Summit"]);
```

```html
<button s-bind="Summit.getBind('menuButton')()"></button>
```

Because `s-bind` merges these bindings onto the element, you can still add
element-specific attributes and directives alongside the shared bundle.
