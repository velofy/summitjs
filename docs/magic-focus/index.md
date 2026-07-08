# $focus

> Move keyboard focus around from an expression.

`$focus` is a small helper for moving keyboard focus. Use it to send focus to a
field after an action, or to step through the focusable elements inside a region.

```summit
<div s-data>
  <button class="s-btn" @click="$focus.within($refs.box).first()">Focus first field</button>
  <div s-ref="box" style="margin-top:0.6rem; display:flex; gap:0.5rem">
    <input class="s-input" placeholder="First">
    <input class="s-input" placeholder="Second">
  </div>
</div>
```

## Methods

- `$focus.focus(el)` focuses a specific element, e.g. `$focus.focus($refs.field)`.
- `$focus.first()` / `$focus.last()` focus the first or last focusable element.
- `$focus.next()` / `$focus.previous()` step through them, wrapping around.
- `$focus.within(el)` returns a helper rooted at `el` instead of the current one.

By default `$focus` looks inside the element it is used on. `within` lets you aim
it at any other element, which pairs well with [$refs](../magic-refs/).

```html
<input s-ref="email" @keydown.enter="$focus.focus($refs.password)">
```

For a full focus trap on a dialog or menu, reach for the [s-trap](../s-trap/)
directive, which builds on the same idea.
