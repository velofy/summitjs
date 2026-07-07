---
slug: comp-dialog
title: Dialog
nav: Dialog
category: components
order: 12
description: A modal dialog for confirmations and focused tasks, with overlay and Escape to close.
---

A dialog interrupts the page to ask for a decision or hold a short, focused task.
It draws an overlay across the page, floats a panel in the center, and traps the
user's attention until they act or dismiss it. Everything is driven by one piece
of state: a boolean that says whether the dialog is open. A button flips it on,
and the overlay, the close button, and the `Escape` key flip it back off.

```summit
<div s-data="{ open: false }">
  <button class="s-btn" @click="open = true">Open dialog</button>
  <template s-if="open">
    <div class="s-overlay" @click="open = false"></div>
    <div class="s-dialog" role="dialog" aria-modal="true" @keydown.escape.window="open = false">
      <div class="s-dialog-header"><h3 class="s-dialog-title">Delete project</h3></div>
      <button class="s-dialog-close" @click="open = false" aria-label="Close">&times;</button>
      <div class="s-dialog-body">This action cannot be undone.</div>
      <div class="s-dialog-footer">
        <button class="s-btn s-btn-ghost" @click="open = false">Cancel</button>
        <button class="s-btn s-btn-danger" @click="open = false">Delete</button>
      </div>
    </div>
  </template>
</div>
```

## Opening and closing

The whole component lives on the `open` boolean in `s-data`. The trigger button
sets it to `true`, and every path out of the dialog sets it back to `false`. The
overlay and panel sit inside a `<template s-if="open">`, so they are added to the
page only while the dialog is open and removed cleanly when it closes. Using
[s-if](../s-if/) here, rather than [s-show](../s-show/), means the markup does not
sit hidden in the DOM between openings.

There are three ways to close it, and all of them write the same state:

- The overlay: `@click="open = false"` on `.s-overlay` closes when the user
  clicks the dimmed area behind the panel.
- The `Escape` key: `@keydown.escape.window="open = false"` listens on the window
  so the key works no matter where focus sits.
- The close button: the `.s-dialog-close` in the corner, plus the Cancel button
  in the footer.

## The pieces

The panel is built from a small set of slots you fill in:

- `.s-overlay` is the fixed, dimmed backdrop. It also acts as the click-to-close
  surface.
- `.s-dialog` is the centered panel. Give it `role="dialog"` and
  `aria-modal="true"` so assistive tech announces it as a modal.
- `.s-dialog-header` wraps the `.s-dialog-title`.
- `.s-dialog-close` is the corner dismiss button. Label it with `aria-label`
  since its only content is a glyph.
- `.s-dialog-body` holds the message or form.
- `.s-dialog-footer` right-aligns the actions. Pair a neutral
  [button](../comp-button/) for cancel with a solid or danger one for confirm.

```html
<div s-data="{ open: false }">
  <button class="s-btn" @click="open = true">Open dialog</button>
  <template s-if="open">
    <div class="s-overlay" @click="open = false"></div>
    <div class="s-dialog" role="dialog" aria-modal="true" @keydown.escape.window="open = false">
      <div class="s-dialog-header">
        <h3 class="s-dialog-title">Delete project</h3>
      </div>
      <button class="s-dialog-close" @click="open = false" aria-label="Close">&times;</button>
      <div class="s-dialog-body">This action cannot be undone.</div>
      <div class="s-dialog-footer">
        <button class="s-btn s-btn-ghost" @click="open = false">Cancel</button>
        <button class="s-btn s-btn-danger" @click="open = false">Delete</button>
      </div>
    </div>
  </template>
</div>
```

## Side panel variant

Swap `.s-dialog` for `.s-drawer` and the panel docks to the right edge and runs
the full height of the viewport, which suits filters, details, and longer forms.
The overlay, the state, and every close path stay exactly the same; only the
panel class changes.

```html
<div class="s-overlay" @click="open = false"></div>
<div class="s-drawer" role="dialog" aria-modal="true" @keydown.escape.window="open = false">
  <div class="s-dialog-header">
    <h3 class="s-dialog-title">Filters</h3>
  </div>
  <button class="s-dialog-close" @click="open = false" aria-label="Close">&times;</button>
  <div class="s-dialog-body">Panel content.</div>
</div>
```

## Rendering in a real app

The demo above keeps the overlay next to its trigger so the example stays
self-contained. In a real layout that is risky: an ancestor with `overflow:
hidden` can clip the panel, and a local stacking context can push it behind other
content. The fix is to render the dialog at the end of `<body>`, clear of any
parent, with [s-teleport](../s-teleport/):

```html
<div s-data="{ open: false }">
  <button class="s-btn" @click="open = true">Open dialog</button>
  <template s-teleport="body">
    <template s-if="open">
      <div class="s-overlay" @click="open = false"></div>
      <div class="s-dialog" role="dialog" aria-modal="true" @keydown.escape.window="open = false">
        <div class="s-dialog-body">I render at the end of body, clear of overflow.</div>
      </div>
    </template>
  </template>
</div>
```

The panel is authored inside the component, so `open` and the close handlers keep
working, but it lands at the end of the page where nothing can clip or restack it.

## Accessibility

Mark the panel with `role="dialog"` and `aria-modal="true"` so screen readers
announce it as a modal and treat the content behind it as inert. Point the panel
at its title with `aria-labelledby` (pair the `.s-dialog-title` with an id, which
the [$id](../magic-id/) magic can generate) so the dialog has an accessible name.
The `Escape` handler is bound with `.window`, so the key closes the dialog from
anywhere, which matches the behavior users expect. Give the corner close button an
`aria-label`, since its `&times;` glyph is not a readable name. When you open a
dialog, move focus into it and return focus to the trigger on close so keyboard
users are not stranded.

For a menu of actions rather than a blocking decision, reach for the
[Dropdown Menu](../comp-menu/).
