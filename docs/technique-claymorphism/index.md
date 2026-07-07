# Claymorphism

> Puffy, rounded, playful clay surfaces with soft inner and outer shadows.

Claymorphism is soft and toylike: big corner radii, a drop shadow for lift, and
two inner shadows that make a surface look inflated, like a pressed piece of
clay. It suits friendly, consumer, and onboarding interfaces.

## Clay card

```summit
<div class="s-clay" style="max-width:340px">
  <div class="s-row" style="gap:.8rem; align-items:center">
    <div class="s-avatar s-avatar-lg">SJ</div>
    <div>
      <p style="margin:0; font-weight:700">Streak: 7 days</p>
      <p style="margin:.2rem 0 0; color:var(--muted); font-size:.9rem">Keep it going tomorrow.</p>
    </div>
  </div>
</div>
```

## Clay buttons

```summit
<div class="s-row">
  <button class="s-clay-btn">Claim reward</button>
  <button class="s-clay-btn" style="background:var(--surface); color:var(--text)">Later</button>
</div>
```

## Copy it in

```html
<div class="s-clay">A soft, inflated card.</div>
<button class="s-clay-btn">Tap me</button>
```

## Notes

- The puffed look comes from an outer drop shadow plus inner top and bottom
  shadows. It recolors with your accent through `.s-clay-btn`.
- Pair it with the [Claymorphism](../technique-claymorphism/) accent and rounded
  [components](../components/) for a consistent, playful set.
