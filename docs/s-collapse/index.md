# s-collapse

> Animate an element open and closed by height.

`s-collapse` smoothly animates an element's height as an expression toggles. It
is a drop-in, animated alternative to [s-show](../s-show/) for accordions,
disclosure panels, and expanding menus.

```summit
<div s-data="{ open: false }">
  <button class="s-btn" @click="open = !open">Toggle details</button>
  <div s-collapse="open">
    <div style="padding:0.75rem 0">
      <p>This region slides open and closed instead of snapping.</p>
      <p>The height animates from 0 to its natural size.</p>
    </div>
  </div>
</div>
```

## How it differs from s-show

`s-show` flips `display` instantly. `s-collapse` keeps the element in flow and
animates its height, so the content around it eases into place. On first render
it sets the starting height with no animation, so there is no flash of motion on
load.

## Accessibility

Because the collapsed element stays in the DOM, pair it with the toggle's state
for assistive tech:

```html
<button @click="open = !open" :aria-expanded="open">Toggle</button>
<div s-collapse="open">...</div>
```
