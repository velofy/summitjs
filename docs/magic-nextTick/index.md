# $nextTick

> Run code after the next DOM update.

When you change state, Summit updates the DOM on the next microtask, not
immediately. `$nextTick` lets you run code after that update has landed, so you
can read the freshly rendered DOM. It takes an optional callback and returns a
promise.

```summit
<div s-data="{ msg: 'start', immediate: '', deferred: '' }">
  <button @click="msg = 'updated';
                  immediate = $refs.out.textContent;
                  $nextTick(() => deferred = $refs.out.textContent)">
    Update
  </button>
  <p s-ref="out" s-text="msg"></p>
  <p>read immediately: <span s-text="immediate"></span></p>
  <p>read after nextTick: <span s-text="deferred"></span></p>
</div>
```

Reading the element right after changing `msg` still sees the old text, because
the DOM has not updated yet. Reading inside `$nextTick` sees the new text.

## Awaiting the update

`$nextTick` returns a promise, so in an `async` method you can await it instead
of passing a callback.

```js
async grow() {
  this.rows.push(newRow());
  await this.$nextTick();
  this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
}
```

A common use is focusing an element that only just appeared, which is why you
will often see `$nextTick` paired with [$refs](../magic-refs/).

```html
<button @click="open = true; $nextTick(() => $refs.panel.focus())">Open</button>
```
