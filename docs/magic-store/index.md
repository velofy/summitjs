# $store

> The reactive global store.

`$store` is the reactive root that holds every store you register with
[Summit.store](../globals-store/). Reading a store value inside an expression
tracks it, and writing to one triggers an update, so a change made in one
component reaches every component that reads it.

Register a store by name, then reach it as `$store.<name>` from any expression.

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

```html
<div s-data>
  <button @click="$store.cart.add('apple')">Add to cart</button>
  <p>Cart has <span s-text="$store.cart.count"></span> items.</p>
</div>
```

## Single values

A store does not have to be an object. Single values are reactive too, so a
plain boolean works and its writes still update every reader.

```js
Summit.store("darkMode", false);
```

```html
<button @click="$store.darkMode = !$store.darkMode" :aria-pressed="$store.darkMode">
  Toggle theme
</button>
```

Because reads track and writes trigger, `$store.darkMode = !$store.darkMode` is
reactive with nothing extra to wire up.

## When to reach for it

Use `$store` for state that many, otherwise unrelated components need to share.
For state that belongs to one component and its children, keep it in `s-data`.
See [Summit.store](../globals-store/) for creating and reading stores from
JavaScript.
