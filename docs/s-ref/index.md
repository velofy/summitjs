# s-ref

> Name an element so you can reach it through $refs.

`s-ref` gives an element a name so you can reach the real DOM node later through
the [$refs](../magic-refs/) magic. This is how you focus an input, measure a
box, or hand a node to another library, without reaching for
`document.querySelector`.

## Naming and reaching an element

The value of `s-ref` is the name. That name becomes a key on `$refs`, and its
value is the element itself.

```summit
<div s-data="{}">
  <input s-ref="field" placeholder="Your name" />
  <button @click="$refs.field.focus()">Focus the input</button>
</div>
```

Refs are registered on the nearest component root, so every element inside the
same [s-data](../s-data/) component shares one `$refs` registry. When the
element leaves the DOM, its ref is removed for you.

## Dynamic names

If the expression resolves to a non-empty string, Summit uses that string as the
name. Otherwise it falls back to the literal text you wrote. That means a plain
name like `s-ref="field"` just works, and you can also compute a name, which is
handy inside an [s-for](../s-for/) loop.

```html
<template s-for="item in items" :key="item.id">
  <li s-ref="'row-' + item.id" s-text="item.label"></li>
</template>
```

Here each row registers under `row-1`, `row-2`, and so on, reachable as
`$refs['row-' + id]`. One thing to watch: because the value is evaluated,
choosing a static name that also happens to be a string variable in scope will
use that variable's value as the name instead of the literal text.

## Reaching a ref after the DOM updates

If you reveal an element and then want to focus it in the same handler, wait for
the DOM to catch up first with [$nextTick](../magic-nextTick/).

```html
<button @click="open = true; $nextTick(() => $refs.panel.focus())">Open</button>
```
