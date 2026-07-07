---
slug: technique-animation
title: Animated Loaders
nav: Animated Loaders
category: techniques
order: 1
description: Animated Summit logo marks, dot and bar loaders, and skeleton screens for loading states.
---

Loading states set the tone for how fast an app feels. These are all CSS: no
JavaScript runs the animation, so they are cheap and smooth. Pair any of them
with Summit state to swap a placeholder for real content.

## Animated logo marks

Three ways to bring the Summit mark to life while something loads. The mark
breathes, redraws its outline, or rests inside a sweeping ring.

```summit
<div class="s-row" style="gap:2.5rem; align-items:center">
  <span class="s-logo-loader s-lg s-logo-pulse"><svg viewBox="0 0 40 32"><rect class="sun" x="21" y="3" width="9" height="9" rx="1.5" transform="rotate(45 25.5 7.5)"/><path class="peak" d="M2 28 L13 10 L20 22 L26 14 L38 28 Z"/></svg></span>
  <span class="s-logo-loader s-lg s-logo-draw"><svg viewBox="0 0 40 32"><rect class="sun" x="21" y="3" width="9" height="9" rx="1.5" transform="rotate(45 25.5 7.5)"/><path class="peak-outline" d="M2 28 L13 10 L20 22 L26 14 L38 28"/></svg></span>
  <span class="s-logo-loader s-lg s-logo-orbit"><svg viewBox="0 0 40 32"><rect class="sun" x="21" y="3" width="9" height="9" rx="1.5" transform="rotate(45 25.5 7.5)"/><path class="peak" d="M2 28 L13 10 L20 22 L26 14 L38 28 Z"/></svg></span>
</div>
```

The mark is a two-part SVG: a `.sun` diamond and a `.peak` mountain (or
`.peak-outline` for the draw variant). Swap in your own logo and the same
classes animate it.

```html
<span class="s-logo-loader s-logo-pulse">
  <svg viewBox="0 0 40 32">
    <rect class="sun" x="21" y="3" width="9" height="9" rx="1.5" transform="rotate(45 25.5 7.5)"/>
    <path class="peak" d="M2 28 L13 10 L20 22 L26 14 L38 28 Z"/>
  </svg>
</span>
```

## Dots, bar, and spinner

For inline or indeterminate loading, reach for a smaller loader.

```summit
<div class="s-stack" style="gap:1.3rem; max-width:300px">
  <div class="s-dots"><span></span><span></span><span></span></div>
  <div class="s-bar"></div>
  <span class="s-spinner"></span>
</div>
```

## Skeleton screens

A skeleton mirrors the shape of the content that is coming, so the layout does
not jump when it arrives. Drive the swap with a boolean in `s-data`.

```summit
<div s-data="{ loading: true }">
  <button class="s-btn s-btn-sm" @click="loading = !loading">Toggle loading</button>
  <div style="margin-top:1.1rem">
    <div s-show="loading" class="s-row" style="align-items:flex-start; gap:.8rem">
      <div class="s-skel-avatar"></div>
      <div class="s-stack" style="flex:1; gap:.5rem">
        <div class="s-skel-title" style="width:45%"></div>
        <div class="s-skel-text" style="width:92%"></div>
        <div class="s-skel-text" style="width:70%"></div>
      </div>
    </div>
    <div s-show="!loading" class="s-row" style="align-items:flex-start; gap:.8rem">
      <div class="s-avatar">AL</div>
      <div>
        <p style="margin:0; font-weight:650">Ada Lovelace</p>
        <p style="margin:.2rem 0 0; color:var(--muted)">Wrote the first algorithm, long before the hardware existed to run it.</p>
      </div>
    </div>
  </div>
</div>
```

The skeleton helpers are `.s-skel-text`, `.s-skel-title`, `.s-skel-avatar`, and
`.s-skel-block`. Set a width inline to vary the lines. See also the base
[Progress & Spinner](../comp-progress/) component.

## Accessibility

Animations here respect `prefers-reduced-motion` and stop for users who ask for
less motion. For screen readers, mark a loading region with `aria-busy="true"`
while it is pending.
