---
slug: technique-animation
title: Loaders & Spinners
nav: Loaders & Spinners
category: techniques
order: 1
description: A gallery of pure-CSS loaders: rings, dots, bars, shapes, animated logo marks, and skeleton screens.
---

Loading states set the tone for how fast an app feels. Every loader here is
pure CSS, so nothing runs on the main thread to animate it. Pick one, drop in
the markup, and it inherits your accent color and both themes.

## Spinners

Ring-shaped loaders, from a plain ring to a masked conic sweep.

```summit
<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:1.6rem; text-align:center">
  <div><div style="height:44px;display:grid;place-items:center"><span class="s-spinner"></span></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Ring</p></div>
  <div><div style="height:44px;display:grid;place-items:center"><span class="s-load-dual"></span></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Dual ring</p></div>
  <div><div style="height:44px;display:grid;place-items:center"><span class="s-load-dash"></span></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Dashed</p></div>
  <div><div style="height:44px;display:grid;place-items:center"><span class="s-load-conic"></span></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Conic</p></div>
  <div><div style="height:44px;display:grid;place-items:center"><span class="s-load-orbit"></span></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Orbit</p></div>
</div>
```

## Dots and bars

Good for inline or indeterminate loading, and for chat "typing" states.

```summit
<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:1.6rem; text-align:center">
  <div><div style="height:44px;display:grid;place-items:center"><div class="s-dots"><span></span><span></span><span></span></div></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Bouncing dots</p></div>
  <div><div style="height:44px;display:grid;place-items:center"><div class="s-load-wave"><span></span><span></span><span></span><span></span><span></span></div></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Wave</p></div>
  <div><div style="height:44px;display:grid;place-items:center"><div class="s-load-bars"><span></span><span></span><span></span><span></span><span></span></div></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Equalizer</p></div>
  <div><div style="height:44px;display:grid;place-items:center"><div class="s-load-typing"><span></span><span></span><span></span></div></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Typing</p></div>
</div>
```

## Shapes

Squares, grids, and ripples for a bit more personality.

```summit
<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:1.6rem; text-align:center">
  <div><div style="height:48px;display:grid;place-items:center"><span class="s-load-pulse"></span></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Pulse</p></div>
  <div><div style="height:48px;display:grid;place-items:center"><div class="s-load-ripple"><span></span><span></span></div></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Ripple</p></div>
  <div><div style="height:48px;display:grid;place-items:center"><div class="s-load-grid"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Grid</p></div>
  <div><div style="height:48px;display:grid;place-items:center"><span class="s-load-flip"></span></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Flip</p></div>
  <div><div style="height:48px;display:grid;place-items:center"><div class="s-load-bounce"><span></span><span></span></div></div><p style="margin:.55rem 0 0;font-size:.78rem;color:var(--faint)">Bounce</p></div>
</div>
```

## Animated logo marks

Three ways to bring the Summit mark to life while something loads: it breathes,
redraws its outline, or rests inside a sweeping ring. The mark is a two-part SVG
(`.sun` and `.peak`), so the same classes animate your own logo.

```summit
<div class="s-row" style="gap:2.5rem; align-items:center">
  <span class="s-logo-loader s-lg s-logo-pulse"><svg viewBox="0 0 40 32"><rect class="sun" x="21" y="3" width="9" height="9" rx="1.5" transform="rotate(45 25.5 7.5)"/><path class="peak" d="M2 28 L13 10 L20 22 L26 14 L38 28 Z"/></svg></span>
  <span class="s-logo-loader s-lg s-logo-draw"><svg viewBox="0 0 40 32"><rect class="sun" x="21" y="3" width="9" height="9" rx="1.5" transform="rotate(45 25.5 7.5)"/><path class="peak-outline" d="M2 28 L13 10 L20 22 L26 14 L38 28"/></svg></span>
  <span class="s-logo-loader s-lg s-logo-orbit"><svg viewBox="0 0 40 32"><rect class="sun" x="21" y="3" width="9" height="9" rx="1.5" transform="rotate(45 25.5 7.5)"/><path class="peak" d="M2 28 L13 10 L20 22 L26 14 L38 28 Z"/></svg></span>
</div>
```

## Indeterminate bar

```summit
<div class="s-bar" style="max-width:320px"></div>
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

## Class reference

| Loader | Markup |
| --- | --- |
| Ring | `<span class="s-spinner"></span>` |
| Dual ring | `<span class="s-load-dual"></span>` |
| Dashed | `<span class="s-load-dash"></span>` |
| Conic | `<span class="s-load-conic"></span>` |
| Orbit | `<span class="s-load-orbit"></span>` |
| Bouncing dots | `<div class="s-dots"><span></span>×3</div>` |
| Wave | `<div class="s-load-wave"><span></span>×5</div>` |
| Equalizer | `<div class="s-load-bars"><span></span>×5</div>` |
| Typing | `<div class="s-load-typing"><span></span>×3</div>` |
| Pulse | `<span class="s-load-pulse"></span>` |
| Ripple | `<div class="s-load-ripple"><span></span><span></span></div>` |
| Grid | `<div class="s-load-grid"><span></span>×9</div>` |
| Flip | `<span class="s-load-flip"></span>` |
| Bounce | `<div class="s-load-bounce"><span></span><span></span></div>` |
| Bar | `<div class="s-bar"></div>` |
| Skeleton | `.s-skel-text`, `.s-skel-title`, `.s-skel-avatar`, `.s-skel-block` |

## Accessibility

All of these respect `prefers-reduced-motion` and stop for users who ask for
less motion. Mark a pending region with `aria-busy="true"` for screen readers.
