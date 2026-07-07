---
slug: technique-retro
title: Retro UI
nav: Retro UI
category: techniques
order: 5
description: Hard offset shadows and neon text for a retro, terminal, or arcade look.
---

Sometimes you want the opposite of soft and frosted: chunky borders, hard
shadows, monospace type, and a little glow. These classes give an interface a
retro, terminal, or arcade feel while staying token-themed.

## Retro card and tag

A thick border and a hard offset shadow, in the accent color.

```summit
<div class="s-retro" style="max-width:360px">
  <span class="s-retro-tag">New</span>
  <p style="margin:.7rem 0 0"><span class="s-neon">SUMMIT.EXE</span> loaded successfully.</p>
  <p style="margin:.4rem 0 0; color:var(--muted); font-size:.88rem">Ready for input.</p>
</div>
```

## Retro buttons

The button presses into its own shadow when you click it.

```summit
<div class="s-row">
  <button class="s-retro-btn">Start</button>
  <button class="s-retro-btn" style="background:var(--surface); color:var(--text)">Options</button>
</div>
```

## Neon glow

`.s-neon` adds a soft glow to text, built from the accent color.

```summit
<div class="s-retro" style="text-align:center; padding:1.6rem">
  <span class="s-neon" style="font-size:1.6rem">GAME OVER</span>
  <p style="margin:.6rem 0 0; font-family:var(--mono); color:var(--muted)">Insert coin to continue</p>
</div>
```

## Copy it in

```html
<div class="s-retro">
  <span class="s-retro-tag">New</span>
  <p><span class="s-neon">Hello</span>, world.</p>
</div>

<button class="s-retro-btn">Press me</button>
```

The classes are `.s-retro` (card), `.s-retro-btn` (button), `.s-retro-tag`
(label), and `.s-neon` (glow text). They read the same design tokens as
everything else, so they recolor with your accent.
