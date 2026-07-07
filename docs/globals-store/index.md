# Summit.store

> Create and read global reactive state.

State that many components share lives in a store, not in `s-data`. `Summit.store`
both creates a store and reads one back, depending on whether you pass a value.
Every store is reactive, so any expression that reads it updates when it changes.

## Creating a store

Call `Summit.store(name, value)` with a starting value. Pass an object for
structured state:

```js
Summit.store("cart", {
  items: [],
  get count() {
    return this.items.length;
  },
  add(item) {
    this.items.push(item);
  },
});
```

An object store is made reactive the same way a component is: getters become
cached derived values and methods are bound so `this` is the store. If the
object has an `init()` method, Summit calls it once, right after the store is
created.

Primitives work too, and stay reactive because every store lives under one
reactive root:

```js
Summit.store("darkMode", false);
```

## Reading a store

Call `Summit.store(name)` with no value to read the current one:

```js
const cart = Summit.store("cart");
cart.add({ id: 1 });
```

In markup, reach any store through the [$store](../magic-store/) magic. Reads
track, so the view stays in sync, and writes are reactive out of the box:

```html
<button @click="$store.darkMode = !$store.darkMode">
  Toggle theme
</button>

<p s-text="$store.cart.count"></p>
```

## Return values

The call returns something useful in every form:

- `Summit.store("cart", { ... })` returns the reactive store object.
- `Summit.store("darkMode", false)` returns the stored value.
- `Summit.store("cart")` returns the store's current value.

## Updating a store

Mutate an object store through its own methods or properties, from JavaScript or
from an expression, and every reader updates:

```js
Summit.store("cart").add({ id: 2 });
```

For a primitive store, assign through `$store` in an expression
(`$store.darkMode = true`), or call `Summit.store(name, value)` again from
JavaScript to replace the value. To create the store, see the object and
primitive examples above.
