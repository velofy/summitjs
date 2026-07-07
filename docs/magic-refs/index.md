# $refs

> Elements in this component marked with s-ref.

`$refs` is an object of the elements in the current component that you tagged
with [s-ref](../s-ref/), keyed by their ref name. It is how you reach a specific
element to focus it, measure it, or call a method on it, without a query
selector.

```summit
<div s-data="{}">
  <input s-ref="field" placeholder="Your name" />
  <button @click="$refs.field.focus()">Focus the field</button>
</div>
```

Mark an element with `s-ref="name"` and it appears as `$refs.name`.

## Naming a ref

By default the literal attribute value is the name, so `s-ref="field"` registers
under `field`. When the value resolves to a non-empty string it is treated as a
dynamic name instead, which is what you want inside a loop where each element
needs its own key. The full rules are on the [s-ref](../s-ref/) page.

## Scope and lifetime

`$refs` collects the refs for the nearest component, the closest `s-data`
ancestor. A ref registered inside a child component is not visible from a parent,
and vice versa. When an element leaves the DOM its entry is removed, so `$refs`
only ever holds elements that are currently mounted.

Refs are populated as elements initialize, so read them from an event handler or
inside [$nextTick](../magic-nextTick/) rather than at the top of `init()`, when a
later sibling may not exist yet.
