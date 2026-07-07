# s-show

> Toggle an element's visibility with display.

`s-show` shows or hides an element by setting its inline `display`. The element
never leaves the DOM: it stays parsed, initialized, and keeps its state. Only
its visibility flips.

## Toggling visibility

Give `s-show` any expression. When it is truthy the element is visible, when it
is falsy it is hidden with `display: none`.

```summit
<div s-data="{ open: true }">
  <button @click="open = !open">Toggle panel</button>
  <p s-show="open">You can see me. Hide me and I stay in the DOM.</p>
</div>
```

When the expression becomes falsy, Summit sets `display: none`. When it becomes
truthy again, Summit restores whatever `display` the element had to begin with.
If you started the element at `display: flex`, that value comes back; if it had
no inline display, the property is removed so your CSS or the browser default
takes over.

## Beating stubborn CSS

If another rule forces the element to display, add the `.important` modifier so
Summit hides it with `display: none !important`.

```html
<div s-show.important="expanded">...</div>
```

## Difference from s-if

Both hide things, but they do it at different levels:

- `s-show` keeps the element in the DOM and only changes `display`. Toggling is
  cheap, and any internal state (input values, scroll position, child
  component state) is preserved while hidden.
- [s-if](../s-if/) adds and removes the element itself. When the condition is
  false the node is gone from the DOM and its reactive effects are torn down;
  when it returns it is built fresh.

Reach for `s-show` when you toggle often or need to keep state alive. Reach for
`s-if` when the element is expensive or rarely shown and you want it fully gone.

## Working with transitions

Pair `s-show` with [s-transition](../s-transition/) to animate the element as it
appears and disappears. The initial render is applied instantly; every toggle
after that runs the enter or leave animation.

```html
<div
  s-show="open"
  s-transition:enter="fade"
  s-transition:enter-start="opacity-0"
  s-transition:enter-end="opacity-100"
  s-transition:leave="fade"
  s-transition:leave-start="opacity-100"
  s-transition:leave-end="opacity-0"
>
  Fades in and out.
</div>
```
