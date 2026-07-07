# Progress & Spinner

> Progress bars, spinners, and skeleton placeholders for loading states.

Loading states tell people the app is still working. Summit gives you three
primitives for them: a progress bar you drive from state, a spinner for waits
whose length you cannot predict, and a skeleton that stands in for content that
has not arrived yet. The bar is the only interactive one, so it reads its width
straight off a value in `s-data`.

```summit
<div s-data="{ pct: 40 }" role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct">
  <div class="s-progress"><span :style="{ width: pct + '%' }"></span></div>
  <div class="s-row" style="margin-top:.75rem">
    <button class="s-btn s-btn-sm s-btn-outline" @click="pct = Math.max(0, pct - 10)">-10%</button>
    <button class="s-btn s-btn-sm s-btn-outline" @click="pct = Math.min(100, pct + 10)">+10%</button>
    <button class="s-btn s-btn-sm" @click="pct = 100">Finish</button>
    <span s-text="pct + '%'"></span>
  </div>
</div>
```

## Driving the width

The bar is a `.s-progress` track with a single inner `<span>`. You never set a
value attribute; you set the span's width, and the CSS transition animates the
fill. Bind it with `:style` so the width tracks whatever number lives in state.

```summit
<div s-data="{ pct: 65 }">
  <div class="s-progress"><span :style="{ width: pct + '%' }"></span></div>
</div>
```

Keep the number inside `0` to `100`. Clamping with `Math.max` and `Math.min`
when you change it, as the demo above does, means a stray click can never push
the fill past either end.

## Spinner

`.s-spinner` is a standalone element for indeterminate waits, when you know work
is happening but not how far along it is. It needs no state and no inner markup,
just the class. Pair it with a label so the reason for the wait is clear.

```summit
<div class="s-row">
  <span class="s-spinner"></span>
  <span>Loading your workspace</span>
</div>
```

## Skeleton

`.s-skeleton` is a shimmering placeholder block. Give it an inline width and
height so it matches the shape of the content it is standing in for, then stack
several to preview a whole card or list row.

```summit
<div class="s-stack" style="max-width:280px">
  <div class="s-skeleton" style="height:1rem;width:80%"></div>
  <div class="s-skeleton" style="height:1rem;width:60%"></div>
  <div class="s-skeleton" style="height:1rem;width:70%"></div>
</div>
```

## Copy and paste

```html
<!-- Progress bar: width comes from state, not an attribute -->
<div s-data="{ pct: 40 }"
     role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="pct">
  <div class="s-progress">
    <span :style="{ width: pct + '%' }"></span>
  </div>
  <button class="s-btn s-btn-sm" @click="pct = Math.min(100, pct + 10)">Advance</button>
</div>

<!-- Spinner: indeterminate wait -->
<span class="s-spinner" role="status" aria-label="Loading"></span>

<!-- Skeleton: size it to match the missing content -->
<div class="s-skeleton" style="height:1rem;width:60%"></div>
```

## Notes

- The bar carries no semantics on its own. Add `role="progressbar"` with
  `aria-valuemin`, `aria-valuemax`, and a bound `:aria-valuenow` so screen
  readers announce the position, as the top demo does.
- Give the spinner `role="status"` and an `aria-label` so its purpose reaches
  people who cannot see it turn.
- Both the spinner's spin and the skeleton's shimmer stop under
  `prefers-reduced-motion`, so you do not need to disable them yourself.
- Once a load finishes, a [Toast](../comp-toast/) or an [Alert](../comp-alert/)
  is a good way to confirm the result. See all the pieces on the
  [UI Library overview](../components/).
