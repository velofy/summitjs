---
slug: s-trap
title: s-trap
nav: s-trap
category: directives
order: 22
description: Keep keyboard focus inside an element while it is open.
---

`s-trap` keeps keyboard focus inside an element for as long as an expression is
truthy. This is what makes a modal dialog or a menu usable from the keyboard:
`Tab` cycles within it, and when it closes, focus returns to whatever opened it.

```summit
<div s-data="{ open: false }">
  <button class="s-btn" @click="open = true">Open dialog</button>
  <div s-show="open" s-trap="open" class="s-card" style="padding:1rem; max-width:340px; display:grid; gap:0.6rem">
    <p>Focus is trapped here. Tab stays inside; Shift+Tab wraps back.</p>
    <input class="s-input" placeholder="First field">
    <input class="s-input" placeholder="Second field">
    <button class="s-btn" @click="open = false">Close</button>
  </div>
</div>
```

## What it does

When the expression flips true, `s-trap`:

- remembers the element that was focused,
- moves focus to the first focusable child,
- keeps `Tab` and `Shift+Tab` cycling within the element.

When it flips false, focus returns to the remembered element. Removing the
element also releases the trap, so there is nothing to tear down.

## Pair it with Escape and a backdrop

`s-trap` handles focus; you still wire up dismissal the usual way.

```html
<div s-show="open" s-trap="open" @keydown.escape="open = false">
  ...
</div>
```

The built-in [Dialog](../comp-dialog/) component already uses `s-trap`, so most
of the time you get this for free.
