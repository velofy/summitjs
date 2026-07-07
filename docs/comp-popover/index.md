# Popover

> A click-triggered floating panel for rich content, dismissed on outside click or Escape.

A popover is a small floating panel you open with a click to show rich content
next to its trigger: a short form, a set of controls, a detail card. It is more
than a [Tooltip](../comp-tooltip/), which only shows a line of text on hover, and
looser than a [Dropdown Menu](../comp-menu/), which holds a list of actions. The
markup is a `.s-anchor` that positions the floating `.s-popover`, wired with the
same handful of `s-` directives you already use.

## A live popover

The `.s-anchor` establishes the positioning context, the button toggles `open`,
and the `.s-popover` shows while `open` is `true`. Two directives handle
dismissal: `@click.outside` closes the panel when you click anywhere else, and
`@keydown.escape` closes it from the keyboard.

```summit
<div class="s-anchor" s-data="{ open: false }" @keydown.escape="open = false">
  <button class="s-btn s-btn-outline" @click="open = !open">Show popover</button>
  <div class="s-popover" s-show="open" @click.outside="open = false">
    <p style="margin:0 0 .4rem;font-weight:600">Dimensions</p>
    <p style="margin:0;color:var(--muted);font-size:.88rem">Set the width and height of the layer.</p>
  </div>
</div>
```

```html
<div class="s-anchor" s-data="{ open: false }" @keydown.escape="open = false">
  <button class="s-btn s-btn-outline" @click="open = !open">Show popover</button>
  <div class="s-popover" s-show="open" @click.outside="open = false">
    <p style="margin:0 0 .4rem;font-weight:600">Dimensions</p>
    <p style="margin:0;color:var(--muted);font-size:.88rem">Set the width and height of the layer.</p>
  </div>
</div>
```

## A panel with controls

Because a popover holds real content, you can put inputs and buttons inside it.
Clicks that land within the panel do not trigger `@click.outside`, so typing in a
field keeps the popover open. Wire a confirming action to set `open = false` so
the panel closes once the user is done.

```summit
<div class="s-anchor" s-data="{ open: false, name: 'Untitled' }" @keydown.escape="open = false">
  <button class="s-btn" @click="open = !open">Rename</button>
  <div class="s-popover" s-show="open" @click.outside="open = false">
    <label class="s-label">Project name</label>
    <input class="s-input" s-model="name">
    <div class="s-row" style="margin-top:.7rem;justify-content:flex-end">
      <button class="s-btn s-btn-ghost s-btn-sm" @click="open = false">Cancel</button>
      <button class="s-btn s-btn-sm" @click="open = false">Save</button>
    </div>
  </div>
</div>
```

```html
<div class="s-anchor" s-data="{ open: false, name: 'Untitled' }" @keydown.escape="open = false">
  <button class="s-btn" @click="open = !open">Rename</button>
  <div class="s-popover" s-show="open" @click.outside="open = false">
    <label class="s-label">Project name</label>
    <input class="s-input" s-model="name">
    <div class="s-row" style="margin-top:.7rem;justify-content:flex-end">
      <button class="s-btn s-btn-ghost s-btn-sm" @click="open = false">Cancel</button>
      <button class="s-btn s-btn-sm" @click="open = false">Save</button>
    </div>
  </div>
</div>
```

## Positioning

The `.s-popover` is absolutely positioned against its `.s-anchor`, opening just
below the trigger and aligned to its left edge. Because the anchor is the
positioning context, keep the trigger and the panel together inside the same
`.s-anchor`. To place the panel elsewhere, override `top`, `left`, or `right` on
`.s-popover` in your own styles; to widen it past the default `260px`, set a new
`width`.

## Notes

Toggling `open` drives everything, so a single boolean is the whole state model.
Keep `@click.outside` and `@keydown.escape` on the panel and the anchor so the
popover always has a way out, whether the user reaches for the mouse or the
keyboard. For accessibility, add `aria-expanded` bound to `open` on the trigger
and point `aria-controls` at the panel's id, which you can generate with the
[$id](../magic-id/) magic.

For a hover hint of plain text, use a [Tooltip](../comp-tooltip/). For a list of
commands or links, reach for a [Dropdown Menu](../comp-menu/), which shares the
same `.s-anchor` and dismissal pattern. The event modifiers used here are covered
on the [Events](../events/) page.
