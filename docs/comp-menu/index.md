# Dropdown Menu

> A button-triggered menu that closes on outside click or Escape.

A dropdown menu hangs a short list of actions off a button. You click the button
to reveal it, pick an action, and it gets out of the way, either because you chose
something, clicked elsewhere, or pressed `Escape`. Like the rest of the library it
runs on one boolean in `s-data`, and the two dismissal paths, outside click and
`Escape`, are wired with plain [event modifiers](../events/).

```summit
<div class="s-anchor" s-data="{ open: false }" @keydown.escape="open = false">
  <button class="s-btn s-btn-outline" @click="open = !open">Options</button>
  <div class="s-menu" s-show="open" @click.outside="open = false">
    <button class="s-menu-item">Edit</button>
    <button class="s-menu-item">Duplicate</button>
    <div class="s-menu-sep"></div>
    <button class="s-menu-item is-danger">Delete</button>
  </div>
</div>
```

## Toggling

The trigger runs `@click="open = !open"`, so clicking it flips the menu open and
closed. The menu itself is a `.s-menu` shown with [s-show](../s-show/), which keeps
the markup in the DOM and toggles its visibility. The wrapper carries the class
`.s-anchor`, which positions the menu absolutely just under the button, so the
list floats over the page instead of pushing content down.

## Closing again

Two handlers cover the ways a menu should dismiss itself:

- Outside click: `@click.outside="open = false"` on the `.s-menu` fires when a
  click lands anywhere outside the menu, so clicking away closes it.
- `Escape`: `@keydown.escape="open = false"` on the wrapper closes the menu from
  the keyboard.

Because the whole thing shares one `open` value, the two paths cannot drift out of
sync.

## The items

The menu is a stack of building blocks you arrange to taste:

- `.s-menu-item` is a single action. Use a `<button>` for actions and an `<a>` for
  links; both pick up the same styling.
- `.s-menu-label` is a small uppercase heading you place above a group of related
  items to caption a section.
- `.s-menu-sep` is a thin divider that splits the list into groups.
- `.is-danger` on an item paints it in the danger color, which suits destructive
  actions like Delete.

```html
<div class="s-anchor" s-data="{ open: false }" @keydown.escape="open = false">
  <button class="s-btn s-btn-outline" @click="open = !open">Options</button>
  <div class="s-menu" s-show="open" @click.outside="open = false">
    <div class="s-menu-label">Actions</div>
    <button class="s-menu-item">Edit</button>
    <button class="s-menu-item">Duplicate</button>
    <div class="s-menu-sep"></div>
    <button class="s-menu-item is-danger">Delete</button>
  </div>
</div>
```

## Accessibility

The trigger is a real `<button>`, so it is focusable and operable with `Enter` and
`Space` out of the box, and each `.s-menu-item` is a button or link for the same
reason. Set `aria-haspopup="menu"` on the trigger and reflect the open state with
`aria-expanded`, bound to your state with [s-bind](../s-bind/), so assistive tech
knows a menu is attached and whether it is showing. The `Escape` handler gives
keyboard users a quick way out, matching the behavior of native menus, and the
outside-click handler keeps a stray open menu from lingering. When the menu opens,
move focus to the first item so the arrow keys and typing land somewhere sensible.

For a blocking confirmation rather than a list of actions, reach for the
[Dialog](../comp-dialog/); for free-form content in a floating panel, see the
[Popover](../comp-popover/).
