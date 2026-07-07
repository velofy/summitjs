# Aurora Backgrounds

> Slow, glowing color fields that drift behind your content for a premium hero look.

An aurora is a soft field of colored light that drifts slowly behind your
content. It gives heroes and feature panels a premium, ambient feel without a
busy image. The glow lives on pseudo-elements, so your content sits cleanly on
top.

## Aurora panel

```summit
<div class="s-aurora" style="text-align:center">
  <p style="margin:0; font-family:var(--font); font-size:1.6rem; font-weight:800; letter-spacing:-.02em">Reach the summit</p>
  <p style="margin:.5rem auto 0; max-width:34ch; opacity:.85">A calm, drifting glow behind a clear message.</p>
  <button class="s-btn" style="margin-top:1.1rem">Get started</button>
</div>
```

## As a hero background

Put anything inside: a headline, a form, a call to action. The color field moves
on its own.

```html
<section class="s-aurora">
  <h1>Your headline here</h1>
  <p>Supporting copy that stays crisp on top of the glow.</p>
  <button class="s-btn">Primary action</button>
</section>
```

## Notes

- The glow uses two blurred, animated radial shapes on `::before` and `::after`.
  It runs on the compositor and pauses under `prefers-reduced-motion`.
- The panel uses your `--ink` background so text stays high contrast in both
  themes. Recolor the two shapes in `techniques.css` to match your brand.
- For a foreground surface over a busy backdrop, use
  [Matte Glassmorphism](../technique-glassmorphism/) instead.
