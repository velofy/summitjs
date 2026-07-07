---
slug: comp-tooltip
title: Tooltip
nav: Tooltip
category: components
order: 11
description: A CSS-only tooltip that appears on hover and focus.
---

A tooltip is a small label that appears next to a control to explain what it
does. Summit's version is pure CSS: it shows while the wrapper is hovered or
holds focus, and hides again on its own. There is no `s-data`, no directive, and
no JavaScript to wire up. You just nest the tip inside the trigger.

```summit
<span class="s-tooltip">
  <button class="s-btn s-btn-outline">Hover or focus me</button>
  <span class="s-tip">Saved just now</span>
</span>
```

## Structure

A tooltip is two parts inside one wrapper:

- `.s-tooltip` is the wrapper. It positions the tip and listens for hover and
  focus through CSS alone.
- Inside it goes your trigger (a button or link) and a `<span class="s-tip">`
  holding the text.

The tip is hidden until the wrapper matches `:hover` or `:focus-within`, so it
appears both when you point at the trigger and when a keyboard user tabs onto
it. That is why the trigger should be a naturally focusable element. If you wrap
something that is not focusable, add `tabindex="0"` so keyboard users reach it
too.

## Any trigger

The wrapper works around a button, an icon button, or plain inline text. Keep
the tip short: it renders on a single line and does not wrap.

```summit
<div class="s-row">
  <span class="s-tooltip">
    <button class="s-btn">Publish</button>
    <span class="s-tip">Goes live immediately</span>
  </span>
  <span class="s-tooltip">
    <button class="s-btn s-btn-icon s-btn-outline" aria-label="More info">?</button>
    <span class="s-tip">What is this?</span>
  </span>
</div>
```

## Copy and paste

```html
<span class="s-tooltip">
  <button class="s-btn">Hover me</button>
  <span class="s-tip">Helpful hint</span>
</span>
```

## Notes

- No state is involved. The tooltip needs no `s-data` and adds nothing to your
  JavaScript, so you can drop it anywhere, even into otherwise static markup.
- Because it is CSS-only, the tip always sits above the trigger and centered. It
  does not measure the viewport or flip to stay on screen, so avoid it right at
  the top edge of the page.
- Text stays on one line by design. For anything longer, or for content that
  should open on click and hold buttons or fields, reach for a
  [Popover](../comp-popover/) instead.
- Browse the rest of the set on the [UI Library overview](../components/).
