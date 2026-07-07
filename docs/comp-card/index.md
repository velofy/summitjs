# Card

> A surface for grouping content, with header, body, and footer.

A card is a bordered surface that groups related content into one block. Reach
for it whenever a chunk of the page deserves its own edges: a settings panel, a
pricing tier, a summary. It is pure markup, so there is nothing to wire up. You
compose a header, a body, and a footer, and use only the parts you need.

```summit
<div class="s-card" style="max-width:360px">
  <div class="s-card-header">
    <h3 class="s-card-title">Upgrade to Pro</h3>
    <p class="s-card-desc">Lift the project cap and add your whole team.</p>
  </div>
  <div class="s-card-body">
    You are on the Free plan, which tops out at three projects. Pro removes the
    limit and unlocks priority support.
  </div>
  <div class="s-card-footer">
    <button class="s-btn">Upgrade</button>
    <button class="s-btn s-btn-ghost">Maybe later</button>
  </div>
</div>
```

## Anatomy

A card is a `.s-card` wrapper around three optional regions, each with its own
padding so they line up without extra spacing rules.

- `.s-card-header` holds the `.s-card-title` and an optional `.s-card-desc`.
- `.s-card-body` is the main content area.
- `.s-card-footer` lays out actions in a row with a gap, ready for
  [buttons](../comp-button/).

The wrapper clips its corners with `overflow: hidden`, so a full-bleed image or a
colored bar as the first child follows the rounded edge cleanly.

## Body-only card

Drop the header and footer when all you need is a framed block of content.

```summit
<div class="s-card" style="max-width:360px">
  <div class="s-card-body">
    Every region is optional. A card with only a body is still a tidy, bordered
    surface you can drop anywhere in a grid.
  </div>
</div>
```

## Copy

```html
<div class="s-card">
  <div class="s-card-header">
    <h3 class="s-card-title">Upgrade to Pro</h3>
    <p class="s-card-desc">Lift the project cap and add your whole team.</p>
  </div>
  <div class="s-card-body">
    You are on the Free plan, which tops out at three projects.
  </div>
  <div class="s-card-footer">
    <button class="s-btn">Upgrade</button>
    <button class="s-btn s-btn-ghost">Maybe later</button>
  </div>
</div>
```

## Notes

- The card sets a width of whatever it sits in, so control its size from the
  parent layout (a grid, a flex row, or a `max-width` like the demos above).
- The title renders as an `h3` here, but the class carries the styling. Use the
  heading level that fits your document outline.
- Footer actions align to the start. To push them to the right, add your own
  `style="justify-content:flex-end"` or a utility class.

Pair cards with [badges](../comp-badge/) for status and
[avatars](../comp-avatar/) for people. See the full set on the
[overview](../components/).
