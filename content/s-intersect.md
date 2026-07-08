---
slug: s-intersect
title: s-intersect
nav: s-intersect
category: directives
order: 20
description: Run an expression when an element enters or leaves the viewport.
---

`s-intersect` runs an expression the moment its element scrolls into view. It
wraps an `IntersectionObserver` so you can lazy-load, reveal on scroll, or fire
analytics without writing observer boilerplate.

```summit
<div s-data="{ seen: false }">
  <div s-intersect="seen = true" class="s-card" style="padding:1rem">
    <p s-text="seen ? 'This block is in view.' : 'Scroll me into view.'"></p>
  </div>
</div>
```

## Enter and leave

By default the expression runs when the element becomes visible. Add the `:leave`
part to run when it goes out of view instead. You can use both on one element.

```html
<div s-intersect="playing = true" s-intersect:leave="playing = false"></div>
```

## Modifiers

- `.once` stops observing after the first time it fires.
- `.half` waits until the element is at least half visible.
- `.full` waits until it is almost entirely visible.

```html
<img src="hero.jpg" s-intersect.once="loaded = true">
<section s-intersect.half="active = true"></section>
```

## s-resize

Its sibling `s-resize` runs an expression whenever the element changes size,
exposing the new box as `$width` and `$height`.

```html
<div s-resize="w = $width" s-text="Math.round(w) + 'px wide'"></div>
```

Both directives detach their observers automatically when the element is
removed, so there is nothing to clean up.
