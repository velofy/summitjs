# $watch

> Run a callback when a watched expression changes.

`$watch` runs a callback whenever a watched expression changes. The signature is
`$watch(expression, callback)`, where `expression` is a string evaluated in the
component's scope and `callback` receives the new value and the old value.

```summit
<div s-data="{ count: 0, last: 'no changes yet' }"
     s-init="$watch('count', (value, old) => last = old + ' to ' + value)">
  <button @click="count++">Increment</button>
  <p>count is <span s-text="count"></span></p>
  <p>last change: <span s-text="last"></span></p>
</div>
```

Set the watcher up once, in [s-init](../s-init/) or in a component's `init()`
method. The callback then fires on every later change to the expression.

## It only fires on a real change

`$watch` compares values and only calls your callback when the value actually
changes. That means you can mutate the watched value from inside the callback
without spinning into an infinite loop, which is a common trap in other
frameworks.

## It returns an unwatch function

`$watch` returns a function that stops the watcher. Call it when you no longer
need the callback.

```summit
<div s-data="{ n: 0, log: 'watching', stop: null }"
     s-init="stop = $watch('n', (value, old) => log = old + ' to ' + value)">
  <button @click="n++">Increment</button>
  <button @click="stop && (stop(), log = 'stopped')">Stop watching</button>
  <p>n is <span s-text="n"></span></p>
  <p>log: <span s-text="log"></span></p>
</div>
```

After you stop the watcher the callback no longer runs, even as `n` keeps
changing. You rarely need to call this by hand, though: a watcher is torn down
automatically when its component leaves the DOM.

## Watching derived values

The first argument is any expression, not just a property name, so you can watch
a nested path or a computed result.

```js
this.$watch("user.name", (name) => console.log("name is now", name));
this.$watch("items.length", (n) => console.log(n, "items"));
```

For a side effect that should re-run without needing the old value, reach for
[s-effect](../s-effect/) instead.
