---
slug: technique-glassmorphism
title: Matte Glassmorphism
nav: Matte Glassmorphism
category: techniques
order: 2
description: Frosted, low-gloss glass surfaces that blur what is behind them while staying legible in both themes.
---

Glassmorphism is a surface that blurs and tints whatever sits behind it. The
glossy version can wash out text; the matte version dials down the shine and
saturation so content stays readable over any background. Both are one class.

## Matte over a busy background

`.s-glass-matte` is a heavier frost with low gloss. Here it floats over a stage
of solid color shapes so you can see the blur at work.

```summit
<div class="s-glass-stage">
  <span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span>
  <div class="s-glass-matte" style="padding:1.3rem 1.5rem; max-width:340px; margin:0 auto">
    <p style="margin:0 0 .3rem; font-weight:700">Matte glass</p>
    <p style="margin:0; color:var(--muted); font-size:.92rem">Frosted, low-gloss, and legible over anything behind it. No gradient, no glare.</p>
  </div>
</div>
```

## Glossy vs matte

The plain `.s-glass` keeps more transparency and saturation for a brighter,
glassier look. Choose it for accents and `.s-glass-matte` for anything holding
text.

```summit
<div class="s-glass-stage" style="display:flex; gap:1rem; flex-wrap:wrap; justify-content:center">
  <span class="blob b1"></span><span class="blob b2"></span>
  <div class="s-glass" style="padding:1rem 1.2rem; flex:1; min-width:150px">
    <p style="margin:0; font-weight:700">.s-glass</p>
    <p style="margin:.2rem 0 0; font-size:.85rem; color:var(--muted)">Bright and glossy.</p>
  </div>
  <div class="s-glass-matte" style="padding:1rem 1.2rem; flex:1; min-width:150px">
    <p style="margin:0; font-weight:700">.s-glass-matte</p>
    <p style="margin:.2rem 0 0; font-size:.85rem; color:var(--muted)">Soft and legible.</p>
  </div>
</div>
```

## Copy it in

Put a glass surface over any positioned background: an image, a photo, or the
solid color blobs used here.

```html
<div class="s-glass-stage">
  <span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span>
  <div class="s-glass-matte" style="padding:1.3rem 1.5rem">
    Your content here.
  </div>
</div>
```

## Notes

- The effect uses `backdrop-filter`, supported in all current browsers. Where it
  is unavailable the surface degrades to a solid panel, which is still legible.
- Keep body text on `.s-glass-matte`, not `.s-glass`, for contrast.
- A glass bar makes a great sticky header. See [Navbar Patterns](../technique-navbars/).
