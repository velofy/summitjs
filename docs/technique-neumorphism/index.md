# Neumorphism

> Soft, extruded UI built from twin light and dark shadows on a matching surface.

Neumorphism, or soft UI, makes elements look pressed out of, or into, the
surface behind them. The trick is two shadows: a dark one below-right and a
light one above-left, on a surface that matches the element. It reads best on a
neutral background, so place these inside a `.s-neu-surface`.

## Raised and inset

```summit
<div class="s-neu-surface">
  <div class="s-row" style="gap:1.2rem; flex-wrap:wrap">
    <div class="s-neu" style="flex:1; min-width:150px">
      <p style="margin:0; font-weight:650">Raised</p>
      <p style="margin:.25rem 0 0; color:var(--muted); font-size:.88rem">Extruded from the surface.</p>
    </div>
    <div class="s-neu-inset" style="flex:1; min-width:150px">
      <p style="margin:0; font-weight:650">Inset</p>
      <p style="margin:.25rem 0 0; color:var(--muted); font-size:.88rem">Pressed into the surface.</p>
    </div>
  </div>
</div>
```

## Buttons that press

The button sinks into an inset shadow while held.

```summit
<div class="s-neu-surface">
  <div class="s-row">
    <button class="s-neu-btn">Save</button>
    <button class="s-neu-btn">Cancel</button>
  </div>
</div>
```

## Copy it in

```html
<div class="s-neu-surface">
  <div class="s-neu">Raised card</div>
  <div class="s-neu-inset">Inset well</div>
  <button class="s-neu-btn">Press me</button>
</div>
```

## Notes

- Neumorphism needs low contrast between the element and its background, which
  can hurt legibility and focus visibility. Use it for accents, not for dense
  or critical controls.
- The classes are `.s-neu-surface` (the backing), `.s-neu` (raised),
  `.s-neu-inset` (pressed in), and `.s-neu-btn`. Shadows adapt in dark mode.
