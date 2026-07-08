# s-anchor

> Position an element next to a reference, flipping to stay in view.

`s-anchor` positions a floating element next to a reference element and keeps it
on screen, flipping to the other side and shifting inward when it would overflow
the viewport. It is the positioning behind menus, popovers, and tooltips.

```summit
<div s-data="{ open: false }">
  <button class="s-btn" s-ref="trigger" @click="open = !open">Open menu</button>
  <div s-show="open" s-anchor="$refs.trigger" class="s-menu" style="min-width:170px">
    <button class="s-menu-item" @click="open = false">Profile</button>
    <button class="s-menu-item" @click="open = false">Settings</button>
    <button class="s-menu-item" @click="open = false">Sign out</button>
  </div>
</div>
```

The expression resolves to the reference element, usually through
[$refs](../magic-refs/).

## Placement

Modifiers choose the side and alignment. The default is `bottom` and `start`.

- Side: `.top` or `.bottom`
- Alignment: `.start`, `.center`, or `.end`
- Gap: `.offset.N` sets the distance in pixels (default 8)

```html
<div s-anchor.top.end="$refs.trigger">...</div>
<div s-anchor.bottom.center.offset.12="$refs.trigger">...</div>
```

## Staying in view

`s-anchor` re-positions on scroll and resize. If the preferred side would run off
the screen it flips to the opposite side, and it clamps horizontally so the
element never leaves the viewport. The [Menu](../comp-menu/) and
[Popover](../comp-popover/) components use it out of the box.
