---
slug: technique-glow
title: Glow & Spotlight
nav: Glow & Spotlight
category: techniques
order: 8
description: A soft highlight that follows the cursor across a card, driven by a tiny Summit handler.
---

A spotlight card puts a soft highlight under the cursor and moves it as you go.
The highlight is pure CSS; Summit's only job is to feed the pointer position
into two CSS variables. Move your cursor across the card below.

## Spotlight card

```summit
<div class="s-glow-card" s-data
     @mousemove="$el.style.setProperty('--mx', $event.offsetX + 'px'); $el.style.setProperty('--my', $event.offsetY + 'px')"
     style="max-width:380px">
  <p style="margin:0; font-weight:700">Spotlight</p>
  <p style="margin:.35rem 0 0; color:var(--muted)">A highlight follows your cursor across this card, then fades when you leave.</p>
  <div class="s-row" style="margin-top:1rem">
    <button class="s-btn s-btn-sm">Action</button>
    <button class="s-btn s-btn-sm s-btn-ghost">Dismiss</button>
  </div>
</div>
```

## How it works

The card's `::before` draws a radial highlight at `var(--mx) var(--my)` and fades
in on hover. A `@mousemove` handler writes the pointer's position, taken from
`$event`, onto the element with `$el`.

```html
<div class="s-glow-card"
     @mousemove="$el.style.setProperty('--mx', $event.offsetX + 'px');
                 $el.style.setProperty('--my', $event.offsetY + 'px')">
  Your content here.
</div>
```

## Notes

- No state is needed: the handler reads [$event](../s-on/) and writes to
  [$el](../magic-el/) directly, so there is nothing to store.
- The highlight only appears on hover, so touch users see a clean card.
- Tint the glow by changing the accent mix in the `.s-glow-card::before` rule.
