# $el

> The current DOM element.

`$el` is the DOM element the current expression runs on. It is the element that
carries the directive, not the component root, so inside `@click` it is the
element you clicked and inside `s-text` it is the element being filled.

```summit
<div s-data="{ count: 0 }">
  <button @click="count++; $el.textContent = 'Clicked ' + count + ' times'">
    Click me
  </button>
</div>
```

Each expression sees its own `$el`. In the demo above `$el` is the button, so
writing to `$el.textContent` changes only the button.

## Reading from the element

Because `$el` is a real element, the whole DOM API is available. This is useful
for reading a property straight off the node instead of mirroring it in state.

```summit
<div s-data="{ shown: '' }">
  <input @input="shown = $el.value.toUpperCase()" placeholder="Type here" />
  <p s-text="shown"></p>
</div>
```

## Reaching the component root

`$el` is always the nearest element, which is often deep inside a component. When
you want the element that owns the `s-data` instead, use
[$root](../magic-root/). To reach other named elements in the component, use
[$refs](../magic-refs/).
