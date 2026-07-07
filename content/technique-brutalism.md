---
slug: technique-brutalism
title: Brutalism
nav: Brutalism
category: techniques
order: 6
description: Stark borders, loud uppercase type, and blunt offset shadows for a raw, confident look.
---

Neo-brutalism is loud and honest: sharp corners, thick borders, hard offset
shadows in solid black, and type that shouts. Where glass and clay are soft,
brutalism is blunt. It reads as confident and a little punk.

## Brutal card

```summit
<div class="s-brutal" style="max-width:360px">
  <span class="s-brutal-tag">Ship it</span>
  <p style="margin:.7rem 0 0; font-weight:700; font-size:1.05rem">No gradients. No apologies.</p>
  <p style="margin:.35rem 0 0; color:var(--muted)">Just borders, shadows, and nerve.</p>
</div>
```

## Brutal buttons

The button slams into its shadow when pressed.

```summit
<div class="s-row">
  <button class="s-brutal-btn s-brutal-accent">Deploy</button>
  <button class="s-brutal-btn">Cancel</button>
</div>
```

## Accent panel

```summit
<div class="s-brutal s-brutal-accent" style="max-width:360px">
  <p style="margin:0; font-weight:800; text-transform:uppercase; letter-spacing:.03em">Limited drop</p>
  <p style="margin:.3rem 0 0">Bold blocks of color, framed hard.</p>
</div>
```

## Copy it in

```html
<div class="s-brutal">
  <span class="s-brutal-tag">New</span>
  <p>Raw and framed.</p>
</div>

<button class="s-brutal-btn s-brutal-accent">Go</button>
```

The classes are `.s-brutal` (card), `.s-brutal-accent` (fill it with the accent),
`.s-brutal-btn`, and `.s-brutal-tag`. For a softer take on hard shadows, see
[Retro UI](../technique-retro/).
